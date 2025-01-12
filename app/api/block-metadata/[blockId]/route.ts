import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, {params}: {params: Promise<{blockId: string}>}) => {
  const { blockId } = await params;
  const sb = await createClient();

  const { data, error } = await sb.from("block_metadata").select("*").eq("block_id", blockId).single();

  return NextResponse.json(data, {status: 200});
};