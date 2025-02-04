import Cashmere from "@/lib/cashmere";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";


  
  const keyResponse = await fetch(`${defaultUrl}/api/settings/cashmereApiKey`);
  const { value } = await keyResponse.json();
  
  const cash = new Cashmere(value);
  const searchParams = req.nextUrl.searchParams;
  
  try {
    const qry = {
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      search: searchParams.get('search') || undefined,
      collection: searchParams.get('collection') || undefined,
    };
  

    const books = await cash.listBooks(qry);
  
    return NextResponse.json(books);
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: (e as Error).message}, {status: 500});
  }
  
}