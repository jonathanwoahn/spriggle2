import { db, collections, collectionBooks } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  const { id } = await params;

  try {
    // Get collection with its books
    const collectionData = await db
      .select()
      .from(collections)
      .where(eq(collections.id, parseInt(id)))
      .limit(1);

    if (collectionData.length === 0) {
      return NextResponse.json({ status: 404, message: 'Collection not found' });
    }

    const collection = collectionData[0];

    // Get collection books
    const books = await db
      .select()
      .from(collectionBooks)
      .where(eq(collectionBooks.collectionId, parseInt(id)));

    return NextResponse.json({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      collection_books: books.map(b => ({ book_id: b.bookId })),
    });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: error.message });
  }
}
