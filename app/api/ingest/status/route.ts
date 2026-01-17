import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ingestionStatus } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const statuses = await db.select()
      .from(ingestionStatus)
      .orderBy(desc(ingestionStatus.updatedAt))
      .limit(50);

    return NextResponse.json({
      statuses: statuses.map(s => ({
        bookId: s.bookId,
        status: s.status,
        triggerRunId: s.triggerRunId,
        totalSections: s.totalSections,
        completedSections: s.completedSections,
        error: s.error,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        progress: s.totalSections && s.totalSections > 0
          ? Math.round((s.completedSections || 0) / s.totalSections * 100)
          : 0,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch ingestion statuses:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch statuses' },
      { status: 500 }
    );
  }
}
