'use client';

import { isAdmin } from "@/utils/supabase/client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {

  useEffect(() => {
    const registerServiceWorker = async () => {
      const admin = await isAdmin();
      if (admin) {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration('/ingestion-worker.js');
          if (!registration) {
            navigator.serviceWorker.register('/ingestion-worker.js')
              .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
              })
              .catch((error) => {
                console.error('Service Worker registration failed:', error);
              });
          }
        }
      }
    };

    registerServiceWorker();
  }, []);
  
  return null;
}