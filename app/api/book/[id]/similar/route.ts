import { IBlockMetadata } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;
  const baseUrl = req.nextUrl.origin;

  const response = await fetch(`${baseUrl}/api/metadata?bookId=${id}&type=book&limit=1`);

  if(!response.ok) {
    return NextResponse.json({error: 'Book metadata not found'}, {status: 404});
  }
  
  const {data: metadata} = await response.json();

  if(!metadata || metadata.length === 0) {
    return NextResponse.json({error: 'Book metadata not found'}, {status: 404});
  }

  const query = {
    query_embedding: metadata[0].embedding,
    match_count: 10,
    match_threshold: 0.7,
  };
  
  const sb = await createClient();

  const { data: matchData, error } = await sb.rpc('match_documents', query);
  if(error) {
    return NextResponse.json({error}, {status: 500});
  }
  
  const bookResponse = await fetch(`${baseUrl}/api/book/${id}`);
  const bookData = await bookResponse.json();

  
  const collection_books = matchData
    .map((match: IBlockMetadata) => match.book_id)
    .filter((book_id: string) => book_id !== id)
    .map((book_id: string) => ({
      book_id,
    }));

  const res = {
    name: `Other books similar to ${bookData.data.title}`,
    description: 'Blah blah blah',
    collection_books,
  };
  
  return NextResponse.json(res);
}