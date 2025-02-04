import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';


// Takes a text input and converts it to an audio file
export const POST = async (req: NextRequest) => {
  const { text, voice = 'fable' } = await req.json();
  const baseUrl = req.nextUrl.origin;

  try {
    const openAiKerResponse = await fetch(`${baseUrl}/api/settings/openAiApiKey`);
    const {value: openAiKey} = await openAiKerResponse.json();
    const openai = new OpenAI({ apiKey: openAiKey });
  
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
        
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch(e) {
    return NextResponse.json({message: (e as Error).message}, {status: 500});
  }
}