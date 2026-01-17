import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ingestionStatus } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    const status = await db.select()
      .from(ingestionStatus)
      .where(eq(ingestionStatus.bookId, bookId));

    if (!status.length) {
      return NextResponse.json({
        status: 'not_started',
        bookId,
      });
    }

    const s = status[0];
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Failed to fetch ingestion status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
