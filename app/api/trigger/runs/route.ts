import { NextRequest, NextResponse } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import { db } from '@/db';
import { ingestionStatus } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get all ingestion statuses with their trigger run IDs
    const statuses = await db.select()
      .from(ingestionStatus)
      .orderBy(desc(ingestionStatus.updatedAt))
      .limit(50);

    // For each status with a triggerRunId, try to get the run details
    const enrichedStatuses = await Promise.all(
      statuses.map(async (status) => {
        let runDetails = null;

        if (status.triggerRunId) {
          try {
            const run = await runs.retrieve(status.triggerRunId);
            runDetails = {
              id: run.id,
              status: run.status,
              taskIdentifier: run.taskIdentifier,
              createdAt: run.createdAt,
              updatedAt: run.updatedAt,
              startedAt: run.startedAt,
              finishedAt: run.finishedAt,
              isCompleted: run.isCompleted,
              isSuccess: run.isSuccess,
              isFailed: run.isFailed,
              isExecuting: run.isExecuting,
              isCancelled: run.isCancelled,
              error: run.error,
            };
          } catch (e) {
            // Run not found or API error
            console.error(`Failed to fetch run ${status.triggerRunId}:`, e);
          }
        }

        return {
          ...status,
          triggerRun: runDetails,
        };
      })
    );

    return NextResponse.json({
      statuses: enrichedStatuses,
      count: enrichedStatuses.length,
    });
  } catch (error) {
    console.error('Failed to fetch trigger runs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch runs' },
      { status: 500 }
    );
  }
}

// Cancel queued/pending runs
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cancelAll = searchParams.get('all') === 'true';
    const runId = searchParams.get('runId');

    if (runId) {
      // Cancel a specific run
      const cancelled = await runs.cancel(runId);

      // Update local status
      await db.update(ingestionStatus)
        .set({ status: 'failed', error: 'Cancelled by user' })
        .where(eq(ingestionStatus.triggerRunId, runId));

      return NextResponse.json({ cancelled: 1, run: cancelled });
    }

    if (cancelAll) {
      // List and cancel queued runs
      const queuedRuns = await runs.list({
        status: ['QUEUED', 'PENDING_VERSION', 'EXECUTING', 'DELAYED'],
        limit: 100,
      });

      let cancelledCount = 0;
      const errors: string[] = [];

      for (const run of queuedRuns.data) {
        try {
          await runs.cancel(run.id);
          cancelledCount++;

          // Update local status
          if (run.id) {
            await db.update(ingestionStatus)
              .set({ status: 'failed', error: 'Cancelled by user' })
              .where(eq(ingestionStatus.triggerRunId, run.id));
          }
        } catch (e) {
          errors.push(`Failed to cancel ${run.id}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }

      return NextResponse.json({
        cancelled: cancelledCount,
        total: queuedRuns.data.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    return NextResponse.json(
      { error: 'Specify runId or all=true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to cancel runs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel runs' },
      { status: 500 }
    );
  }
}
