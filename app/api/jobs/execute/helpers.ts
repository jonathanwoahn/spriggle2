import { IBlockJob, IBlockMetadata, JobStatus, JobType } from "@/lib/types";
import { generateBookSummary } from "./generateBookSummary";
import { generateSummaryEmbedding } from "./generateSummaryEmbedding";
import { convertTextToAudio } from "./convertTextToAudio";
import { concatSectionAudio } from "./concatSectionAudio";
import {generateBookMeta} from "./generateBookMeta";

export interface IJobResults {
  job: IBlockJob;
  requestStatus: 'success' | 'failed';
  message?: string;
}

export const AUDIO_BUCKET = 'audio';

export const ensureBucketExists = async (supabase: any, bucketName: string) => {
  // List all buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError.message);
    return;
  }

  // Check if the bucket already exists
  const bucketExists = buckets.some((bucket: any) => bucket.name === bucketName);

  if (!bucketExists) {
    console.log(`${bucketName} doesn't exist`);
    // Create the bucket if it doesn't exist
    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName);

    if (createError) {
      console.error('Error creating bucket:', createError.message);
    } else {
      console.log('Bucket created successfully:', createData);
    }
  }
}


export const checkDependencies = async (job: IBlockJob, sb: any): Promise<boolean> => {
  const { dependencies = [] } = job;
  if (dependencies.length === 0) return true;

  const { data: jobs, error } = await sb.from('jobs').select('*').in('id', dependencies).neq('status', JobStatus.COMPLETED);

  if (error) {
    throw new Error(error.message);
  }

  if (jobs.length > 0) return false;

  // iterate through the dependencies and recursievely check if they are completed. return true only if all the child dependencies are completed
  return await Promise.all(jobs.map(async (job: IBlockJob) => {
    return await checkDependencies(job, sb);
  })).then((results) => results.every((result) => result === true));
}

export const jobRouter = async (job: IBlockJob, baseUrl: string): Promise<IJobResults> => {
  try {
    switch (job.job_type) {
      case JobType.BOOK_META:
        return generateBookMeta(job, baseUrl);
      case JobType.BOOK_SUMMARY:
        return generateBookSummary(job, baseUrl);
      case JobType.SUMMARY_EMBEDDING:
        return generateSummaryEmbedding(job, baseUrl);
      case JobType.SECTION_CONCAT_META:
        return concatSectionAudio(job, baseUrl);
      case JobType.TEXT_TO_AUDIO_META:
        return convertTextToAudio(job, baseUrl);
      default:
        const msg = `"${job.job_type}" handler has not been implemented`;
        // console.log('Unknown job type');
        throw new Error(msg);
    }

  } catch (e) {

    console.error('ERROR: ', e);
    
    // update job status to failed
    await fetch(`${baseUrl}/api/jobs`, {
      method: 'PUT',
      body: JSON.stringify({
        ...job,
        status: JobStatus.FAILED,
        log: [
          ...job.log,
          {
            timestamp: new Date().toISOString(),
            message: (e as Error).message,
          },
        ],
      }),
    });

    return {
      job,
      requestStatus: 'failed',
      message: (e as Error).message,
    };
  }
}


export const updateAndCompleteJobSuccessfully = async ({job, baseUrl, message = 'Job success'} : {job: IBlockJob, baseUrl: string, message?: string}): Promise<IJobResults> => {
  const updatedJob: IBlockJob = {
    ...job,
    status: JobStatus.COMPLETED,
    log: [
      ...job.log,
      {
        timestamp: new Date().toISOString(),
        message,
      },
    ],
  };

  const updateJobResponse = await fetch(`${baseUrl}/api/jobs`, {
    method: 'PUT',
    body: JSON.stringify(updatedJob),
  });

  if (!updateJobResponse.ok) {
    throw new Error(`Error updating job ${job.id}`);
  }

  return {
    job: updatedJob,
    requestStatus: 'success',
    message: `Job ${job.id} completed: ${message}`,
  };
}

export const updateAndCompleteJobFailed = async ({job, baseUrl, message = 'Job failed'} : {job: IBlockJob, baseUrl: string, message?: string}): Promise<IJobResults> => {
  const updatedJob: IBlockJob = {
    ...job,
    status: JobStatus.FAILED,
    log: [
      ...job.log,
      {
        timestamp: new Date().toISOString(),
        message,
      },
    ],
  };

  const updateJobResponse = await fetch(`${baseUrl}/api/jobs`, {
    method: 'PUT',
    body: JSON.stringify(updatedJob),
  });

  if (!updateJobResponse.ok) {
    throw new Error(`Error updating job ${job.id}`);
  }

  return {
    job: updatedJob,
    requestStatus: 'failed',
    message: `Job ${job.id} failed: ${message}`,
  };
}

export const updateMetadataAndCompleteJob = async (metadata: IBlockMetadata, job: IBlockJob, baseUrl: string): Promise<IJobResults> => {
  try {

    const updateMetadataResponse = await fetch(`${baseUrl}/api/metadata`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
    });
  
    if (!updateMetadataResponse.ok) {
      throw new Error(`Error updating metadata for job ${job.id}`);
    }
  
    return updateAndCompleteJobSuccessfully({job, baseUrl});
  } catch (e) {
    return updateAndCompleteJobFailed({job, baseUrl, message: (e as Error).message});
  }
}
