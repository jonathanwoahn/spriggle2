import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import NodeCache from "node-cache";

const cache = new NodeCache({stdTTL: 60 * 60});

export const GET = async (
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> },
  
) => {
  const { key } = await params;

  const cachedData = cache.get(key);
  if(cachedData) {
    return NextResponse.json(cachedData);
  }
  
  const supabase = await createClient();
  const { data, error } = await supabase.from('app_settings').select('*').eq('key', key);

  if(error) {
    throw new Error(error.message);
  }

  cache.set(key, data[0]);
  
  return NextResponse.json(data[0]);
}