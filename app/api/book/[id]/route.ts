import Cashmere from "@/lib/cashmere";
import { db } from "@/db";
import { appSettings, omnipubs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// retrieves the content of a specific book
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    // Query database directly instead of making internal HTTP request
    const settings = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'))
      .limit(1);

    const apiKey = settings[0]?.value || '';

    // Try Cashmere API first if key is configured
    if (apiKey) {
      try {
        const cash = new Cashmere(apiKey);
        const book = await cash.getBook(id);
        return NextResponse.json(book);
      } catch (cashmereError) {
        console.log('Cashmere API unavailable, falling back to local metadata');
      }
    }

    // Fall back to local omnipubs table
    const localBook = await db
      .select()
      .from(omnipubs)
      .where(eq(omnipubs.uuid, id))
      .limit(1);

    if (localBook.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = localBook[0];

    // Return in the same format as Cashmere API
    const bookData = {
      uuid: book.uuid,
      data: {
        title: book.title,
        subtitle: book.subtitle,
        creators: book.creators,
        publisher: book.publisher,
        cover_image: book.coverImage,
        summary: book.summary,
        ready: book.ready,
      },
    };

    return NextResponse.json(bookData);
  } catch (error: any) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
