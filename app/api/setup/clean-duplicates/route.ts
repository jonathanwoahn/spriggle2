import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET - Check for duplicate books
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured' },
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Find duplicate books (same book_id, type='book')
    const duplicates = await sql`
      SELECT book_id, COUNT(*) as count
      FROM block_metadata
      WHERE type = 'book'
      GROUP BY book_id
      HAVING COUNT(*) > 1
    `;

    return NextResponse.json({
      success: true,
      duplicates: duplicates.map(d => ({
        bookId: d.book_id,
        count: Number(d.count),
      })),
      totalDuplicateBooks: duplicates.length,
    });
  } catch (error) {
    console.error('Check duplicates error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}

// POST - Clean up duplicate books (keep newest)
export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured' },
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Delete duplicate book entries, keeping the one with the highest id (newest)
    const result = await sql`
      DELETE FROM block_metadata
      WHERE type = 'book'
      AND id NOT IN (
        SELECT MAX(id)
        FROM block_metadata
        WHERE type = 'book'
        GROUP BY book_id
      )
    `;

    // Also clean up duplicate section entries
    const sectionResult = await sql`
      DELETE FROM block_metadata
      WHERE type = 'section'
      AND id NOT IN (
        SELECT MAX(id)
        FROM block_metadata
        WHERE type = 'section'
        GROUP BY book_id, section_order
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Duplicates cleaned up',
      booksRemoved: result.length || 0,
      sectionsRemoved: sectionResult.length || 0,
    });
  } catch (error) {
    console.error('Clean duplicates error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clean duplicates' },
      { status: 500 }
    );
  }
}
