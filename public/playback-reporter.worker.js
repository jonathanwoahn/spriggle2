const REPORT_INTERVAL = 30000; // 30 seconds
const DB_NAME = 'PlaybackReportsDB';
const STORE_NAME = 'reports';
let isSendingReports = false;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function getAllReports(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function clearReports(db, reports) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const deletePromises = reports.map(report => {
      return new Promise((resolve, reject) => {
        const request = store.delete(report.id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    });

    Promise.all(deletePromises)
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

async function sendReports() {
  if(isSendingReports) return;
  isSendingReports = true;

  const db = await openDatabase();
  const reportsArray = await getAllReports(db);

  if (reportsArray.length > 0) {
    try {
      const response = await fetch('/api/reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportsArray),
      });

      if (response.ok) {
        const { data } = await response.json();

        await clearReports(db, data);
        self.postMessage({ status: 'success', data });
      } else {
        self.postMessage({ status: 'error', message: 'Failed to send reports' });
      }
    } catch (error) {
      self.postMessage({ status: 'error', message: error.message });
    }
  } else {
    self.postMessage({ status: 'no-reports' });
  }

  isSendingReports = false;
}

function startReporting() {
  setInterval(sendReports, REPORT_INTERVAL);
}

self.addEventListener('message', (event) => {
  if (event.data.task === 'start') {
    startReporting();
  }
});