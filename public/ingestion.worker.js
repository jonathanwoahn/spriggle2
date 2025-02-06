console.log('[Service Worker] Loaded');

let isProcessing = false;

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  self.skipWaiting(); // Activate the Service Worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  // Perform cleanup or initialization
});

self.addEventListener('message', async (event) => {
  const { task, data } = event.data;

  console.log('[Service Worker] Received message:', task, data);

  if (task === 'startProcessing') {
    console.log('[Service Worker] Starting job processing');
    await processJobs();
  }
});

async function getJobs(status) {
  const url = `/api/jobs?rowsPerPage=100&selectedTab=${status}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function checkWaitingDeps() {
  const url = `/api/jobs/check-waiting`;
  const response = await fetch(url, { method: 'POST' });
  if(!response.ok){
    throw new Error('Failed to check waiting dependencies');
  }

  return;
}

async function processJobs() {
  console.log('[Service Worker] Processing jobs');

  await checkWaitingDeps();

  const { data, count } = await getJobs('pending');



  


  
  
  // while (true) {
  //   const jobs = await fetchPendingJobs();
  //   if (jobs.length === 0) {
  //     console.log('[Service Worker] No pending jobs found. Stopping job processing.');
  //     break;
  //   }

  //   for (const job of jobs) {
  //     const result = await processBook(job);
  //     console.log('[Service Worker] Processed job:', result);
  //   }

  //   console.log('[Service Worker] Waiting for 5 seconds before checking again');
  //   await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
  // }
}

async function fetchPendingJobs() {
  console.log('[Service Worker] Fetching pending jobs');
  // Fetch pending jobs from the API
  const response = await fetch('/api/jobs/pending');
  const data = await response.json();
  console.log('[Service Worker] Fetched jobs:', data.jobs);
  return data.jobs;
}

async function processBook(job) {
  // Simulate a book processing task
  console.log('[Service Worker] Processing book with ID:', job.bookId);
  return `Processed book with ID: ${job.bookId}`;
}