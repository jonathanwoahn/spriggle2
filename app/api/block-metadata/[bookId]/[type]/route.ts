// import { createClient } from "@/utils/supabase/server";
// import { NextRequest, NextResponse } from "next/server";

// export const GET = async (req: NextRequest, {params}: {params: Promise<{bookId: string, type: string}>}) => {
//   const { bookId, type } = await params;
//   const sb = await createClient();

//   const { data, error } = await sb.from("block_metadata").select("*").eq("book_id", bookId).eq('type', type);

//   if (error) {
//     return NextResponse.json({error: error.message}, {status: 500});
//   }
  
//   return NextResponse.json(data, {status: 200});
// };