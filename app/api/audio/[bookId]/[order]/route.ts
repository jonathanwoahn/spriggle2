import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { PassThrough } from 'stream';

export const GET = async (
  res: NextRequest,
  { params }: { params: Promise<{ bookId: string, order: string }> }
) => {
  const {bookId, order } = await params;
  const sb = await createClient();

  const { data: metadata, error: metadataError } = await sb
    .from('audio_metadata')
    .select('*')
    .eq('book_id', bookId)
    .eq('section_order', order)
    .order('block_index', { ascending: true });

  if (metadataError) {
    return NextResponse.json({ error: metadataError.message}, {status: 500});
  }

  const audioStream = new PassThrough();

  for( const meta of metadata) {
    console.log(meta);
    const { data: audioData, error: audioError } = await sb
      .storage
      .from('audio')
      .download(`${bookId}/${meta.block_id}.mp3`);

    if (audioError) {
      return NextResponse.json({error: audioError.message}, {status: 500});
    }

    const buffer = await audioData.arrayBuffer();
    audioStream.write(Buffer.from(buffer));
  }

  audioStream.end();

  const readableStream = new ReadableStream({
    start(controller){
      audioStream.on('data', (chunk) => { controller.enqueue(chunk); });
      audioStream.on('end', () => { controller.close()}); 
      audioStream.on('error', (error) => { controller.error(error); });
    }
  })

  return new NextResponse(readableStream, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  });
}