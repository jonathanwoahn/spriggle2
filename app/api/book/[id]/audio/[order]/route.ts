import Cashmere from "@/lib/cashmere";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  {params}: { params: Promise<{id: string, order: string }>}
) => {
  const {id, order } = await params;

  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  
  // TODO:  need to update this to dynamically get the route of the vercel API url
  const keyResponse = await fetch(`/api/settings/cashmereApiKey`);
  const { value } = await keyResponse.json();

  const cash = new Cashmere(value);

  try {
    const blocks = await cash.getSectionBookBlocks(id, order);
  
    const urls = blocks.map((block: {uuid: string}, index: number) => ({
      blockId: block.uuid,
      url: `${defaultUrl}/api/book/${id}/section/${order}/${block.uuid}.mp3`,
      index,
    }));
    
    return NextResponse.json(urls);

  }catch(e) {
    console.error(e);
    return NextResponse.json({error: (e as Error).message}, {status: 500});
  }
  
}