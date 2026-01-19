import { fileExists, getFileMetadata, getFileWithRange, getFileStream } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
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

    // Get file metadata first (fast HEAD request to get size)
    const metadata = await getFileMetadata(audioPath);
    if (!metadata || !metadata.contentLength) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }
    const fileSize = metadata.contentLength;

    if (range) {
      // Stream with range support - directly from R2
      const { stream, contentRange, statusCode, contentLength } = await getFileWithRange(audioPath, range);
      const webStream = Readable.toWeb(stream) as ReadableStream;

      return new NextResponse(webStream, {
        status: statusCode,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Range': contentRange || `bytes 0-${fileSize - 1}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': (contentLength || fileSize).toString(),
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      });
    } else {
      // Full file - still stream directly, don't buffer
      const { stream, contentLength } = await getFileStream(audioPath);
      const webStream = Readable.toWeb(stream) as ReadableStream;

      return new NextResponse(webStream, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes',
          'Content-Length': (contentLength || fileSize).toString(),
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
