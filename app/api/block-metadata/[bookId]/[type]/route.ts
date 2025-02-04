// import { createClient } from "@/utils/supabase/server";
// import { NextRequest, NextResponse } from "next/server";

// // Retrieves block metadata. User can provide params to filter the results
// export const GET = async (req: NextRequest, {params}: {params: Promise<{bookId: string, type: string, sectionOrder: string}>}) => {
//   const { bookId, type, sectionOrder } = await params;
//   const sb = await createClient();

//   const query = sb.from('block_metadata').select('*');

//   if(bookId) {
//     query.eq('book_id', bookId);
//   }

//   if(type) {
//     query.eq('type', type);
//   }

//   if(sectionOrder) {
//     query.eq('section_order', sectionOrder);
//   }
  
//   const { data, error } = await query;

//   if (error) {
//     return NextResponse.json({error: error.message}, {status: 500});
//   }
  
//   return NextResponse.json(data, {status: 200});
// };