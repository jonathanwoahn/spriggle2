import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {

  const { id } = await params;

  const sb = await createClient();
  
  const { data, error } = await sb.from('collections').select(`
      id,
      name,
      description,
      collection_books (
        book_id
      )
    `).eq('id', id).single();

  if(error) {
    return NextResponse.json({ status: 500, message: error.message });
  }

  return NextResponse.json({ ...data});

}