import { IResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Creates new block metadata
export const POST = async (
  req: NextRequest,
): Promise<NextResponse<IResponse>> => {
  const body = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase.from('block_metadata').insert(body);
  
  if(error) {
    return NextResponse.json({message: error.message}, {status: 500});
  }

  return NextResponse.json({data});;
}

// 
export const PUT = async (
  req: NextRequest,
): Promise<NextResponse<IResponse>> => {
  const body = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase.from('block_metadata').upsert(body, {onConflict: 'block_id,book_id'});
  
  if(error) {
    return NextResponse.json({message: error.message}, {status: 500});
  }

  return NextResponse.json({data});
}

export const GET = async (
  req: NextRequest,
) => {
  const sp = req.nextUrl.searchParams;
  const sb = (await createClient()).from('block_metadata').select('*', { count: 'exact' }).order('block_index');

  const blockId = sp.get('blockId');
  if(blockId) {
    sb.eq('block_id', blockId);
  }

  const bookId = sp.get('bookId');
  if(bookId) {
    sb.eq('book_id', bookId);
  }

  const type = sp.get('type') as string;
  if(type) {
    sb.eq('type', type);
  }

  const sectionOrder = sp.get('sectionOrder') as string;
  if(sectionOrder) {
    sb.eq('section_order', sectionOrder);
  }

  const limit = sp.get('limit');
  if(limit && !isNaN(parseInt(limit))) {
    sb.limit(parseInt(limit));
  }

  const { data, error, count } = await sb;
  
  return NextResponse.json({data, error, count});
}