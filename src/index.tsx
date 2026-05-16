import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const clearDevelopmentCaches = async () => {
  if (!('caches' in window)) {
    return;
  }

  const cacheNames = await window.caches.keys();
  await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();

// Registration of the Service Worker for the PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => clearDevelopmentCaches())
        .then(() => {
          console.log('Development service workers and caches cleared.');
        })
        .catch((error) => {
          console.log('Failed to clear development service workers or caches: ', error);
        });

      return;
    }

    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}