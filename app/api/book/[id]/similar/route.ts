import { IBlockMetadata } from "@/lib/types";
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

  // TODO: Implement vector similarity search with pgvector in Neon
  // For now, return empty similar books
  // The match_documents RPC function would need to be recreated in Neon with pgvector extension

  const bookResponse = await fetch(`${baseUrl}/api/book/${id}`);
  const bookData = await bookResponse.json();

  const res = {
    name: `Other books similar to ${bookData.data.title}`,
    description: 'Similar books based on content',
    collection_books: [],
  };

  return NextResponse.json(res);
}
