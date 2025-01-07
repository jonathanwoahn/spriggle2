import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { IBlockJobs } from "../book/[id]/tts/route";
import OpenAI from 'openai';

const MAX_CONCURRENT_JOBS = 250;
const AUDIO_BUCKET = 'audio';

const ensureBucketExists = async (supabase: any, bucketName: string) => {
  // List all buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Error listing buckets:', listError.message);
    return;
  }

  // Check if the bucket already exists
  const bucketExists = buckets.some(bucket => bucket.name === bucketName);

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
        error: err,
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