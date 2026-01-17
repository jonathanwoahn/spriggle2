import { downloadFile, fileExists } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';
import { PassThrough } from 'stream';
import { db } from '@/db';
import { bookVoices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Stream audio to client. Supports new path structure: {bookId}/{voiceId}/section-{order}.mp3
// Falls back to legacy path: {bookId}/{bookId}-{order}.mp3 for backward compatibility
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string, order: string }> }
) => {
  const { bookId, order } = await params;
  const range = req.headers.get('range');
  const url = new URL(req.url);
  let voiceId = url.searchParams.get('voiceId');

  try {
    // If no voiceId provided, get the default voice for this book
    if (!voiceId) {
      const defaultVoice = await db.select()
        .from(bookVoices)
        .where(and(eq(bookVoices.bookId, bookId), eq(bookVoices.isDefault, true)))
        .limit(1);

      if (defaultVoice.length > 0) {
        voiceId = defaultVoice[0].voiceId;
      }
    }

    // Build path - try new structure first, then fall back to legacy
    let audioPath: string;
    const newPath = voiceId ? `${bookId}/${voiceId}/section-${order}.mp3` : null;
    const legacyPath = `${bookId}/${bookId}-${order}.mp3`;

    // Check for new path structure first
    if (newPath && await fileExists(newPath)) {
      audioPath = newPath;
    } else if (await fileExists(legacyPath)) {
      // Fall back to legacy path for backward compatibility
      audioPath = legacyPath;
    } else {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    const audioBuffer = await downloadFile(audioPath);
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
      audioStream.end(audioBuffer);

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
