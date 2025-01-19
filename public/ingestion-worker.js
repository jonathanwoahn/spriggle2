self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  self.skipWaiting(); // Activate the Service Worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  // Perform cleanup or initialization
});

self.addEventListener('message', (event) => {
  const { task, data } = event.data;

  if (task === 'advanceJob') {
    const result = processBook(data);
    event.source.postMessage({ status: 'success', result });
  }
});

function processBook(data) {
  // Simulate a book processing task
  return `Processed book with ID: ${data.bookId}`;
}