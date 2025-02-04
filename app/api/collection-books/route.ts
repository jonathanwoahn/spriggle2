import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {

  const {bookIds, collectionIds} = await req.json();
  
  const entries = bookIds.reduce((acc: string[], bookId: string) => {
    const t = collectionIds.map((collectionId: string) => {
      return {
        book_id: bookId,
        collection_id: collectionId,
      }
    });

    acc.push(...t);
    return acc;
    
  }, []);
  
  console.log(entries);

  const sb = await createClient();

  const { data, error } = await sb.from('collection_books').insert(entries);
  
  if(error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}
