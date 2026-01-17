import { downloadFile, uploadFile, listFiles, fileExists } from "@/lib/storage";
import { db, blockMetadata } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const MAX_RETRIES = 3;

async function downloadWithRetry(bookId: string, blockId: string, filePath: string, retries: number = MAX_RETRIES): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const audioBuffer = await downloadFile(`${bookId}/${blockId}.mp3`);
      fs.writeFileSync(filePath, audioBuffer);
      console.log(`Successfully downloaded ${blockId} on attempt ${attempt}`);
      return;
    } catch (error) {
      console.error(`Failed to download ${blockId} on attempt ${attempt}: ${(error as Error).message}`);
      if (attempt === retries) {
        throw new Error(`Failed to download ${blockId} after ${retries} attempts`);
      }
    }
  }
}

// DEPRECATED: combines all of the audio files for a given section into a single file
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string, order: string }> },
) => {
  const { bookId, order } = await params;

  const combinedFileName = `${bookId}-${order}.mp3`;
  const tmpFolder = `/tmp/${uuidv4()}`;
  const combinedFilePath = `${tmpFolder}/${combinedFileName}`;

  // First, check to see if the file already exists on the server
  const exists = await fileExists(`${bookId}/${combinedFileName}`);

  if (exists) {
    return NextResponse.json({ message: 'Section file already exists on the server, no need to reprocess.' }, { status: 200 });
  }

  // Retrieve all of the metadata files for the audio
  const metadata = await db
    .select()
    .from(blockMetadata)
    .where(
      and(
        eq(blockMetadata.bookId, bookId),
        eq(blockMetadata.sectionOrder, parseInt(order)),
        eq(blockMetadata.type, 'text')
      )
    )
    .orderBy(asc(blockMetadata.blockIndex));

  const audioFiles: any[] = [];

  // check to see if the tmp directory already exists
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
  }

  // iterate through all of the metadata items, and download them in parallel
  try {
    await Promise.all(metadata.map(async (meta, i) => {
      console.log(`Processing file ${i + 1} of ${metadata.length} of book ${bookId}`);
      const filePath = path.join(tmpFolder, `${meta.blockId}.mp3`);
      await downloadWithRetry(bookId, meta.blockId, filePath);
      audioFiles.push({ meta, filePath });
    }));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  // Combine all of the audio files into a single file
  await new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg();

    audioFiles
      .sort((a, b) => (a.meta.blockIndex || 0) - (b.meta.blockIndex || 0))
      .forEach((file) => {
        ffmpegCommand.input(file.filePath);
      });

    ffmpegCommand
      .on('end', resolve)
      .on('error', reject)
      .mergeToFile(combinedFilePath, tmpFolder);
  });

  if (!fs.existsSync(combinedFilePath)) {
    return NextResponse.json({ error: 'Combined file not found' }, { status: 500 })
  }

  // check to make sure the file actually has contents in it
  const fileStats = fs.statSync(combinedFilePath);

  if (fileStats.size === 0) {
    return NextResponse.json({ error: 'Combined file is empty' }, { status: 500 });
  }

  // convert the local file to a buffer
  const combinedFileBuffer = await fs.promises.readFile(combinedFilePath);

  // upload the combined file to the server
  await uploadFile(`${bookId}/${combinedFileName}`, combinedFileBuffer, 'audio/mpeg');

  // clean up the temp directory
  fs.unlinkSync(combinedFilePath);
  fs.rmdirSync(tmpFolder, { recursive: true });

  return NextResponse.json({ message: 'Audio files combined successfully', combinedFilePath });
}
