import { IResponse } from "@/lib/types";
import { db } from "@/db";
import { blockMetadata, omnipubs, blockTimestamps, bookVoices } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Creates new block metadata
export const POST = async (
  req: NextRequest,
): Promise<NextResponse<IResponse>> => {
  try {
    const body = await req.json();

    const data = await db.insert(blockMetadata).values(body).returning();

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Upsert block metadata
export const PUT = async (
  req: NextRequest,
): Promise<NextResponse<IResponse>> => {
  try {
    const body = await req.json();

    // Handle both single object and array
    const items = Array.isArray(body) ? body : [body];

    const results = [];
    for (const item of items) {
      const result = await db
        .insert(blockMetadata)
        .values(item)
        .onConflictDoUpdate({
          target: [blockMetadata.blockId, blockMetadata.bookId],
          set: {
            sectionOrder: item.sectionOrder ?? item.section_order,
            blockIndex: item.blockIndex ?? item.block_index,
            type: item.type,
            data: item.data,
            embedding: item.embedding,
            updatedAt: new Date(),
          },
        })
        .returning();
      results.push(...result);
    }

    return NextResponse.json({ data: results });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export const GET = async (
  req: NextRequest,
) => {
  try {
    const sp = req.nextUrl.searchParams;

    const blockId = sp.get('blockId');
    const bookId = sp.get('bookId');
    const type = sp.get('type');
    const sectionOrder = sp.get('sectionOrder');
    const limit = sp.get('limit');
    const limitNum = limit && !isNaN(parseInt(limit)) ? parseInt(limit) : undefined;

    // If querying for type=book, use omnipubs table instead
    if (type === 'book' && (blockId || bookId)) {
      const uuid = blockId || bookId;
      const book = await db
        .select()
        .from(omnipubs)
        .where(eq(omnipubs.uuid, uuid!))
        .limit(1);

      if (book.length === 0) {
        return NextResponse.json({ data: [], count: 0 });
      }

      // Transform omnipubs record to match expected blockMetadata format
      const omnipub = book[0];
      const transformedData = [{
        id: omnipub.id,
        bookId: omnipub.uuid,
        blockId: omnipub.uuid,
        sectionOrder: null,
        blockIndex: null,
        type: 'book',
        data: {
          title: omnipub.title,
          subtitle: omnipub.subtitle,
          creators: omnipub.creators,
          publisher: omnipub.publisher,
          cover_image: omnipub.coverImage,
          summary: omnipub.summary,
          ready: omnipub.ready,
          duration: omnipub.totalDuration,
          nav: omnipub.nav, // Include nav for chapters drawer
        },
        embedding: omnipub.embedding,
        coverColors: omnipub.coverColors,
        createdAt: omnipub.createdAt,
        updatedAt: omnipub.updatedAt,
      }];

      return NextResponse.json({ data: transformedData, count: 1 });
    }

    // If querying for type=text with a sectionOrder, use blockTimestamps table
    // This returns timing data for playback synchronization
    if (type === 'text' && bookId && sectionOrder) {
      // Get the default voice for this book
      const defaultVoice = await db
        .select()
        .from(bookVoices)
        .where(and(eq(bookVoices.bookId, bookId), eq(bookVoices.isDefault, true)))
        .limit(1);

      if (defaultVoice.length === 0) {
        // No voice recorded yet - book might not be ingested
        return NextResponse.json({ data: [], count: 0 });
      }

      const voiceId = defaultVoice[0].voiceId;

      // Fetch timestamps from blockTimestamps table
      const timestamps = await db
        .select()
        .from(blockTimestamps)
        .where(and(
          eq(blockTimestamps.bookId, bookId),
          eq(blockTimestamps.sectionOrder, parseInt(sectionOrder)),
          eq(blockTimestamps.voiceId, voiceId)
        ))
        .orderBy(asc(blockTimestamps.startTimeMs));

      // Transform to format expected by PlaybackReporter
      // PlaybackReporter expects: data.start_time (ms) and data.duration (ms)
      const transformedData = timestamps.map((ts, index) => ({
        id: ts.id,
        bookId: ts.bookId,
        blockId: ts.blockId,
        sectionOrder: ts.sectionOrder,
        blockIndex: index,
        type: 'text',
        data: {
          start_time: ts.startTimeMs,
          duration: ts.endTimeMs - ts.startTimeMs,
        },
        createdAt: ts.createdAt,
      }));

      return NextResponse.json({ data: transformedData, count: transformedData.length });
    }

    // If querying for type=section with a bookId, get sections that have audio from blockTimestamps
    if (type === 'section' && bookId) {
      // Get the default voice for this book
      const defaultVoice = await db
        .select()
        .from(bookVoices)
        .where(and(eq(bookVoices.bookId, bookId), eq(bookVoices.isDefault, true)))
        .limit(1);

      if (defaultVoice.length === 0) {
        // No voice recorded yet - book might not be ingested
        return NextResponse.json({ data: [], count: 0 });
      }

      const voiceId = defaultVoice[0].voiceId;

      // Get distinct sections that have timestamps (meaning they have audio)
      const sectionsWithAudio = await db
        .selectDistinct({ sectionOrder: blockTimestamps.sectionOrder })
        .from(blockTimestamps)
        .where(and(
          eq(blockTimestamps.bookId, bookId),
          eq(blockTimestamps.voiceId, voiceId)
        ))
        .orderBy(asc(blockTimestamps.sectionOrder));

      // For each section, calculate total duration from timestamps
      const sectionData = await Promise.all(
        sectionsWithAudio.map(async ({ sectionOrder }) => {
          const timestamps = await db
            .select({
              maxEnd: sql<number>`max(${blockTimestamps.endTimeMs})`,
            })
            .from(blockTimestamps)
            .where(and(
              eq(blockTimestamps.bookId, bookId),
              eq(blockTimestamps.sectionOrder, sectionOrder),
              eq(blockTimestamps.voiceId, voiceId)
            ));

          return {
            bookId,
            sectionOrder,
            type: 'section',
            data: {
              duration: timestamps[0]?.maxEnd || 0,
            },
          };
        })
      );

      return NextResponse.json({ data: sectionData, count: sectionData.length });
    }

    // For other queries, use blockMetadata table (legacy support)
    const conditions = [];

    if (blockId) {
      conditions.push(eq(blockMetadata.blockId, blockId));
    }

    if (bookId) {
      conditions.push(eq(blockMetadata.bookId, bookId));
    }

    if (type) {
      conditions.push(eq(blockMetadata.type, type));
    }

    if (sectionOrder) {
      conditions.push(eq(blockMetadata.sectionOrder, parseInt(sectionOrder)));
    }

    // Build and execute query
    let query = db
      .select()
      .from(blockMetadata)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(blockMetadata.blockIndex));

    if (limitNum) {
      query = query.limit(limitNum) as typeof query;
    }

    const data = await query;

    // Get count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(blockMetadata)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const count = Number(countResult[0]?.count || 0);

    return NextResponse.json({ data, count });
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message, count: 0 });
  }
}
