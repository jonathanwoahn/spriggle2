import Cashmere from "@/lib/cashmere";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) => {
  const { bookId } = await params;
  const sb = await createClient();

  const { data: audioFiles, error: audioError } = await sb.storage.from('audio').list(bookId, {limit: 10000});

  if(audioError) {
    throw new Error((audioError as Error).message);
  }

  const baseUrl = request.nextUrl.origin;
  const response = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
  const { value } = await response.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(bookId);

  if(!book.data.nav) {
    throw new Error('No sections found for this book');
  }

  for (let i = 0; i < (book.data.nav || []).length; i++) {
    const blocks = (await cash.getSectionBookBlocks(bookId, `${i}`)).filter((block: any) => block.type === 'text' || block.type === 'section');
    const {data: metadata, error: metadataError} = await sb.from('audio_metadata').select('*').eq('book_id', bookId).eq('section_order', book.data.nav[i].order);
    let startTime = 0;

    for(let j = 0; j < blocks.length; j++) {
      const block = blocks[j];
      const audioFile = audioFiles.find((file: any) => file.name === `${block.uuid}.mp3`);

      if(!audioFile) {
        console.log(`No audio file found for block ${block.uuid}`);
        throw new Error(`No audio file found for block ${block.uuid}`);
      }

      const meta = (metadata || []).find((m: any) => m.block_id === block.uuid);

      if(!meta) {
        console.log(`No metadata found for block ${block.uuid}`);
        throw new Error(`No metadata found for block ${block.uuid}`);
      }

      const duration = meta.duration;
      meta.start_time = startTime;
      startTime += duration;
      await sb.from('audio_metadata').update({start_time: meta.start_time}).eq('id', meta.id);
    }
  };

  return NextResponse.json({bookId});
}