import { NextRequest, NextResponse } from "next/server";
import Cashmere from "@/lib/cashmere";

// creates the audio files for all the sections in a book. I believe this route is deprecated since it takes too long to run on Vercel
export const POST = async (req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await params;

  const baseUrl = req.nextUrl.origin;
  
  const keyResponse = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
  const { value } = await keyResponse.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(bookId);
  if(!book.data.nav) {
    throw new Error("Book has no sections");
  }

  for (let i = 0; i < book.data.nav.length; i++ ) {
    console.log(`Combining audio chunks for section ${book.data.nav[i].order}`)
    try {
      await fetch(`${baseUrl}/api/audio/${bookId}/utility/${book.data.nav[i].order}/combine-audio-chunks`,{
        method: 'POST',
      });
    } catch (error) {
      throw new Error(`Failed to combine audio chunks for section ${book.data.nav[i].order}: ${(error as Error).message}`);
    }
  }

  return NextResponse.json(book);
};