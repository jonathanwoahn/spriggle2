import { db, collections } from "@/db";
import { asc, desc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// retrieve the Spriggle collections
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '0');
    const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '100');
    const order = searchParams.get('order') || 'asc';
    const orderBy = searchParams.get('orderBy') || 'id';

    // Map orderBy string to column
    const orderColumn = orderBy === 'id' ? collections.id :
                        orderBy === 'name' ? collections.name :
                        collections.id;

    const data = await db
      .select()
      .from(collections)
      .orderBy(order === 'asc' ? asc(orderColumn) : desc(orderColumn))
      .limit(rowsPerPage)
      .offset(page * rowsPerPage);

    // Get count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(collections);

    const count = Number(countResult[0]?.count || 0);

    return NextResponse.json({ count, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// create a new Spriggle collection
export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    await db.insert(collections).values(data);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Update a Spriggle collection
export const PUT = async (req: NextRequest) => {
  try {
    const data = await req.json();

    await db
      .update(collections)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(sql`${collections.id} = ${data.id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
}
