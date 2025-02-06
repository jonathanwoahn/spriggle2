import { BlockType, IBlockJob, IBlockMetadata } from "@/lib/types";
import { IJobResults, updateAndCompleteJobFailed, updateMetadataAndCompleteJob } from "./helpers";
import * as mm from 'music-metadata';

export const convertTextToAudio = async (job: IBlockJob, baseUrl: string): Promise<IJobResults> => {
  try {

    const { data: {bookId, blockId, blockIndex, order}} = job;
    
    // get the block data
    const blockResponse = await fetch(`${baseUrl}/api/book/${bookId}/block/${blockId}`);
    const { block: {properties: { text }}} = await blockResponse.json();
    
    // convert the text from the block to audio
    const ttsResponse = await fetch(`${baseUrl}/api/ai/convert-text-to-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({text})
    });
  
    if(!ttsResponse.ok) {
      throw new Error(ttsResponse.statusText);
    }
  
    // store the audio file
    const arrayBuffer = await ttsResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    const formData = new FormData();
    formData.append('file', new Blob([buffer], {type: 'audio/mpeg'}));
    formData.append('bookId', bookId);
    formData.append('filename', `${blockId}.mp3`);
    
    const audioResponse = await fetch(`${baseUrl}/api/audio`, {
      method: 'POST',
      body: formData,
    });
  
    if(!audioResponse.ok) {
      throw new Error(audioResponse.statusText);
    }
  
    const audioMeta = await mm.parseBuffer(buffer, 'audio/mpeg');
    const duration = Math.trunc((audioMeta.format.duration || 0) * 1000);
  
    if (!duration || duration === 0) {
      throw new Error('Failed to get audio duration');
    }
  
    const metadata: IBlockMetadata = {
      book_id: bookId,
      block_id: blockId,
      type: BlockType.TEXT,
      section_order: parseInt(`${order}`),
      block_index: parseInt(`${blockIndex}`),
      data: {
        duration,
      },
    };
  
    return updateMetadataAndCompleteJob(metadata, job, baseUrl);
  }catch (e) {
    return updateAndCompleteJobFailed({job, baseUrl, message: (e as Error).message});
  }
}
