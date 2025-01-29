import { BlockType, IBlockJob, IBlockMetadata } from "@/lib/types";
import { IJobResults, updateAndCompleteJobFailed, updateAndCompleteJobSuccessfully, updateMetadataAndCompleteJob } from "./helpers";
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';


const MAX_RETRIES = 3;

async function downloadWithRetry(baseUrl: string,bookId: string, blockId: string, filePath: string, retries: number = MAX_RETRIES): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const audioResponse = await fetch(`${baseUrl}/api/audio/${bookId}/file/${blockId}.mp3`);

      if (!audioResponse.ok) {
        throw new Error(`Failed to download ${blockId}: ${audioResponse.statusText}`);
      }

      const audioFile = await audioResponse.blob();

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

const fileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (e) {
    if (e instanceof Response && e.status === 404) {
      return false;
    }
    
    throw e;
  }
}

export const concatSectionAudio = async (job: IBlockJob, baseUrl: string): Promise<IJobResults> => {
  try {

    const { data: {order, bookId, blockId} } = job;
  
    const combinedFileName = `${bookId}-${order}.mp3`;
    const tmpFolder = `/tmp/${uuidv4()}`;
    const combinedFilePath = `${tmpFolder}/${combinedFileName}`;
  
    const fileUrl = `${baseUrl}/audio/${bookId}/file/${combinedFileName}/exists`;
    const exists = await fileExists(fileUrl);
  
    if(exists) {
      return updateAndCompleteJobSuccessfully({job, baseUrl, message: 'Audio file already exists, skipping.'});
    }
  
    const metaUrl = `${baseUrl}/api/metadata?bookId=${bookId}&sectionOrder=${order}&type=text`;
    const metadataReponse = await fetch(metaUrl);
  
    if(!metadataReponse.ok) {
      throw new Error(`Failed to retrieve metadata for book ${bookId} and section ${order}`);
    }
  
    const {data: metadata}: {data: IBlockMetadata[]} = await metadataReponse.json();
  
    if(metadata.length === 0) {
      // throw new Error(`No metadata found for book ${bookId} and section ${order}`);
      // return updateAndCompleteJobSuccessfully({job, baseUrl, message: `This section doesn't have any audioFiles, skipping.`});
      // some sections won't have audio files. still need to create a section metadata for it
      const sectionWithoutAudioMetadata: IBlockMetadata = {
        book_id: bookId,
        block_id: blockId,
        block_index: 0,
        type: BlockType.SECTION,
        section_order: order as number,
        data: {
          duration: 0,
        },
      };
  
      return updateMetadataAndCompleteJob(sectionWithoutAudioMetadata, job, baseUrl);
    }
    
    const audioFiles: any[] = [];
  
    // check to see if the tmp directory already exists. Since we're using a random UUID, this should be unique
    if (!fs.existsSync(tmpFolder)) {
      fs.mkdirSync(tmpFolder);
    }
  
    // iterate through all of the metadata items, and download them in parallel. WAY faster than in serial, it was amazing
    await Promise.all(metadata.map(async (meta, i) => {
      try {
        console.log(`Processing file ${i + 1} of ${metadata.length} of book ${bookId}`);
        const filePath = path.join(tmpFolder, `${meta.block_id}.mp3`);
        await downloadWithRetry(baseUrl, bookId, meta.block_id, filePath);
        audioFiles.push({ meta, filePath });
      } catch (error) {
        throw new Error((error as Error).message);
      }
    }));
  
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
  
    if (!fs.existsSync(combinedFilePath)) {
      throw new Error('Local combined file not found');
    }
  
    // check to make sure the file actually has contents in it. Some times for one reason or another, the file is empty
    const fileStats = fs.statSync(combinedFilePath);
  
    if (fileStats.size === 0) {
      throw new Error('Combined file is empty');
    }
  
    // convert the local file to a buffer
    const combinedFileBuffer = await fs.promises.readFile(combinedFilePath);
  
    // upload the combined file to the server
    const formData = new FormData();
    formData.append('file', new Blob([combinedFileBuffer], { type: 'audio/mpeg' }));
    formData.append('bookId', bookId);
    formData.append('filename', `${combinedFileName}`);
  
    const audioResponse = await fetch(`${baseUrl}/api/audio`, {
      method: 'POST',
      body: formData,
    });
  
    if (!audioResponse.ok) {
      throw new Error(audioResponse.statusText);
    }
    
    // build the metadata for the section
    const audioMeta = await mm.parseFile(combinedFilePath);
    const duration = Math.trunc((audioMeta.format.duration || 0) * 1000);
  
    if (!duration || duration === 0) {
      throw new Error('Failed to get audio duration');
    }
  
    const sectionMetadata: IBlockMetadata = {
      book_id: bookId,
      block_id: blockId,
      block_index: 0,
      type: BlockType.SECTION,
      section_order: order as number,
      data: {
        duration,
      },
    };
  
    // clean up the temp directory
    fs.unlinkSync(combinedFilePath);
    fs.rmdirSync(tmpFolder, { recursive: true });
  
    return updateMetadataAndCompleteJob(sectionMetadata, job, baseUrl);
  }catch(e) {
    console.error('ERROR: ', e);
    return updateAndCompleteJobFailed({job, baseUrl, message: (e as Error).message});
  }
}