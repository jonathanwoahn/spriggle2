import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { PassThrough } from 'stream';

export const GET = async (
  res: NextRequest,
  { params }: { params: Promise<{ bookId: string, order: string }> }
) => {
  const {bookId, order } = await params;
  const sb = await createClient();

  const { data: audioBlob, error: audioError } = await sb
    .storage
    .from('audio')
    .download(`${bookId}/${bookId}-${order}.mp3`);

  if(audioError) {
    return NextResponse.json({ error: audioError.message}, {status: 500});
  }

  if (!audioBlob) {
  console.error('audioBlob is undefined', audioBlob);
  return NextResponse.json({ error: 'Failed to fetch audio data' }, { status: 500 });
}

  const audioStream = new PassThrough();
  const readableStream = new ReadableStream({
    start(controller){
      audioStream.on('data', (chunk) => { controller.enqueue(chunk); });
      audioStream.on('end', () => { controller.close()}); 
      audioStream.on('error', (error) => { controller.error(error); });
    }
  });

  const reader = audioBlob.stream().getReader();
  reader.read().then(function process({ done, value }) {
    if (done) {
      audioStream.end();
      return;
    }
    audioStream.write(value);
    reader.read().then(process);
  });

  return new NextResponse(readableStream, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${bookId}-${order}.mp3"`,
    },
  });
}