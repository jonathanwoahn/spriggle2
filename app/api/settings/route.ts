import { db, appSettings } from "@/db";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const data = await db
      .select()
      .from(appSettings)
      .orderBy(asc(appSettings.order));

    return NextResponse.json(data);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// create update handler
export const PUT = async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Handle both single object and array
    const items = Array.isArray(body) ? body : [body];

    const results = [];
    for (const item of items) {
      const result = await db
        .insert(appSettings)
        .values(item)
        .onConflictDoUpdate({
          target: appSettings.id,
          set: {
            key: item.key,
            value: item.value,
            field: item.field,
            description: item.description,
            type: item.type,
            order: item.order,
          },
        })
        .returning();
      results.push(...result);
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.log('ERROR: ', error);
    return NextResponse.json({ error: error.message });
  }
}
