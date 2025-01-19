import Cashmere from "@/lib/cashmere";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string, blockId: string }> },
) => {
  const { id: bookId, blockId } = await params;
  const baseUrl = req.nextUrl.origin;
  
  try {
    const response = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
    const { value } = await response.json();
  
    const cash = new Cashmere(value);
    const block = await cash.getBookBlock(bookId, blockId);
  
    return NextResponse.json({block});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 500});
  }
}