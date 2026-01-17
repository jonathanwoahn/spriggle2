import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ingestionStatus, omnipubs, bookVoices, blockTimestamps, reporting } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { runs } from '@trigger.dev/sdk/v3';

/**
 * POST /api/ingest/[bookId]/reset
 *
 * Resets ingestion for a book:
 * 1. Cancels any running Trigger.dev tasks
 * 2. Clears related data from all tables
 * 3. Allows re-triggering ingestion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    // 1. Get the current ingestion status to find any running Trigger.dev run
    const currentStatus = await db.select()
      .from(ingestionStatus)
      .where(eq(ingestionStatus.bookId, bookId))
      .limit(1);

    // 2. Try to cancel running Trigger.dev tasks
    if (currentStatus.length > 0 && currentStatus[0].triggerRunId) {
      try {
        await runs.cancel(currentStatus[0].triggerRunId);
        console.log(`Cancelled Trigger.dev run: ${currentStatus[0].triggerRunId}`);
      } catch (cancelError) {
        // Run may have already completed or failed - continue with cleanup
        console.log(`Could not cancel run (may be completed): ${cancelError}`);
      }
    }

    // 3. Clear related data from all tables
    // Delete in order to avoid foreign key issues

    // Clear block timestamps for this book
    await db.delete(blockTimestamps)
      .where(eq(blockTimestamps.bookId, bookId));

    // Clear book voices
    await db.delete(bookVoices)
      .where(eq(bookVoices.bookId, bookId));

    // Clear reporting entries for this book
    await db.delete(reporting)
      .where(eq(reporting.blockId, bookId));

    // Clear ingestion status
    await db.delete(ingestionStatus)
      .where(eq(ingestionStatus.bookId, bookId));

    // Clear omnipub entry (reset to allow re-ingestion)
    await db.delete(omnipubs)
      .where(eq(omnipubs.uuid, bookId));

    return NextResponse.json({
      success: true,
      message: `Ingestion reset for book ${bookId}. Ready for re-ingestion.`,
      bookId,
    });
  } catch (error) {
    console.error('Error resetting ingestion:', error);
    return NextResponse.json(
      { error: 'Failed to reset ingestion', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
