import Cashmere from "@/lib/cashmere";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

// retrieves the content of a specific book
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  // TODO:  need to update this to dynamically get the route of the vercel API url
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  
  const response = await fetch(`${defaultUrl}/api/settings/cashmereApiKey`);
  const { value } = await response.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(id);
  
  return NextResponse.json(book);
}