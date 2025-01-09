import Cashmere from "@/lib/cashmere";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const keyResponse = await fetch(`/api/settings/cashmereApiKey`);
  const { value } = await keyResponse.json();
  
  const cash = new Cashmere(value);
  
  const searchParams = req.nextUrl.searchParams;
  
  const qry = {
    limit: searchParams.get('limit') || undefined,
    offset: searchParams.get('offset') || undefined,
    search: searchParams.get('search') || undefined,
  };

  const books = await cash.listBooks(qry);

  return NextResponse.json(books);
}