import Cashmere from "@/lib/cashmere";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const cashmereAPIKey = `02173768f55c783324baaefd5afd11b73c74804688f45f321f1f73eae1a6881b`;
  
  const cash = new Cashmere(cashmereAPIKey);
  const book = await cash.getBook(id);
  
  return NextResponse.json(book);
}