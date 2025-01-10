import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { IBlockJobs } from "../book/[id]/tts/route";
import OpenAI from 'openai';
import * as mm from 'music-metadata';

const MAX_CONCURRENT_JOBS = 100;
const AUDIO_BUCKET = 'audio';

type Any = any;

const ensureBucketExists = async (supabase: any, bucketName: string) => {
  // List all buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError.message);
    return;
  }

  // Check if the bucket already exists
  const bucketExists = buckets.some((bucket: Any) => bucket.name === bucketName);

  if (!bucketExists) {
    // Create the bucket if it doesn't exist
    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName);

    if (createError) {
      console.error('Error creating bucket:', createError.message);
    } else {
      console.log('Bucket created successfully:', createData);
    }
  } else {
    console.log('Bucket already exists:', bucketName);
  }
}

export const GET = async (req: NextRequest) => {
  console.log('CRON JOB');

  const supabase = await createClient();
  await ensureBucketExists(supabase, AUDIO_BUCKET);

    // Retrieve the OpenAI API key from the /settings endpoint
  const { data: settings, error: settingsError } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'openAiApiKey')
    .single();

  if (settingsError) {
    console.error('Error fetching OpenAI API key:', settingsError);
    return NextResponse.json({ error: 'Error fetching OpenAI API key' });
  }

  const openaiApiKey = settings.value;
  const openai = new OpenAI({ apiKey: openaiApiKey });


  // Retrieve pending jobs with a limit
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .limit(MAX_CONCURRENT_JOBS);

  if (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Error fetching jobs' });
  }

  console.log(`Queuing up ${jobs.length} jobs`);
  
  // Process jobs in parallel
  const processJob = async (job: IBlockJobs) => {
    try {
      // Update job status to 'processing'
      await supabase
        .from('jobs')
        .update({ status: 'processing' })
        .eq('id', job.id);

      // Submit text to OpenAI TTS
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'fable',
        input: job.data.text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());

      // Store the audio in Supabase storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(`${job.data.omnibookId}/${job.data.bookBlockId}.mp3`, buffer, {
          contentType: 'audio/mpeg',
        });      

      if(storageError) {
        throw new Error(`Error storing audio: ${storageError.message}`);
      }

      try {
        const meta = await mm.parseBuffer(buffer, 'audio/mpeg');
        const duration = Math.trunc((meta.format.duration || 0) * 1000);

        if(!duration || duration === 0) {
          throw new Error('Failed to get audio duration');
        }
  
        // store metadata in the audio_metadata table
        const { data, error: metadataError } = await supabase.from('audio_metadata')
          .insert({
            book_id: job.data.omnibookId,
            block_id: job.data.bookBlockId,
            section_order: job.data.section_order,
            block_index: job.data.index,
            duration,
          });
  
        if(metadataError) {
          throw new Error(`Error storing metadata for blockId: ${job.data.bookBlockId}, ${metadataError.message}`);
        }

      } catch (e) {
        throw new Error((e as Error).message);
      }

      // Update job status to 'completed'
      await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', job.id);

      console.log(`Job ${job.id} completed`);
    } catch (err) {
      console.error(`Error processing job ${job.id}:`, err);

      // Update job status to 'failed' and log the error
      const logEntry = {
        timestamp: new Date().toISOString(),
        error: JSON.stringify((err as Error).message),
      };

      // Fetch the current log
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('log')
        .eq('id', job.id)
        .single();

      if (jobError) {
        console.error(`Error fetching job log for job ${job.id}:`, jobError);
        return;
      }

      const updatedLog = jobData.log ? [...jobData.log, logEntry] : [logEntry];
      await supabase
        .from('jobs')
        .update({
          status: 'failed',
          log: updatedLog,
        })
        .eq('id', job.id);    
    }
  };

  const jobPromises = jobs.map(processJob);
  await Promise.all(jobPromises);

  return NextResponse.json({ message: "Jobs processed with concurrency limit" });
}