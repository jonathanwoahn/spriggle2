import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const MAX_RETRIES = 3;

async function downloadWithRetry(sb: any, bookId: string, blockId: string, filePath: string, retries: number = MAX_RETRIES): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data: audioFile, error: audioError } = await sb
        .storage
        .from('audio')
        .download(`${bookId}/${blockId}.mp3`);

      if (audioError) {
        throw new Error(audioError.message);
      }

      fs.writeFileSync(filePath, Buffer.from(await audioFile.arrayBuffer()));
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

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string, order: string }> },
) => {
  const { bookId, order } = await params;
  const sb = await createClient();

  const combinedFileName = `${bookId}-${order}.mp3`;
  const tmpFolder = `/tmp/${uuidv4()}`;
  const combinedFilePath = `${tmpFolder}/${combinedFileName}`;

  // First, check to see if the file already exists on the server. If so, no need to reprocess
  const { data: existingFile, error: existingFileError } = await sb
    .storage
    .from('audio')
    .list(bookId, { search: combinedFileName });


  if (existingFileError) {
    return NextResponse.json({ error: (existingFileError as Error).message }, { status: 500 });
  }

  if (existingFile && existingFile.length > 0) {
    return NextResponse.json({ message: 'Section file already exists on the server, no need to reprocess.' }, { status: 200 });
  }
  
  // Retrieve all of the metadata files for the audio
  const { data: metadata, error: metadataError } = await sb
    .from('block_metadata')
    .select('*')
    .eq('book_id', bookId)
    .eq('section_order', order)
    .eq('type', 'text')
    .order('block_index', { ascending: true });

  if(metadataError) {
    return NextResponse.json({error: (metadataError as Error).message}, {status: 500});
  }
    
  const audioFiles: any[] = [];
  
  // check to see if the tmp directory already exists. Since we're using a random UUID, this should be unique
  if(!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
  }

  // iterate through all of the metadata items, and download them in parallel. WAY faster than in serial, it was amazing
  try {
    await Promise.all(metadata.map(async (meta, i) => {
      console.log(`Processing file ${i + 1} of ${metadata.length} of book ${bookId}`);
      const filePath = path.join(tmpFolder, `${meta.block_id}.mp3`);
      await downloadWithRetry(sb, bookId, meta.block_id, filePath);
      audioFiles.push({meta, filePath});
    }));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }  


  // Combine all of the audio files into a single file
  await new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg();

    audioFiles
      .sort((a, b) => a.meta.block_index - b.meta.block_index)
      .forEach((file) => {
        ffmpegCommand.input(file.filePath);
      });

    ffmpegCommand
      .on('end', resolve)
      .on('error', reject)
      .mergeToFile(combinedFilePath, tmpFolder);
  });
  
  if(!fs.existsSync(combinedFilePath)) {
    return NextResponse.json({ error: 'Combined file not found'}, {status: 500})
  }

  // check to make sure the file actually has contents in it. Some times for one reason or another, the file is empty
  const fileStats = fs.statSync(combinedFilePath);

  if(fileStats.size === 0) {
    return NextResponse.json({ error: 'Combined file is empty'}, {status: 500});
  }
  
  // convert the local file to a buffer
  const combinedFileBuffer = await fs.promises.readFile(combinedFilePath);

  // upload the combined file to the server
  const { data: uploadData, error: uploadError } = await sb
    .storage
    .from('audio')
    .upload(`${bookId}/${combinedFileName}`, combinedFileBuffer, {
      contentType: 'audio/mpeg',
    });
  
  if(uploadError) {
    return NextResponse.json({error: (uploadError as Error).message}, {status: 500});
  }
  
  // clean up the temp directory
  fs.unlinkSync(combinedFilePath);
  fs.rmdirSync(tmpFolder, { recursive: true });
  
  return NextResponse.json({ message: 'Audio files combined successfully', combinedFilePath });
}