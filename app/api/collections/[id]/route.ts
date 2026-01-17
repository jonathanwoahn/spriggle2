import { db, collections } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  const { id } = await params;

  try {
    const data = await db
      .select()
      .from(collections)
      .where(eq(collections.id, parseInt(id)))
      .limit(1);

    return NextResponse.json({ id, data: data[0] || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
