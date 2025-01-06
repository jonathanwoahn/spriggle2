import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('app_settings').select('*').order('order', { ascending: true });

  if(error) {
    throw new Error(error.message);
  }
  
  return NextResponse.json(data);
}

// create update handler
export const PUT = async (request: NextRequest) => {
  const supabase = await createClient();
  
  try {
    const body = await request.json();
    const { data, error } = await supabase.from('app_settings').upsert(body, {onConflict: 'id'});

    if (error) {
      console.error('Supabase error: ', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  }catch(e) {
    console.log('ERROR: ', e);
    if (e instanceof Error) {
      return NextResponse.json({error: e.message});
    } else {
      return NextResponse.json({error: e});
    }
  }
}