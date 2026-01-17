import { NextRequest, NextResponse } from 'next/server';
import { markStepComplete, SetupStep } from '@/lib/setup';
import { db } from '@/db';
import { appSettings, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step, data } = body as { step: SetupStep; data?: Record<string, unknown> };

    switch (step) {
      case 'database':
        // Database connection verified by reaching this point
        await markStepComplete('database');
        break;

      case 'admin':
        // Create admin user
        if (!data?.email || !data?.password) {
          return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400 }
          );
        }

        const existingUser = await db.select()
          .from(users)
          .where(eq(users.email, data.email as string));

        if (existingUser.length > 0) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 400 }
          );
        }

        const passwordHash = await bcrypt.hash(data.password as string, 10);
        await db.insert(users).values({
          id: uuidv4(),
          email: data.email as string,
          passwordHash,
          role: 'admin',
        });

        await markStepComplete('admin');
        break;

      case 'api_keys':
        // Save API keys to database using upsert
        const apiKeys = [
          { key: 'cashmereApiKey', value: data?.cashmereApiKey, field: 'Cashmere API Key', description: 'API key for Cashmere/Omnibk.ai content access' },
          { key: 'elevenLabsApiKey', value: data?.elevenLabsApiKey, field: 'ElevenLabs API Key', description: 'API key for ElevenLabs text-to-speech' },
          { key: 'openAiApiKey', value: data?.openAiApiKey, field: 'OpenAI API Key', description: 'API key for OpenAI embeddings and summaries' },
        ];

        for (const setting of apiKeys) {
          if (setting.value) {
            // Use upsert pattern - insert or update on conflict
            await db.insert(appSettings)
              .values({
                key: setting.key,
                value: setting.value as string,
                field: setting.field,
                description: setting.description,
                type: 'string',
                order: apiKeys.indexOf(setting),
              })
              .onConflictDoUpdate({
                target: appSettings.key,
                set: { value: setting.value as string },
              });
          }
        }

        await markStepComplete('api_keys');
        break;

      case 'complete':
        await markStepComplete('complete');

        // Return response with cookie to set
        const response = NextResponse.json({ success: true, step });
        response.cookies.set('setup_complete', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
        return response;

      default:
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, step });
  } catch (error) {
    console.error('Setup step error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete step' },
      { status: 500 }
    );
  }
}
