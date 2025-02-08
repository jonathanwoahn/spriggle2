'use client';

import { useEffect } from "react";

export const SERVICE_WORKER_PATH = '/ingestion.worker.js';
export default function RegisterServiceWorker() {

  useEffect(() => {
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