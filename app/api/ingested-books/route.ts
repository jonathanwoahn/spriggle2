import { db } from "@/db";
import { omnipubs, ingestionStatus } from "@/db/schema";
import { eq, desc, sql, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const searchVal = searchParams.get('search');
    const limitVal = parseInt(searchParams.get('limit') || '100');
    const offsetVal = parseInt(searchParams.get('offset') || '0');

    // Build the query for books from omnipubs table
    let baseQuery = db
      .select({
        id: omnipubs.id,
        uuid: omnipubs.uuid,
        title: omnipubs.title,
        subtitle: omnipubs.subtitle,
        creators: omnipubs.creators,
        publisher: omnipubs.publisher,
        coverImage: omnipubs.coverImage,
        coverColors: omnipubs.coverColors,
        summary: omnipubs.summary,
        totalDuration: omnipubs.totalDuration,
        ready: omnipubs.ready,
        createdAt: omnipubs.createdAt,
        // Ingestion status fields
        ingestionId: ingestionStatus.id,
        status: ingestionStatus.status,
        totalSections: ingestionStatus.totalSections,
        completedSections: ingestionStatus.completedSections,
        ingestionError: ingestionStatus.error,
        startedAt: ingestionStatus.startedAt,
        completedAt: ingestionStatus.completedAt,
      })
      .from(omnipubs)
      .leftJoin(ingestionStatus, eq(omnipubs.uuid, ingestionStatus.bookId))
      .orderBy(desc(omnipubs.createdAt))
      .limit(limitVal)
      .offset(offsetVal);

    // Add search filter if provided
    let books;
    if (searchVal && searchVal.trim()) {
      const searchPattern = `%${searchVal}%`;
      books = await db
        .select({
          id: omnipubs.id,
          uuid: omnipubs.uuid,
          title: omnipubs.title,
          subtitle: omnipubs.subtitle,
          creators: omnipubs.creators,
          publisher: omnipubs.publisher,
          coverImage: omnipubs.coverImage,
          coverColors: omnipubs.coverColors,
          summary: omnipubs.summary,
          totalDuration: omnipubs.totalDuration,
          ready: omnipubs.ready,
          createdAt: omnipubs.createdAt,
          ingestionId: ingestionStatus.id,
          status: ingestionStatus.status,
          totalSections: ingestionStatus.totalSections,
          completedSections: ingestionStatus.completedSections,
          ingestionError: ingestionStatus.error,
          startedAt: ingestionStatus.startedAt,
          completedAt: ingestionStatus.completedAt,
        })
        .from(omnipubs)
        .leftJoin(ingestionStatus, eq(omnipubs.uuid, ingestionStatus.bookId))
        .where(
          or(
            like(omnipubs.title, searchPattern),
            like(omnipubs.subtitle, searchPattern)
          )
        )
        .orderBy(desc(omnipubs.createdAt))
        .limit(limitVal)
        .offset(offsetVal);
    } else {
      books = await baseQuery;
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(omnipubs);

    // Transform the data to match the expected format
    const items = books.map(book => ({
      id: book.id,
      bookId: book.uuid,
      blockId: book.uuid, // For backward compatibility
      title: book.title || 'Unknown',
      subtitle: book.subtitle || null,
      creators: (book.creators as string[]) || [],
      publisher: book.publisher || null,
      coverImage: book.coverImage || null,
      duration: book.totalDuration || 0,
      ready: book.ready === true,
      summary: book.summary || null,
      coverColors: book.coverColors,
      createdAt: book.createdAt,
      ingestion: book.ingestionId ? {
        status: book.status,
        totalSections: book.totalSections,
        completedSections: book.completedSections,
        error: book.ingestionError,
        startedAt: book.startedAt,
        completedAt: book.completedAt,
        progress: book.totalSections
          ? Math.round((book.completedSections || 0) / book.totalSections * 100)
          : 0,
      } : null,
    }));

    return NextResponse.json({ items, count });
  } catch (e) {
    console.error('Error fetching ingested books:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
};
