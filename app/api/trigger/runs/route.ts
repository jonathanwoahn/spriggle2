import { NextRequest, NextResponse } from 'next/server';
import { runs } from '@trigger.dev/sdk/v3';
import { db } from '@/db';
import { ingestionStatus } from '@/db/schema';
import { desc } from 'drizzle-orm';

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
