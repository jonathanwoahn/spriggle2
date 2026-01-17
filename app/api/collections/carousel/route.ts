import { IOmnipub, IResponse } from "@/lib/types";
import { db } from "@/db";
import { collections, collectionBooks, omnipubs } from "@/db/schema";
import { eq, and, inArray, asc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface ICarousel {
  collection: {
    id?: number;
    name: string;
    description: string;
  };
  books: IOmnipub[];
}

export const GET = async (req: NextRequest): Promise<NextResponse<IResponse<ICarousel>>> => {
  const searchParams = new URLSearchParams(req.nextUrl.search);
  const bookId = searchParams.get('bookId');
  const collectionId = searchParams.get('collectionId');

  try {
    if (collectionId) {
      // Get collection
      const collectionData = await db
        .select()
        .from(collections)
        .where(eq(collections.id, parseInt(collectionId)))
        .limit(1);

      if (collectionData.length === 0) {
        return NextResponse.json({ status: 404, message: 'Collection not found' });
      }

      const collection = collectionData[0];

      // Get collection book IDs
      const collectionBooksData = await db
        .select()
        .from(collectionBooks)
        .where(eq(collectionBooks.collectionId, parseInt(collectionId)));

      const bookIds = collectionBooksData.map(b => b.bookId);

      if (bookIds.length === 0) {
        return NextResponse.json({
          data: {
            collection: {
              id: collection.id,
              name: collection.name,
              description: collection.description || '',
            },
            books: [],
          }
        });
      }

      // Get ready books from omnipubs that are in this collection
      const books = await db
        .select()
        .from(omnipubs)
        .where(
          and(
            inArray(omnipubs.uuid, bookIds),
            eq(omnipubs.ready, true)
          )
        )
        .orderBy(asc(omnipubs.title));

      return NextResponse.json({
        data: {
          collection: {
            id: collection.id,
            name: collection.name,
            description: collection.description || '',
          },
          books: books as IOmnipub[],
        }
      });
    }

    if (bookId) {
      // Get other ready books (excluding the current one)
      const otherBooks = await db
        .select()
        .from(omnipubs)
        .where(
          and(
            eq(omnipubs.ready, true),
            sql`${omnipubs.uuid} != ${bookId}`
          )
        )
        .orderBy(asc(omnipubs.title))
        .limit(10);

      const collection = {
        name: 'You Might Also Enjoy',
        description: 'More books to explore',
      };

      return NextResponse.json({ data: { books: otherBooks as IOmnipub[], collection } });
    }

    // No specific collection or book requested - return all ready books
    const allBooks = await db
      .select()
      .from(omnipubs)
      .where(eq(omnipubs.ready, true))
      .orderBy(asc(omnipubs.title));

    return NextResponse.json({
      data: {
        collection: {
          name: 'All Books',
          description: 'Browse our complete library',
        },
        books: allBooks as IOmnipub[],
      }
    });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message });
  }
}
