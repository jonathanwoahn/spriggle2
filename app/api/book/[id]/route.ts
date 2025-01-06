import Cashmere from "@/lib/cashmere";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  // TODO:  need to update this to dynamically get the route of the vercel API url
  const response = await fetch('http://localhost:3000/api/settings/cashmereApiKey');
  const { value } = await response.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(id);
  
  return NextResponse.json(book);
}