import { IResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// retrieves jobs with search parameters
export const GET = async (req: NextRequest) => {
  const supabase = await createClient();
  const searchParams = req.nextUrl.searchParams;

  const orderBy = searchParams.get('orderBy') || 'id';
  const order = searchParams.get('order') || 'asc';
  const page = parseInt(searchParams.get('page') || '0');
  const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '100');
  const selectedTab = searchParams.get('selectedTab') || 'failed';

  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending: order === 'asc' })
    .range(page * rowsPerPage, (page + 1) * rowsPerPage - 1)
    .eq('status', selectedTab);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({error: error.message}, {status: 500});
  }

  return NextResponse.json({data, count});
}


// Add new array of jobs
export const POST = async (req: NextRequest): Promise<NextResponse<IResponse>> => {
  const body = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase.from('jobs').insert(body);

  if(error) {
    return NextResponse.json({message: error.message}, {status: 500});
  }

  return NextResponse.json({data});;
};

// update the data for a job
export const PUT = async (req: NextRequest): Promise<NextResponse<IResponse>> => {
  const body = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase.from('jobs').upsert(body);

  if(error) {
    return NextResponse.json({message: error.message}, {status: 500});
  }

  return NextResponse.json({data});;
};

