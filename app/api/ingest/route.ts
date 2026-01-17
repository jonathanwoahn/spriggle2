import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk/v3';
import { db } from '@/db';
import { ingestionStatus, omnipubs, bookVoices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ingestBook } from '@/src/trigger/tasks/ingest-book';
import type { TTSProvider, TTSModel } from '@/lib/tts-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookIds, voiceId, voiceName, provider, model, selectedSections } = body as {
      bookIds: string[];
      voiceId: string;
      voiceName?: string;
      provider: TTSProvider;
      model?: TTSModel;
      selectedSections?: Record<string, number[]>; // Map of bookId -> section orders
    };

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one book ID is required' },
        { status: 400 }
      );
    }

    if (!voiceId) {
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      );
    }

    if (!provider || !['elevenlabs', 'openai'].includes(provider)) {
      return NextResponse.json(
        { error: 'Valid provider is required (elevenlabs or openai)' },
        { status: 400 }
      );
    }

    const results = [];

    for (const bookId of bookIds) {
      // Check if already ingested in omnipubs table
      const existingOmnipub = await db.select()
        .from(omnipubs)
        .where(and(eq(omnipubs.uuid, bookId), eq(omnipubs.ready, true)))
        .limit(1);

      // Check if this voice/provider combo already exists for this book
      const existingVoice = await db.select()
        .from(bookVoices)
        .where(and(
          eq(bookVoices.bookId, bookId),
          eq(bookVoices.voiceId, voiceId),
          eq(bookVoices.provider, provider),
          eq(bookVoices.status, 'completed')
        ))
        .limit(1);

      // Skip if both omnipub is ready AND this voice version is completed
      if (existingOmnipub.length > 0 && existingVoice.length > 0) {
        results.push({
          bookId,
          status: 'already_ingested',
          message: 'Book already ingested with this voice',
        });
        continue;
      }

      // Check if already ingesting
      const existing = await db.select()
        .from(ingestionStatus)
        .where(eq(ingestionStatus.bookId, bookId));

      if (existing.length > 0 && existing[0].status === 'in_progress') {
        results.push({
          bookId,
          status: 'already_ingesting',
          message: 'Book is already being ingested',
        });
        continue;
      }

      // Create or update ingestion status
      if (existing.length > 0) {
        await db.update(ingestionStatus)
          .set({
            status: 'pending',
            error: null,
            completedSections: 0,
            startedAt: null,
            completedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(ingestionStatus.bookId, bookId));
      } else {
        await db.insert(ingestionStatus).values({
          bookId,
          status: 'pending',
        });
      }

      // Trigger the ingestion task
      // Include selected sections if provided for this book
      const bookSelectedSections = selectedSections?.[bookId];
      const handle = await tasks.trigger<typeof ingestBook>(
        'ingest-book',
        { bookId, voiceId, voiceName, provider, model, selectedSections: bookSelectedSections }
      );

      // Update with trigger run ID
      await db.update(ingestionStatus)
        .set({ triggerRunId: handle.id })
        .where(eq(ingestionStatus.bookId, bookId));

      results.push({
        bookId,
        status: 'queued',
        runId: handle.id,
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Failed to start ingestion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start ingestion' },
      { status: 500 }
    );
  }
}
