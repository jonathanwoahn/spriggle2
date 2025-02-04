import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { PassThrough } from 'stream';

// this is the endpoint that streams audio to the client. The bookId gives the folder, and the order # provides the file name
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string, order: string }> }
) => {
  const {bookId, order } = await params;
  const range = req.headers.get('range');
  
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


  const audioBuffer = await audioBlob.arrayBuffer();
  const audioLength = audioBuffer.byteLength;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : audioLength - 1;

    if (start >= audioLength || end >= audioLength) {
      return NextResponse.json({ error: 'Requested range not satisfiable' }, { status: 416 });
    }

    const chunk = audioBuffer.slice(start, end + 1);
    const audioStream = new PassThrough();
    audioStream.end(Buffer.from(chunk));

    const readableStream = new ReadableStream({
      start(controller) {
        audioStream.on('data', (chunk) => controller.enqueue(chunk));
        audioStream.on('end', () => controller.close());
        audioStream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, {
      status: 206,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Range': `bytes ${start}-${end}/${audioLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunk.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } else {
    const audioStream = new PassThrough();
    audioStream.end(Buffer.from(audioBuffer));

    const readableStream = new ReadableStream({
      start(controller) {
        audioStream.on('data', (chunk) => controller.enqueue(chunk));
        audioStream.on('end', () => controller.close());
        audioStream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
        'Content-Length': audioLength.toString(),
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  }

  // const audioStream = new PassThrough();
  // const readableStream = new ReadableStream({
  //   start(controller){
  //     audioStream.on('data', (chunk) => { controller.enqueue(chunk); });
  //     audioStream.on('end', () => { controller.close()}); 
  //     audioStream.on('error', (error) => { controller.error(error); });
  //   }
  // });

  // const reader = audioBlob.stream().getReader();
  // reader.read().then(function process({ done, value }) {
  //   if (done) {
  //     audioStream.end();
  //     return;
  //   }
  //   audioStream.write(value);
  //   reader.read().then(process);
  // });

  // return new NextResponse(readableStream, {
  //   headers: {
  //     'Content-Type': 'audio/mpeg',
  //     'Accept-Ranges': 'bytes',
  //     'Cache-Control': 'public, max-age=3600, immutable',
  //   },
  // });
}