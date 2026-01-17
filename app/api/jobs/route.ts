import { IResponse } from "@/lib/types";
import { db, jobs } from "@/db";
import { eq, asc, desc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// retrieves jobs with search parameters
export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;

    const orderBy = searchParams.get('orderBy') || 'id';
    const order = searchParams.get('order') || 'asc';
    const page = parseInt(searchParams.get('page') || '0');
    const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '100');
    const selectedTab = searchParams.get('selectedTab') || 'failed';

    // Map orderBy string to column
    const orderColumn = orderBy === 'id' ? jobs.id :
                        orderBy === 'status' ? jobs.status :
                        orderBy === 'jobType' ? jobs.jobType :
                        orderBy === 'createdAt' ? jobs.createdAt :
                        jobs.id;

    const data = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, selectedTab))
      .orderBy(order === 'asc' ? asc(orderColumn) : desc(orderColumn))
      .limit(rowsPerPage)
      .offset(page * rowsPerPage);

    // Get count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(eq(jobs.status, selectedTab));

    const count = Number(countResult[0]?.count || 0);

    return NextResponse.json({ data, count });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add new array of jobs
export const POST = async (req: NextRequest): Promise<NextResponse<IResponse>> => {
  try {
    const body = await req.json();

    // Handle both single object and array
    const items = Array.isArray(body) ? body : [body];

    const data = await db.insert(jobs).values(items).returning();

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

// update the data for a job
export const PUT = async (req: NextRequest): Promise<NextResponse<IResponse>> => {
  try {
    const body = await req.json();

    // Handle both single object and array
    const items = Array.isArray(body) ? body : [body];

    const results = [];
    for (const item of items) {
      const result = await db
        .insert(jobs)
        .values(item)
        .onConflictDoUpdate({
          target: jobs.id,
          set: {
            jobType: item.jobType ?? item.job_type,
            status: item.status,
            data: item.data,
            log: item.log,
            dependencies: item.dependencies,
            updatedAt: new Date(),
          },
        })
        .returning();
      results.push(...result);
    }

    return NextResponse.json({ data: results });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
