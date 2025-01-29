// import Cashmere from "@/lib/cashmere";
// import { NextRequest, NextResponse } from "next/server";

// export const GET = async (
//   req: NextRequest,
//   {params}: { params: Promise<{id: string, order: string }>}
// ) => {
//   const {id, order } = await params;

//   const baseUrl = req.nextUrl.origin;
//   const keyResponse = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
//   const { value } = await keyResponse.json();

//   const cash = new Cashmere(value);

//   try {
//     const blocks = await cash.getSectionBookBlocks(id, order);
  
//     const data = blocks.map((block: {uuid: string}, index: number) => ({
//       blockId: block.uuid,
//       index,
//     }));
    
//     return NextResponse.json(data);

//   }catch(e) {
//     console.error(e);
//     return NextResponse.json({error: (e as Error).message}, {status: 500});
//   }
// }