import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const POST = async (req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) => {
  const {bookId} = await params;
  const baseUrl = req.nextUrl.origin;
  const sb = await createClient();
  
  const {data: bookMetadata, error: metadataError} = await sb.from('block_metadata').select('*').eq('block_id', bookId);

  if(metadataError) {
    throw new Error(metadataError.message);
  }

  const openAiKerResponse = await fetch(`${baseUrl}/api/settings/openAiApiKey`);
  const {value: openAiKey} = await openAiKerResponse.json();
  const openai = new OpenAI({ apiKey: openAiKey });

  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: bookMetadata[0].data.summary,
  });

  const embedding = response.data[0].embedding;
  const data = {
    ...bookMetadata[0],
    embedding,
  };
  
  const {data: upsertError, error} = await sb.from('block_metadata').upsert(data);

  if(upsertError) {
    throw new Error((upsertError as Error).message);
  }

  return NextResponse.json({ embedding }, {status: 200});
}