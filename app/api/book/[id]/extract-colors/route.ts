import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { omnipubs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractColorsForBook, CoverColors } from '@/lib/extract-colors';

/**
 * GET /api/book/[id]/extract-colors
 *
 * Extracts colors from a book's cover image and saves them to the database.
 * Returns cached colors if they already exist.
 *
 * Query params:
 * - force=true: Re-extract colors even if cached
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const forceExtract = request.nextUrl.searchParams.get('force') === 'true';

    // Check if book exists in omnipubs
    const existingBook = await db
      .select()
      .from(omnipubs)
      .where(eq(omnipubs.uuid, id))
      .limit(1);

    if (existingBook.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = existingBook[0];

    // Return cached colors if available and not forcing re-extraction
    if (book.coverColors && !forceExtract) {
      return NextResponse.json({
        colors: book.coverColors as CoverColors,
        cached: true,
      });
    }

    // Extract colors from cover image
    const colors = await extractColorsForBook(id);

    // Save to database
    await db
      .update(omnipubs)
      .set({
        coverColors: colors,
        updatedAt: new Date(),
      })
      .where(eq(omnipubs.uuid, id));

    return NextResponse.json({
      colors,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error extracting colors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
