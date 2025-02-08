import { EVENTS, state } from './state.js';
import { dispatcher } from './dispatcher.js';

export const processJobs = async () => {
  if(state.isProcessing) return;
  console.log('[Ingestion Worker] Processing jobs');

  await dispatcher({ task: EVENTS.UPDATE_PROCESSING, status: true });
  
  try {
    await checkWaitingDeps();

    const { data, count } = await retrievePendingJobs();

    if(count === 0) {
      // insert artificial delay to prevent the worker from spinning
      console.log('[Ingestion Worker] No jobs to process, waiting 30 seconds');
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }

    /**
     * 1. group jobs by their type
     * 2. the only job type that can't be processed in parallel is the 'section-concat-meta' job
     */

    const jobGroups = data.reduce((acc, job) => {
      if(!acc[job.job_type]){
        acc[job.job_type] = [];
      }

      acc[job.job_type].push(job);
      return acc;
    }, {});
    
    // iterate through all of the items in the job group
    for (const jobType in jobGroups) {
      switch(jobType) {
        case 'section-concat-meta':
          for (const job of jobGroups[jobType]) {
            const res = await executeJobs([job.id]);
            console.log(res);
          }
          break;
        case 'book-meta':
        case 'convert-to-audio':
        case 'book-summary':
        case 'summary-embedding':
          const embeddingRes = await executeJobs(jobGroups[jobType].map(job => job.id));
          console.log(embeddingRes);
          break;
        default:
          throw new Error(`Unsupported job type: ${jobType}`);
      }
    }
    

  } catch(e) {
    console.error('[Ingestion Worker] Error processing jobs: ', e);

  } finally {
    await dispatcher({ task: EVENTS.UPDATE_PROCESSING, status: false });
  }
}

const executeJobs = async (jobIds) => {
  const body = JSON.stringify(jobIds);
  const URL = `/api/jobs/execute`;
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
  });

  if(!response.ok){
    throw new Error(response.statusText);
  }

  return response.json();
}

const checkWaitingDeps = async () => {
  const url = `/api/jobs/check-waiting`;
  const response = await fetch(url, { method: 'POST' });
  if(!response.ok){
    throw new Error('Failed to check waiting dependencies');
  }

  return;
}

const retrievePendingJobs = async () => {
  const URL = `/api/jobs?selectedTab=pending&limit=100`;
  const response = await fetch(URL);
  if(!response.ok){
    throw new Error('Failed to retrieve pending jobs');
  }
  return response.json();
}
