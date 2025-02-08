import Cashmere from "@/lib/cashmere";
import { getServerURL } from "@/lib/utils";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

// retrieves the content of a specific book
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const response = await fetch(`${getServerURL()}/api/settings/cashmereApiKey`);
  const { value } = await response.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(id);
  
  return NextResponse.json(book);
}