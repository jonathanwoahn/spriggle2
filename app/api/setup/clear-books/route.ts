import { NextResponse } from 'next/server';
import { db } from '@/db';
import { blockMetadata, jobs, collectionBooks, collections } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    const results: string[] = [];

    // Clear tables using Drizzle
    try {
      await db.delete(blockMetadata);
      results.push('Cleared block_metadata');
    } catch {
      results.push('Skipped block_metadata');
    }

    try {
      await db.delete(jobs);
      results.push('Cleared jobs');
    } catch {
      results.push('Skipped jobs');
    }

    try {
      await db.delete(collectionBooks);
      results.push('Cleared collection_books');
    } catch {
      results.push('Skipped collection_books');
    }

    try {
      await db.delete(collections);
      results.push('Cleared collections');
    } catch {
      results.push('Skipped collections');
    }

    // Reset sequences
    try {
      await db.execute(sql`SELECT setval('block_metadata_id_seq', 1, false)`);
      await db.execute(sql`SELECT setval('collections_id_seq', 1, false)`);
      await db.execute(sql`SELECT setval('collection_books_id_seq', 1, false)`);
    } catch {
      // Sequences might not exist
    }

    return NextResponse.json({
      success: true,
      message: 'Book-related tables cleared',
      results,
    });
  } catch (error) {
    console.error('Clear books error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear tables' },
      { status: 500 }
    );
  }
}
