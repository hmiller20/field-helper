/// <reference lib="webworker" />

import { Serwist } from "serwist";
import { NetworkFirst, ExpirationPlugin } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.protocol.startsWith('http'),
      handler: new NetworkFirst({
        cacheName: "offlineCache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500, // Increase cache size
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            purgeOnQuotaError: true, // Clean up if quota exceeded
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});