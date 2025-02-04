import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  const { id } = await params;

  const sb = await createClient();

  const { data, error } = await sb.from('collections').select('*').eq('id', id).single();

  return NextResponse.json({ id, data});
}