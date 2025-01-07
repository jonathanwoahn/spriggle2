'use client';
import { Button } from "@mui/material";

export default function GenerateAudioButton({id}: {id: string}) {

  const generateAudio = async () => {
    const res = await fetch(`http://localhost:3000/api/book/${id}/tts`, {
      method: 'POST',
    });

    await res.json();

    /**
     * generating the audio follows two general parts:
     * 1. creating the jobs and getting them into the database
     * 2. processing the jobs, and storing the audio files in the database
     * 
     * 
     * a parent job for the entire book with all of the book block id's as dependencies shouild be created. we could use this to provide a progress indicator for the book to demonstrate
     * the status of the conversion, as well as visualize how many, if any, jobs have failed
     * 
     * 
     * 
     * 
     * PART 1
     * step 1: retrieve the omnibook data from cashmere
     * step 2: convert it into an omnibook object
     * step 3: generate jobs for each of the book blocks. job data should include bookblock id, omnibook uuid, block text, timestamp
     * step 4: create a parent job with all of the book blocks as dependencies
     * step 4: store all of the jobs in jobs table of the database
     * 
     * PART 2
     * step 1: CRON job checks for pending jobs in the database
     * step 2: retrieve pending jobs, start processing them synchronously
     * step 3a: when jobs complete, store the audio file in the database and mark the job as successful
     * step 3b: if the job fails, mark the job as failed and provide a reason in the job log
     * 
     * 
     */
    

    
    
    
    
    
    
  }

  
  return (
    <Button variant="contained" color="warning" onClick={generateAudio}>Generate Audio</Button>
  );
}