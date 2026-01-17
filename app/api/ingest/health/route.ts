import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface HealthCheckResult {
  status: 'ok' | 'error';
  message?: string;
  details?: Record<string, unknown>;
}

interface HealthResponse {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  checks: {
    database: HealthCheckResult;
    cashmere: HealthCheckResult;
    elevenlabs: HealthCheckResult;
    openai: HealthCheckResult;
    r2: HealthCheckResult;
  };
  timestamp: string;
}

async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    // Simple query to verify database connection
    await db.select().from(appSettings).limit(1);
    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkCashmere(): Promise<HealthCheckResult> {
  try {
    // Get API key
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return {
        status: 'error',
        message: 'Cashmere API key not configured',
      };
    }

    // Test API connectivity with a simple request
    const response = await fetch('https://cashmere.io/api/v2/omnipubs?limit=1', {
      headers: {
        Authorization: `Bearer ${apiKeySetting[0].value}`,
      },
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `Cashmere API returned ${response.status}: ${response.statusText}`,
      };
    }

    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Cashmere API check failed',
    };
  }
}

async function checkElevenLabs(): Promise<HealthCheckResult> {
  try {
    // Get API key
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'elevenLabsApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return {
        status: 'error',
        message: 'ElevenLabs API key not configured',
      };
    }

    // Test API connectivity by fetching user info
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': apiKeySetting[0].value,
      },
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `ElevenLabs API returned ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      status: 'ok',
      details: {
        characterCount: data.subscription?.character_count,
        characterLimit: data.subscription?.character_limit,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'ElevenLabs API check failed',
    };
  }
}

async function checkOpenAI(): Promise<HealthCheckResult> {
  try {
    // Get API key
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'openAiApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return {
        status: 'error',
        message: 'OpenAI API key not configured',
      };
    }

    // Test API connectivity by listing models
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKeySetting[0].value}`,
      },
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `OpenAI API returned ${response.status}: ${response.statusText}`,
      };
    }

    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'OpenAI API check failed',
    };
  }
}

async function checkR2(): Promise<HealthCheckResult> {
  try {
    // Check if R2 environment variables are configured
    if (!process.env.CLOUDFLARE_ACCOUNT_ID ||
        !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
        !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
        !process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      return {
        status: 'error',
        message: 'R2 storage environment variables not fully configured',
        details: {
          hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
          hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
          hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
          hasBucketName: !!process.env.CLOUDFLARE_R2_BUCKET_NAME,
        },
      };
    }

    // Test R2 connectivity by listing files with a test prefix
    const { listFiles } = await import('@/lib/storage');
    await listFiles('health-check-test/');

    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'R2 storage check failed',
    };
  }
}

export async function GET() {
  try {
    // Run all health checks in parallel
    const [database, cashmere, elevenlabs, openai, r2] = await Promise.all([
      checkDatabase(),
      checkCashmere(),
      checkElevenLabs(),
      checkOpenAI(),
      checkR2(),
    ]);

    const checks = { database, cashmere, elevenlabs, openai, r2 };

    // Determine overall health
    const results = Object.values(checks);
    const errorCount = results.filter(r => r.status === 'error').length;

    let overall: 'healthy' | 'unhealthy' | 'degraded';
    if (errorCount === 0) {
      overall = 'healthy';
    } else if (errorCount === results.length) {
      overall = 'unhealthy';
    } else {
      overall = 'degraded';
    }

    const response: HealthResponse = {
      overall,
      checks,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: overall === 'healthy' ? 200 : overall === 'degraded' ? 207 : 503,
    });
  } catch (error) {
    return NextResponse.json({
      overall: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
