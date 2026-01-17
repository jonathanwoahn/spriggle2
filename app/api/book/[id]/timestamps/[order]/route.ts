import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blockTimestamps } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; order: string }> }
) {
  try {
    const { id: bookId, order } = await params;
    const sectionOrder = parseInt(order, 10);

    if (isNaN(sectionOrder)) {
      return NextResponse.json(
        { error: 'Invalid section order' },
        { status: 400 }
      );
    }

    const timestamps = await db.select()
      .from(blockTimestamps)
      .where(and(
        eq(blockTimestamps.bookId, bookId),
        eq(blockTimestamps.sectionOrder, sectionOrder)
      ))
      .orderBy(blockTimestamps.startTimeMs);

    return NextResponse.json({
      timestamps: timestamps.map(t => ({
        blockId: t.blockId,
        startTimeMs: t.startTimeMs,
        endTimeMs: t.endTimeMs,
        characterStart: t.characterStart,
        characterEnd: t.characterEnd,
      })),
      count: timestamps.length,
    });
  } catch (error) {
    console.error('Failed to fetch timestamps:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch timestamps' },
      { status: 500 }
    );
  }
}
