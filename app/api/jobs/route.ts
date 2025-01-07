import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase.from('jobs').insert(body);

  if(error) {
    console.error(error);
    return NextResponse.json({error: error.message}, {status: 500});
  }

  return NextResponse.json(data);;
};