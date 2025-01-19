import { IBlockJob, IBlockMetadata } from "@/lib/types";
import { IJobResults, updateMetadataAndCompleteJob } from "./helpers";

export const generateSummaryEmbedding = async (job: IBlockJob, baseUrl: string): Promise<IJobResults> => {
  const metadataResponse = await fetch(`${baseUrl}/api/metadata?bookId=${job.data.bookId}&blockId=${job.data.blockId}&limit=1`);
  if (!metadataResponse.ok) {
    throw new Error('Error fetching metadata');
  }

  const { data: metadata, error: metadataError } = await metadataResponse.json();
  if (metadataError || !metadata[0] || metadata.length > 1) {
    throw new Error(metadataError.message);
  }

  const { data: { summary } } = metadata[0];

  const embeddingResponse = await fetch(`${baseUrl}/api/ai/generate-embedding`, {
    method: 'POST',
    body: JSON.stringify({ text: summary }),
  });

  if (!embeddingResponse.ok) {
    throw new Error(embeddingResponse.statusText);
  }

  const {embedding} = await embeddingResponse.json();

  const updatedMetadata: IBlockMetadata = {
    ...metadata[0],
    data: {
      ...metadata[0].data,
    },
    embedding,
  };

  return updateMetadataAndCompleteJob(updatedMetadata, job, baseUrl);
}
