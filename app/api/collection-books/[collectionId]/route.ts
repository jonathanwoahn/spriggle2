import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) => {
  const { collectionId } = await params;

  const sb = await createClient();

  const { data, error } = await sb.from('collection_books').select('*').eq('collection_id', collectionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}