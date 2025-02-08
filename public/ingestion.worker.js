console.log('[Ingestion Worker] Loaded');

import { dispatcher } from './ingestion/dispatcher.js';
import { processJobs } from './ingestion/job-processor.js';
import { EVENTS, state } from './ingestion/state.js';

const CYCLE_TIME = 1000;
let intervalId;

// Service worker lifecycle, immediately activate the service worker
self.addEventListener('install', (event) => {
  console.log('[Ingestion Worker] Installed');
  self.skipWaiting(); // Activate the Service Worker immediately
});

// Notification the service worker has been activated
self.addEventListener('activate', (event) => {
  console.log('[Ingestion Worker] Activated');
});

self.addEventListener('message', async (event) => {
  const { data: action } = event;
  console.log('[Ingestion Worker] Received message:', action);

  await dispatcher(action);
});

self.addEventListener(EVENTS.CHANGE_STATE, async (event) => {
  if (state.isOn) {
    intervalId = setInterval(processJobs, CYCLE_TIME);
  }

  if (!state.isOn) {
    clearInterval(intervalId);
  }
});

