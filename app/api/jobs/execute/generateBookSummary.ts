import { IBlockJob, IBlockMetadata } from "@/lib/types";
import { IJobResults, updateMetadataAndCompleteJob } from "./helpers";

export const generateBookSummary = async (job: IBlockJob, baseUrl: string): Promise<IJobResults> => {
  // fetch the metadata object for the book
  const metadataResponse = await fetch(`${baseUrl}/api/metadata?bookId=${job.data.bookId}&blockId=${job.data.blockId}&limit=1`);
  if (!metadataResponse.ok) {
    throw new Error('Error fetching metadata');
  }

  const { data: metadata, error: metadataError } = await metadataResponse.json();
  if (metadataError || !metadata[0] || metadata.length > 1) {
    throw new Error(metadataError.message);
  }

  // generate a summary of the book
  const summaryResponse = await fetch(`${baseUrl}/api/book/${job.data.bookId}/generate-summary`, { method: 'POST' });
  if (!summaryResponse.ok) {
    throw new Error('Error fetching summary');
  }

  const { summary } = await summaryResponse.json();
  const updatedMetadata: IBlockMetadata = {
    ...metadata[0],
    data: {
      ...metadata[0].data,
      summary,
    },
  };

  return updateMetadataAndCompleteJob(updatedMetadata, job, baseUrl);
}