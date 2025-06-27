/// <reference lib="webworker" />

import { Serwist, CacheFirst, NetworkFirst, ExpirationPlugin } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({url}) => url.pathname.match(/\.(pdf|mjs)$/i) !== null,
      handler: new CacheFirst({
        cacheName: "pdf-cache",
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          })
        ]
      }),
    },
    {
      matcher: ({url}) => url.protocol.startsWith('http'),
      handler: new NetworkFirst({
        cacheName: "offlineCache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
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