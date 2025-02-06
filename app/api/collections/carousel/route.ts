import { BlockType, IBlockMetadata, IResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ICarousel {
  collection: {
    id?: number;
    name: string;
    description: string;
  };
  metadata: IBlockMetadata[];
}

export const GET = async (req: NextRequest): Promise<NextResponse<IResponse<ICarousel>>> => {

  const searchParams = new URLSearchParams(req.nextUrl.search);
  const bookId = searchParams.get('bookId');
  const collectionId = searchParams.get('collectionId');

  const sb = await createClient();


  if(collectionId) {
    const {data: collectionData, error} = await sb
      .from('collections')
      .select(`
        id,
        name,
        description,
        collection_books (
          book_id
        )
      `).eq('id', collectionId).single();
    
    if (error) {
      return NextResponse.json({status: 500, message: error.message});
    }
    
    const { collection_books: collectionBooks, ...collection } = collectionData;

    const { data: metadata, error: metadataError } = await sb
      .from('block_metadata')
      .select('*')
      .in('book_id', collectionBooks.map(({book_id}) => book_id))
      .eq('type', BlockType.BOOK)
      .eq('data->>ready', 'true');

    if(metadataError) {
      return NextResponse.json({status: 500, message: metadataError.message});
    }
    
    return NextResponse.json({ data: {collection, metadata} });
  }
  
  if(bookId) {
    const { data: bookMetadata, error: bookError} = await sb.from('block_metadata').select('*').eq('block_id', bookId).eq('data->>ready', 'true').single();
    
    if(!bookMetadata) {
      return NextResponse.json({status: 404, message: 'Book metadata not found'});
    }

    if(!bookMetadata.embedding) {
      return NextResponse.json({status: 404, message: 'Book metadata not found'});
    }

    if (bookError) {
      return NextResponse.json({status: 500, message: bookError.message});
    }
    
    const query = {
      query_embedding: bookMetadata.embedding,
      match_count: 10,
      match_threshold: 0.7,
    };

    const { data: matchData, error: matchError } = await sb.rpc('match_documents', query);

    if (matchError) {
      return NextResponse.json({status: 500, message: matchError.message});
    }

    const metadata = matchData.filter((match: IBlockMetadata) => match.book_id !== bookId);
    const collection = {
      name: `Other books similar to ${bookMetadata.data.title}`,
      description: 'AI similarity match',
    };
    
    return NextResponse.json({ data: { metadata, collection } });
  }

  return NextResponse.json({status: 404, message: 'Not found'});
}