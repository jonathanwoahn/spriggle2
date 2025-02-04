import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


// retrieve the Spriggle collections
export const GET = async (req: NextRequest) => {
  const supabase = await createClient();
  const searchParams = req.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '0');
  const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '100');
  const order = searchParams.get('order') || 'asc';
  const orderBy = searchParams.get('orderBy') || 'id';

  const {error, data, count} = await supabase
    .from('collections')
    .select('*')
    .range(page * rowsPerPage, (page + 1) * rowsPerPage - 1)
    .order(orderBy, {ascending: order === 'asc'});

  if(error) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
  
  return NextResponse.json({count, data});
}

// create a new Spriggle collection
export const POST = async (req: NextRequest) => {

  // get the data from the request body
  const data = await req.json();
  const supabase = await createClient();
  const {error} = await supabase
    .from('collections')
    .insert(data);

  if(error) {
    throw new Error(error.message);
  }

  return NextResponse.json({success: true});
}

// Update a Spriggle collection
export const PUT = async (req: NextRequest) => {
  const data = await req.json();
  const supabase = await createClient();
  const {error} = await supabase
    .from('collections')
    .update(data)
    .match({id: data.id});

  if(error) {
    throw new Error(error.message);
  }

  return NextResponse.json({success: true});
}