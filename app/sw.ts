/// <reference lib="webworker" />

import { Serwist, CacheFirst, NetworkFirst, ExpirationPlugin } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // Cache all same-origin requests (pages, API, everything)
    {
      matcher: ({ url }) => {
        return url.origin === self.location.origin;
      },
      handler: new NetworkFirst({
        cacheName: "app-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          })
        ]
      }),
    },
    // Cache static assets with cache-first for performance
    {
      matcher: ({ url }) => 
        url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|ico|png|jpg|jpeg|gif|svg)$/i) !== null,
      handler: new CacheFirst({
        cacheName: "static-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          })
        ]
      }),
    },
    // Cache PDF files
    {
      matcher: ({url}) => url.pathname.match(/\.(pdf|mjs)$/i) !== null,
      handler: new CacheFirst({
        cacheName: "document-cache",
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          })
        ]
      }),
    },
  ],
});

serwist.addEventListeners();

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});