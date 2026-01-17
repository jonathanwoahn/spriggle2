import Cashmere from "@/lib/cashmere";
import { db } from "@/db";
import { appSettings, ingestionStatus } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    // Get Cashmere API key from settings
    const keyData = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'))
      .limit(1);

    if (!keyData.length || !keyData[0].value) {
      return NextResponse.json(
        { error: 'Cashmere API key not configured. Please set it in Admin > Settings.' },
        { status: 500 }
      );
    }

    const cash = new Cashmere(keyData[0].value);
    const searchParams = req.nextUrl.searchParams;

    const searchVal = searchParams.get('search');
    const limitVal = searchParams.get('limit');
    const offsetVal = searchParams.get('offset');
    const collectionVal = searchParams.get('collection');

    const viewModeVal = searchParams.get('view_mode');

    const qry = {
      limit: limitVal || '20',
      offset: offsetVal || '0',
      search: searchVal && searchVal !== 'null' ? searchVal : undefined,
      collection: collectionVal && collectionVal !== 'null' ? collectionVal : undefined,
      view_mode: viewModeVal || 'published', // Default to 'published' to show all available content
    };

    // Fetch from Cashmere API
    const catalogData = await cash.listOmnipubs(qry);

    // Get ingestion status for these books to show which ones are already ingested
    if (catalogData.items && catalogData.items.length > 0) {
      const bookIds = catalogData.items.map((item: any) => item.uuid);

      const statuses = await db
        .select()
        .from(ingestionStatus)
        .where(inArray(ingestionStatus.bookId, bookIds));

      // Create a map of bookId -> status
      const statusMap = new Map(statuses.map(s => [s.bookId, s]));

      // Add ingestion status to each item
      const itemsWithStatus = catalogData.items.map((item: any) => ({
        ...item,
        ingestionStatus: statusMap.get(item.uuid) || null,
      }));

      return NextResponse.json({
        items: itemsWithStatus,
        count: catalogData.count,
      });
    }

    return NextResponse.json(catalogData);
  } catch (e) {
    console.error('Error fetching catalog:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
};
