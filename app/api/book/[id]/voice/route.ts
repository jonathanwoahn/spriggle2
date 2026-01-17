import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookVoices } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;

    const voice = await db.select()
      .from(bookVoices)
      .where(eq(bookVoices.bookId, bookId));

    if (!voice.length) {
      return NextResponse.json({ voice: null });
    }

    return NextResponse.json({ voice: voice[0] });
  } catch (error) {
    console.error('Failed to get book voice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get book voice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
    const body = await request.json();
    const { voiceId, voiceName } = body;

    if (!voiceId) {
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.select()
      .from(bookVoices)
      .where(eq(bookVoices.bookId, bookId));

    if (existing.length > 0) {
      await db.update(bookVoices)
        .set({ voiceId, voiceName })
        .where(eq(bookVoices.bookId, bookId));
    } else {
      await db.insert(bookVoices).values({
        bookId,
        voiceId,
        voiceName,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to set book voice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set book voice' },
      { status: 500 }
    );
  }
}
