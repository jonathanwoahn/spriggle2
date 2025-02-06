'use client';

import { useEffect } from "react";

const SERVICE_WORKER_PATH = '/ingestion.worker.js';

export default function RegisterServiceWorker() {

  useEffect(() => {
    // const startJobProcessing = () => {
    //   if(navigator.serviceWorker.controller) {
    //     console.log('send message startProcessing');
    //     navigator.serviceWorker.controller.postMessage( {task: 'startProcessing'});
    //   }
    // }
    
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
        console.log('register service worker');

        if (!registration) {
          navigator.serviceWorker.register(SERVICE_WORKER_PATH)
            .then((registration) => {
              console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
        }else {
          // startJobProcessing();
        }
      }
    };

    registerServiceWorker();
  }, []);
  
  return null;
}