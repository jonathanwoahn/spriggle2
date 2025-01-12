import Cashmere from "@/lib/cashmere";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) => {
  console.log('Processing block metadata');
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
    const order = book.data.nav[i].order;
    console.log(`Reading metadata for blocks in section ${order}`);
    
    const blocks = (await cash.getSectionBookBlocks(bookId, `${i}`));
    const {data: metadata, error: metadataError} = await sb.from('block_metadata').select('*').eq('book_id', bookId).eq('section_order', order);
    let startTime = 0;

    // go through each of the blocks in the section, and ensure the proper data exists (audio file, metadata).
    // If all the information needed is there, then update the metadata with the start time
    for(let j = 0; j < blocks.length; j++) {
      // only process text blocks
      if(blocks[j].type !== 'text') continue;
      
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

      const data = {
        ...meta.data,
        start_time: startTime,
      };

      startTime += meta.data.duration;
      
      await sb.from('block_metadata').update({data}).eq('id', meta.id);
    }

    const sectionMetadata = (metadata || []).find((block: any) => block.type === 'section');
    sectionMetadata.data.duration = startTime;

    await sb.from('block_metadata').update({data: sectionMetadata.data}).eq('id', sectionMetadata.id);
  };

  return NextResponse.json({bookId});
}