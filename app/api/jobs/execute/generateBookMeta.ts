import { IBlockJob, IBlockMetadata } from "@/lib/types";
import { IJobResults, updateMetadataAndCompleteJob } from "./helpers";

export const generateBookMeta = async (job: IBlockJob, baseUrl: string): Promise<IJobResults> => {

  /**
   * 1. fetch all of the metadata blocks from the database
   * 2. calculate the start time of all the blocks, store it on the metadata object 
   * 3. update all of the text metadata blocks
   * 4. update the book metadata block with the total time
   * 5. complete the job
   */
  
  const metadataResponse = await fetch(`${baseUrl}/api/metadata?bookId=${job.data.bookId}&limit=15000`);
  if(!metadataResponse.ok) {
    throw new Error('Error fetching metadata');
  }

  const {data: metadata, error: metadataError} = await metadataResponse.json();
  if(metadataError) {
    throw new Error(metadataError.message);
  }

  const filteredBlocks: {[order: number]: IBlockMetadata[]} = metadata
    .filter((block: { type: string; }) => block.type === 'text')
    .reduce((acc: any, block: any) => {
      if(!acc[block.section_order]) {
        acc[block.section_order] = [];
      }

      acc[block.section_order].push(block);
      return acc;
    }, {});

  const adjustedBlocks: IBlockMetadata[] = Object
    .values(filteredBlocks)
    .map((section: any) => {
      let startTime = 0;
      return section
        .sort((a: { block_index: number; }, b: { block_index: number; }) => a.block_index - b.block_index)
        .reduce((acc: any, block: any) => {
          acc.push({
            ...block,
            data: {
              ...block.data,
              start_time: startTime,
            },
          });

          startTime += block.data.duration;

          return acc;
        }, []);
    })
    .reduce((acc: any[], section: any) => {
      acc.push(...section);
      return acc;
    }, []);
  

  const metadataUpdateResponse = await fetch(`${baseUrl}/api/metadata`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adjustedBlocks),
  });

  if(!metadataUpdateResponse.ok) {
    const err = await metadataUpdateResponse.json();
    console.error(err);
    throw new Error(metadataUpdateResponse.statusText);
  }
  

  let bookMetadata: IBlockMetadata = metadata.find((block: { type: string; }) => block.type === 'book');
  const totalDuration = metadata
    .filter((block: { type: string; }) => block.type === 'section')
    .reduce((acc: number, block: any) => acc + block.data.duration, 0);    
  
  bookMetadata = {
    ...bookMetadata,
    data: {
      ...bookMetadata.data,
      duration: totalDuration,
      ready: true,
    },
  };

  return updateMetadataAndCompleteJob(bookMetadata, job, baseUrl);
}