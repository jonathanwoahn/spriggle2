import Cashmere from "@/lib/cashmere";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  res: NextRequest,
  {params}: { params: {id: string, order: string }}
) => {
  const data = await params;

  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  
  // TODO:  need to update this to dynamically get the route of the vercel API url
  const keyResponse = await fetch(`${defaultUrl}/api/settings/cashmereApiKey`);
  const { value } = await keyResponse.json();

  const cash = new Cashmere(value);

  try {
    const blocks = await cash.getSectionBookBlocks(data.id, data.order);
  
    const urls = blocks.map((block: {uuid: string}, index: number) => ({
      blockId: block.uuid,
      url: `${defaultUrl}/api/book/${data.id}/section/${data.order}/${block.uuid}.mp3`,
      index,
    }));
    
    return NextResponse.json(urls);

  }catch(e) {
    console.error(e);
    return NextResponse.json({error: e.message}, {status: 500});
  }
  
}