import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface EnvConfig {
  databaseUrl?: string;
  cloudflareAccountId?: string;
  cloudflareR2AccessKeyId?: string;
  cloudflareR2SecretAccessKey?: string;
  cloudflareR2BucketName?: string;
}

const ENV_MAPPING: Record<keyof EnvConfig, string> = {
  databaseUrl: 'DATABASE_URL',
  cloudflareAccountId: 'CLOUDFLARE_ACCOUNT_ID',
  cloudflareR2AccessKeyId: 'CLOUDFLARE_R2_ACCESS_KEY_ID',
  cloudflareR2SecretAccessKey: 'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  cloudflareR2BucketName: 'CLOUDFLARE_R2_BUCKET_NAME',
};

export async function POST(request: NextRequest) {
  try {
    const config: EnvConfig = await request.json();

    // Validate required fields
    if (!config.databaseUrl) {
      return NextResponse.json(
        { error: 'Database URL is required' },
        { status: 400 }
      );
    }

    // Validate the database URL format
    if (!config.databaseUrl.startsWith('postgres://') && !config.databaseUrl.startsWith('postgresql://')) {
      return NextResponse.json(
        { error: 'Invalid database URL format. Must start with postgres:// or postgresql://' },
        { status: 400 }
      );
    }

    // Get the project root directory
    const projectRoot = process.cwd();
    const envLocalPath = path.join(projectRoot, '.env.local');

    // Read existing .env.local content if it exists
    let existingContent = '';
    try {
      existingContent = await fs.readFile(envLocalPath, 'utf-8');
    } catch {
      // File doesn't exist, that's fine
    }

    // Parse existing content into a map
    const envMap = new Map<string, string>();
    const lines = existingContent.split('\n');
    const otherLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex > 0) {
          const key = trimmed.substring(0, equalsIndex);
          const value = trimmed.substring(equalsIndex + 1);
          envMap.set(key, value);
        } else {
          otherLines.push(line);
        }
      } else {
        otherLines.push(line);
      }
    }

    // Update with new config values
    for (const [configKey, envKey] of Object.entries(ENV_MAPPING)) {
      const value = config[configKey as keyof EnvConfig];
      if (value) {
        envMap.set(envKey, value);
      }
    }

    // Build the new content
    const newLines: string[] = [
      '# Database (Neon PostgreSQL)',
      `DATABASE_URL=${envMap.get('DATABASE_URL') || ''}`,
      '',
      '# Storage (Cloudflare R2)',
      `CLOUDFLARE_ACCOUNT_ID=${envMap.get('CLOUDFLARE_ACCOUNT_ID') || ''}`,
      `CLOUDFLARE_R2_ACCESS_KEY_ID=${envMap.get('CLOUDFLARE_R2_ACCESS_KEY_ID') || ''}`,
      `CLOUDFLARE_R2_SECRET_ACCESS_KEY=${envMap.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY') || ''}`,
      `CLOUDFLARE_R2_BUCKET_NAME=${envMap.get('CLOUDFLARE_R2_BUCKET_NAME') || ''}`,
      '',
      '# Authentication (NextAuth.js)',
      `NEXTAUTH_SECRET=${envMap.get('NEXTAUTH_SECRET') || generateSecret()}`,
      `NEXTAUTH_URL=${envMap.get('NEXTAUTH_URL') || 'http://localhost:3010'}`,
      '',
    ];

    // Write the updated content
    const newContent = newLines.join('\n');
    await fs.writeFile(envLocalPath, newContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Configuration saved to .env.local. Please restart the development server.',
      requiresRestart: true,
    });
  } catch (error) {
    console.error('Failed to write .env.local:', error);

    // This will fail on Vercel/production
    if (error instanceof Error && (error.message.includes('EROFS') || error.message.includes('read-only'))) {
      return NextResponse.json({
        success: false,
        error: 'Cannot write to filesystem in production. Please set environment variables in your Vercel project settings.',
        isProduction: true,
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to write configuration' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check which env vars are configured
  const existing: Record<string, boolean> = {};

  for (const [configKey, envKey] of Object.entries(ENV_MAPPING)) {
    existing[configKey] = !!process.env[envKey];
  }

  const allConfigured = Object.values(existing).every(Boolean);

  return NextResponse.json({
    configured: allConfigured,
    existing,
    isProduction: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
  });
}

function generateSecret(): string {
  // Generate a random base64 secret for NextAuth
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}
