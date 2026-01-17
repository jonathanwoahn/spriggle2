import Cashmere from "@/lib/cashmere";
import { db } from "@/db";
import { appSettings, omnipubs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export interface SectionPreview {
  order: number;
  label: string;
  matter?: string;
  isBody: boolean;
  blockCount?: number;
}

/**
 * GET /api/book/[id]/sections
 *
 * Returns sections/nav items for a book with matter type detection.
 * Used by catalog page for section preview before ingestion.
 *
 * Query params:
 * - includeBlockCounts=true: Fetch block counts for each section (slower)
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const includeBlockCounts = request.nextUrl.searchParams.get('includeBlockCounts') === 'true';

    // Get Cashmere API key
    const settings = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'))
      .limit(1);

    const apiKey = settings[0]?.value || '';

    // Try Cashmere API first to get full nav data
    if (apiKey) {
      try {
        const cash = new Cashmere(apiKey);
        const book = await cash.getBook(id);

        if (!book.data.nav || book.data.nav.length === 0) {
          return NextResponse.json({
            sections: [],
            message: 'Book has no sections'
          });
        }

        // Map nav items with matter detection
        let sections: SectionPreview[] = book.data.nav.map((navItem: any) => {
          const matter = navItem.matter || navItem.type || 'body';
          const isBody = matter === 'body' || matter === 'bodymatter';

          return {
            order: navItem.order,
            label: navItem.label,
            matter,
            isBody,
          };
        });

        // Optionally fetch block counts for each section
        if (includeBlockCounts) {
          const blockCountPromises = sections.map(async (section) => {
            try {
              const blocks = await cash.getSectionBookBlocks(id, section.order.toString());
              // Count only text blocks (not section or book metadata)
              const textBlockCount = blocks.filter((b: any) => b.type === 'text').length;
              return { order: section.order, blockCount: textBlockCount };
            } catch {
              return { order: section.order, blockCount: 0 };
            }
          });

          const blockCounts = await Promise.all(blockCountPromises);
          const blockCountMap = new Map(blockCounts.map(bc => [bc.order, bc.blockCount]));

          sections = sections.map(section => ({
            ...section,
            blockCount: blockCountMap.get(section.order) || 0,
          }));
        }

        return NextResponse.json({
          sections,
          bookTitle: book.data.title,
        });
      } catch (cashmereError) {
        console.log('Cashmere API unavailable, falling back to local data');
      }
    }

    // Fall back to local omnipubs table (if nav was stored during ingestion)
    const localBook = await db
      .select()
      .from(omnipubs)
      .where(eq(omnipubs.uuid, id))
      .limit(1);

    if (localBook.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = localBook[0];

    if (!book.nav || (book.nav as any[]).length === 0) {
      return NextResponse.json({
        sections: [],
        message: 'Book has no sections stored locally'
      });
    }

    // Map stored nav items
    const sections: SectionPreview[] = (book.nav as any[]).map((navItem: any) => {
      const matter = navItem.matter || 'body';
      const isBody = matter === 'body' || matter === 'bodymatter';

      return {
        order: navItem.order,
        label: navItem.label,
        matter,
        isBody,
      };
    });

    return NextResponse.json({
      sections,
      bookTitle: book.title,
    });
  } catch (error: any) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
