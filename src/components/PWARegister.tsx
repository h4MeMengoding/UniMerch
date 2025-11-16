"use client";

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          // Registered
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available, you might show a toast to the user
                  console.log('New content available, please refresh.');
                } else {
                  console.log('Content is cached for offline use.');
                }
              }
            });
          });
        }).catch(err => console.error('Service worker registration failed:', err));
      });
    }
  }, []);

  return null;
}
