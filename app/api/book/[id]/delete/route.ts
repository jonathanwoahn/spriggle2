import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  blockTimestamps,
  blockMetadata,
  bookVoices,
  reporting,
  collectionBooks,
  jobs,
  ingestionStatus,
  omnipubs,
} from '@/db/schema';
import { eq, like, sql } from 'drizzle-orm';
import { deleteDirectory, listFiles } from '@/lib/storage';
import { runs } from '@trigger.dev/sdk/v3';

interface DeleteResult {
  success: boolean;
  bookId: string;
  deletedData: {
    blockTimestamps: number;
    blockMetadata: number;
    bookVoices: number;
    reporting: number;
    collectionBooks: number;
    jobs: number;
    ingestionStatus: number;
    omnipubs: number;
    r2Files: number;
  };
  cancelledTasks: number;
  errors: string[];
  duration: number;
}

/**
 * Cancel any running Trigger.dev tasks for this book
 */
async function cancelTriggerTasks(bookId: string): Promise<{ cancelled: number; errors: string[] }> {
  const errors: string[] = [];
  let cancelled = 0;

  try {
    // Get the run ID from ingestion status
    const ingestion = await db.select()
      .from(ingestionStatus)
      .where(eq(ingestionStatus.bookId, bookId))
      .limit(1);

    if (ingestion.length > 0 && ingestion[0].triggerRunId) {
      const runId = ingestion[0].triggerRunId;

      try {
        await runs.cancel(runId);
        cancelled++;
      } catch (error) {
        // Run might already be completed or not exist
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        if (!errorMsg.includes('already') && !errorMsg.includes('not found')) {
          errors.push(`Failed to cancel run ${runId}: ${errorMsg}`);
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to cancel trigger tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { cancelled, errors };
}

/**
 * DELETE /api/book/[id]/delete
 * Deletes a book and all associated data from the database and R2 storage
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const start = Date.now();
  const { id: bookId } = await params;
  const errors: string[] = [];
  const deletedData = {
    blockTimestamps: 0,
    blockMetadata: 0,
    bookVoices: 0,
    reporting: 0,
    collectionBooks: 0,
    jobs: 0,
    ingestionStatus: 0,
    omnipubs: 0,
    r2Files: 0,
  };

  try {
    // Step 1: Cancel any running Trigger.dev tasks
    const { cancelled: cancelledTasks, errors: triggerErrors } = await cancelTriggerTasks(bookId);
    errors.push(...triggerErrors);

    // Step 2: Delete R2 files
    // Audio files are stored under {bookId}/{voiceId}/section-{order}.mp3
    // So we need to delete everything under {bookId}/
    try {
      const files = await listFiles(`${bookId}/`);
      if (files.length > 0) {
        const result = await deleteDirectory(`${bookId}/`);
        deletedData.r2Files = result.deleted;
        if (result.errors.length > 0) {
          errors.push(...result.errors.map(e => `R2: ${e}`));
        }
      }
    } catch (error) {
      errors.push(`R2 deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 3: Delete database records in correct order (respecting foreign keys)

    // 3a: blockTimestamps
    try {
      const result = await db.delete(blockTimestamps)
        .where(eq(blockTimestamps.bookId, bookId));
      deletedData.blockTimestamps = result.rowCount || 0;
    } catch (error) {
      errors.push(`blockTimestamps: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3b: blockMetadata
    try {
      const result = await db.delete(blockMetadata)
        .where(eq(blockMetadata.bookId, bookId));
      deletedData.blockMetadata = result.rowCount || 0;
    } catch (error) {
      errors.push(`blockMetadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3c: bookVoices
    try {
      const result = await db.delete(bookVoices)
        .where(eq(bookVoices.bookId, bookId));
      deletedData.bookVoices = result.rowCount || 0;
    } catch (error) {
      errors.push(`bookVoices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3d: reporting (uses blockId, which is the bookId for book-level reports)
    try {
      const result = await db.delete(reporting)
        .where(eq(reporting.blockId, bookId));
      deletedData.reporting = result.rowCount || 0;
    } catch (error) {
      errors.push(`reporting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3e: collectionBooks
    try {
      const result = await db.delete(collectionBooks)
        .where(eq(collectionBooks.bookId, bookId));
      deletedData.collectionBooks = result.rowCount || 0;
    } catch (error) {
      errors.push(`collectionBooks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3f: jobs (bookId is stored in JSON data field)
    try {
      const result = await db.delete(jobs)
        .where(sql`${jobs.data}->>'bookId' = ${bookId}`);
      deletedData.jobs = result.rowCount || 0;
    } catch (error) {
      errors.push(`jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3g: ingestionStatus
    try {
      const result = await db.delete(ingestionStatus)
        .where(eq(ingestionStatus.bookId, bookId));
      deletedData.ingestionStatus = result.rowCount || 0;
    } catch (error) {
      errors.push(`ingestionStatus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3h: omnipubs (main book record - delete last)
    try {
      const result = await db.delete(omnipubs)
        .where(eq(omnipubs.uuid, bookId));
      deletedData.omnipubs = result.rowCount || 0;
    } catch (error) {
      errors.push(`omnipubs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const totalDeleted = Object.values(deletedData).reduce((a, b) => a + b, 0);

    const result: DeleteResult = {
      success: errors.length === 0,
      bookId,
      deletedData,
      cancelledTasks,
      errors,
      duration: Date.now() - start,
    };

    return NextResponse.json(result, {
      status: errors.length === 0 ? 200 : totalDeleted > 0 ? 207 : 500,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      bookId,
      error: error instanceof Error ? error.message : 'Deletion failed',
      duration: Date.now() - start,
    }, { status: 500 });
  }
}
