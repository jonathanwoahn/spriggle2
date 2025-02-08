'use client';

import { useEffect } from "react";

export const SERVICE_WORKER_PATH = '/ingestion.worker.js';

export default function RegisterServiceWorker() {

  useEffect(() => {
    // const startJobProcessing = () => {
    //   if(navigator.serviceWorker.controller) {
    //     console.log('send message startProcessing');
    //     navigator.serviceWorker.controller.postMessage( {task: 'startProcessing'});
    //   }
    // }
    
    // const registerServiceWorker = async () => {
    //   if ('serviceWorker' in navigator) {
    //     const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);

    //     if (!registration) {
    //       // navigator.serviceWorker.register(SERVICE_WORKER_PATH)
    //       navigator.serviceWorker.register(SERVICE_WORKER_PATH, { type: 'module' })
    //         .then((registration) => {
    //           console.log('Service Worker registered with scope:', registration.scope);
    //         })
    //         .catch((error) => {
    //           console.error('Service Worker registration failed:', error);
    //         });
    //     }else {
    //       // startJobProcessing();
    //     }
    //   }
    // };
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
          if (!registration) {
            const newRegistration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, { type: 'module', scope: '/' });
            // const newRegistration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
            console.log('Service Worker registered with scope:', newRegistration.scope);
          } else {
            console.log('Service Worker already registered with scope:', registration.scope);
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };
    

    registerServiceWorker();
  }, []);
  
  return null;
}