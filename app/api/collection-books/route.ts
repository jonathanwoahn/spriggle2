import { db, collectionBooks } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { bookIds, collectionIds } = await req.json();

    const entries = bookIds.reduce((acc: any[], bookId: string) => {
      const t = collectionIds.map((collectionId: string) => {
        return {
          bookId: bookId,
          collectionId: parseInt(collectionId),
        }
      });

      acc.push(...t);
      return acc;

    }, []);

    console.log(entries);

    const data = await db.insert(collectionBooks).values(entries).returning();

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
