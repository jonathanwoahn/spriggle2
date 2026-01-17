import { db, appSettings } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 60 });

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) => {
  const { key } = await params;

  const cachedData = cache.get(key);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    const data = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json(null);
    }

    cache.set(key, data[0]);

    return NextResponse.json(data[0]);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
