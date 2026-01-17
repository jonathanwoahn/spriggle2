import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Takes a text input and generates an ada-002 embedding
export const POST = async (req: NextRequest) => {
  const {text} = await req.json();
  const baseUrl = req.nextUrl.origin;
  
  try {
    const openAiKerResponse = await fetch(`${baseUrl}/api/settings/openAiApiKey`);
    const {value: openAiKey} = await openAiKerResponse.json();
    const openai = new OpenAI({ apiKey: openAiKey });

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
  
    const embedding = response.data[0].embedding;

    return NextResponse.json({ embedding }, {status: 200});
  } catch(e) {
    return NextResponse.json({ error: (e as Error).message }, {status: 500});
  }
}