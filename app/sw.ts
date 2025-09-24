/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { Serwist } from "serwist";
import { NetworkFirst, StaleWhileRevalidate } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // Cache ANY page navigation (covers every route & counterbalance order)
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "navigation-cache",
        networkTimeoutSeconds: 3,
      }),
    },
    // Cache Next.js assets & route data like /_next/data/...
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/"),
      handler: new StaleWhileRevalidate({ cacheName: "next-assets" }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});