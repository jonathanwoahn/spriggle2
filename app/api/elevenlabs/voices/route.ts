import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appSettings, voices as voicesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ElevenLabs } from '@/lib/elevenlabs';

// GET - Fetch voices from database (already synced)
export async function GET() {
  try {
    // First try to get voices from database
    const dbVoices = await db.select()
      .from(voicesTable)
      .where(eq(voicesTable.isActive, true));

    if (dbVoices.length > 0) {
      // Return voices from database
      const sortedVoices = dbVoices.sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json({
        voices: sortedVoices,
        count: sortedVoices.length,
        source: 'database',
      });
    }

    // If no voices in DB, fetch from ElevenLabs directly
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'elevenLabsApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please configure it in Settings.' },
        { status: 400 }
      );
    }

    const elevenLabs = new ElevenLabs(apiKeySetting[0].value);
    const voices = await elevenLabs.getVoices();

    // Sort voices by name
    const sortedVoices = voices.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      voices: sortedVoices.map(v => ({
        voiceId: v.voice_id,
        name: v.name,
        description: v.description,
        previewUrl: v.preview_url,
        labels: v.labels,
        category: v.category,
      })),
      count: voices.length,
      source: 'elevenlabs_api',
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

// POST - Sync voices from ElevenLabs to database
export async function POST() {
  try {
    // Get ElevenLabs API key from database
    const apiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'elevenLabsApiKey'));

    if (!apiKeySetting.length || !apiKeySetting[0].value) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please configure it in Settings.' },
        { status: 400 }
      );
    }

    const elevenLabs = new ElevenLabs(apiKeySetting[0].value);
    const voices = await elevenLabs.getVoices();

    let synced = 0;
    let updated = 0;

    for (const voice of voices) {
      // Check if voice already exists
      const existing = await db.select()
        .from(voicesTable)
        .where(eq(voicesTable.voiceId, voice.voice_id))
        .limit(1);

      if (existing.length > 0) {
        // Update existing voice
        await db.update(voicesTable)
          .set({
            name: voice.name,
            description: voice.description,
            previewUrl: voice.preview_url,
            labels: voice.labels,
            updatedAt: new Date(),
          })
          .where(eq(voicesTable.voiceId, voice.voice_id));
        updated++;
      } else {
        // Insert new voice
        await db.insert(voicesTable).values({
          voiceId: voice.voice_id,
          name: voice.name,
          description: voice.description,
          previewUrl: voice.preview_url,
          ownerType: 'elevenlabs',
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
