import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appSettings, voices as voicesTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { OpenAITTSService } from '@/lib/openai-tts-service';
import type { TTSProvider, OpenAIModel } from '@/lib/tts-models';

/**
 * GET - Fetch voices for a specific provider
 *
 * Query params:
 *   - provider: 'elevenlabs' | 'openai' (default: 'openai')
 *   - model: (optional) For OpenAI, filter voices by model compatibility
 *            e.g., 'tts-1', 'tts-1-hd', 'gpt-4o-mini-tts'
 *
 * For OpenAI: Returns voices filtered by model (or all 13 if no model specified)
 * For ElevenLabs: Returns voices from database (synced) or API
 */
export async function GET(req: NextRequest) {
  try {
    const provider = (req.nextUrl.searchParams.get('provider') || 'openai') as TTSProvider;
    const model = req.nextUrl.searchParams.get('model') as OpenAIModel | null;

    if (provider === 'openai') {
      // OpenAI has predefined voices - return static list filtered by model
      const voices = OpenAITTSService.getVoices(model || undefined).map(voice => ({
        voiceId: voice.voiceId,
        provider: 'openai',
        name: voice.name,
        description: voice.description,
        previewUrl: null,
        ownerType: 'stock',
        labels: null,
        isActive: true,
      }));

      return NextResponse.json({
        voices,
        count: voices.length,
        source: 'static',
        provider: 'openai',
        model: model || 'all',
      });
    }

    // ElevenLabs - get from database
    const dbVoices = await db.select()
      .from(voicesTable)
      .where(and(
        eq(voicesTable.isActive, true),
        eq(voicesTable.provider, 'elevenlabs')
      ));

    if (dbVoices.length > 0) {
      const sortedVoices = dbVoices.sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json({
        voices: sortedVoices,
        count: sortedVoices.length,
        source: 'database',
        provider: 'elevenlabs',
      });
    }

    // If no voices in DB, fetch from ElevenLabs API
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'elevenLabsApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please configure it in Settings.' },
        { status: 400 }
      );
    }

    const { ElevenLabs } = await import('@/lib/elevenlabs');
    const elevenLabs = new ElevenLabs(apiKeySetting[0].value);
    const voices = await elevenLabs.getVoices();

    const sortedVoices = voices.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      voices: sortedVoices.map(v => ({
        voiceId: v.voice_id,
        provider: 'elevenlabs',
        name: v.name,
        description: v.description,
        previewUrl: v.preview_url,
        labels: v.labels,
        ownerType: 'stock',
      })),
      count: voices.length,
      source: 'elevenlabs_api',
      provider: 'elevenlabs',
      message: 'Voices fetched from ElevenLabs. Use POST to sync to database.',
    });
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}

/**
 * POST - Sync voices from provider to database
 *
 * Body:
 *   - provider: 'elevenlabs' | 'openai'
 *
 * For OpenAI: Seeds the database with the 6 predefined voices
 * For ElevenLabs: Syncs voices from the ElevenLabs API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = (body.provider || 'elevenlabs') as TTSProvider;

    if (provider === 'openai') {
      // Seed OpenAI voices into database
      const openaiVoices = OpenAITTSService.getVoices();
      let synced = 0;
      let updated = 0;

      for (const voice of openaiVoices) {
        const existing = await db.select()
          .from(voicesTable)
          .where(and(
            eq(voicesTable.voiceId, voice.voiceId),
            eq(voicesTable.provider, 'openai')
          ))
          .limit(1);

        if (existing.length > 0) {
          await db.update(voicesTable)
            .set({
              name: voice.name,
              description: voice.description,
              updatedAt: new Date(),
            })
            .where(and(
              eq(voicesTable.voiceId, voice.voiceId),
              eq(voicesTable.provider, 'openai')
            ));
          updated++;
        } else {
          await db.insert(voicesTable).values({
            voiceId: voice.voiceId,
            provider: 'openai',
            name: voice.name,
            description: voice.description,
            ownerType: 'stock',
            isActive: true,
          });
          synced++;
        }
      }

      return NextResponse.json({
        success: true,
        synced,
        updated,
        total: openaiVoices.length,
        provider: 'openai',
        message: `Synced ${synced} new voices, updated ${updated} existing voices`,
      });
    }

    // ElevenLabs sync
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'elevenLabsApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please configure it in Settings.' },
        { status: 400 }
      );
    }

    const { ElevenLabs } = await import('@/lib/elevenlabs');
    const elevenLabs = new ElevenLabs(apiKeySetting[0].value);
    const voices = await elevenLabs.getVoices();

    let synced = 0;
    let updated = 0;

    for (const voice of voices) {
      const existing = await db.select()
        .from(voicesTable)
        .where(and(
          eq(voicesTable.voiceId, voice.voice_id),
          eq(voicesTable.provider, 'elevenlabs')
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(voicesTable)
          .set({
            name: voice.name,
            description: voice.description,
            previewUrl: voice.preview_url,
            labels: voice.labels,
            updatedAt: new Date(),
          })
          .where(and(
            eq(voicesTable.voiceId, voice.voice_id),
            eq(voicesTable.provider, 'elevenlabs')
          ));
        updated++;
      } else {
        await db.insert(voicesTable).values({
          voiceId: voice.voice_id,
          provider: 'elevenlabs',
          name: voice.name,
          description: voice.description,
          previewUrl: voice.preview_url,
          ownerType: 'stock',
          labels: voice.labels,
          isActive: true,
        });
        synced++;
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      updated,
      total: voices.length,
      provider: 'elevenlabs',
      message: `Synced ${synced} new voices, updated ${updated} existing voices`,
    });
  } catch (error) {
    console.error('Failed to sync voices:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync voices' },
      { status: 500 }
    );
  }
}
