/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { Serwist } from "serwist";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  NetworkOnly,
  BackgroundSyncPlugin,
} from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

const NAV_CACHE = "navigation-cache-v1";
const NEXT_ASSETS_CACHE = "next-assets-v1";
const DATA_CACHE = "data-cache-v1";
const OFFLINE_QUEUE = "api-queue-v1";

// Queue failed writes; they'll replay when back online
const bgSyncPlugin = new BackgroundSyncPlugin(OFFLINE_QUEUE, {
  maxRetentionTime: 24 * 60, // minutes
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // 1) Any full-page navigation
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: NAV_CACHE,
        networkTimeoutSeconds: 3,
      }),
    },

    // 2) Next.js assets & route data (e.g., /_next/data/…)
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/"),
      handler: new StaleWhileRevalidate({ cacheName: NEXT_ASSETS_CACHE }),
    },

    // 3) GET API/data (local API or Supabase REST)
    {
      matcher: ({ request, url }) =>
        request.method === "GET" &&
        (url.pathname.startsWith("/api/") ||
          url.hostname.endsWith(".supabase.co")),
      handler: new StaleWhileRevalidate({ cacheName: DATA_CACHE }),
    },

    // 4) Writes: queue while offline (don't look in cache)
    {
      matcher: ({ request, url }) =>
        ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
        (url.pathname.startsWith("/api/") ||
          url.hostname.endsWith(".supabase.co")),
      handler: new NetworkOnly({ plugins: [bgSyncPlugin] }),
    },
  ],
});

serwist.addEventListeners();

// Optional: offline shell if a nav isn't cached
serwist.setCatchHandler(async ({ event }) => {
  if (event.request.mode === "navigate") {
    const cache = await caches.open(NAV_CACHE);
    const offline = await cache.match("/offline"); // add a simple /offline page if you want
    return offline || Response.error();
  }
  return Response.error();
});

// Keep your SKIP_WAITING message
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});