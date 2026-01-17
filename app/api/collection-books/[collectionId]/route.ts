import { db, collectionBooks } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) => {
  const { collectionId } = await params;

  try {
    const data = await db
      .select()
      .from(collectionBooks)
      .where(eq(collectionBooks.collectionId, parseInt(collectionId)));

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
