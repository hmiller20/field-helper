/// <reference lib="webworker" />

import { Serwist } from "serwist";
import { NetworkFirst, StaleWhileRevalidate, BackgroundSyncPlugin } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

// Create background sync plugin for write operations
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // 1. Cache all navigation requests (pages) - no hardcoded paths needed
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: "navigation-cache",
        networkTimeoutSeconds: 3,
      }),
    },

    // 2. Cache Next.js static assets (JavaScript, CSS, etc.)
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/'),
      handler: new NetworkFirst({
        cacheName: "next-assets",
      }),
    },

    // 3. Handle API GET requests with stale-while-revalidate
    {
      matcher: ({ url, request }) => {
        return url.pathname.startsWith('/api/') && request.method === 'GET';
      },
      handler: new StaleWhileRevalidate({
        cacheName: "api-cache",
      }),
    },

    // 4. Queue API write operations (POST/PUT/PATCH/DELETE) for background sync
    {
      matcher: ({ url, request }) => {
        return url.pathname.startsWith('/api/') &&
               ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
      },
      handler: new NetworkFirst({
        cacheName: "api-writes",
        plugins: [bgSyncPlugin],
      }),
    },

    // 5. Cache external API calls (like Supabase) with stale-while-revalidate
    {
      matcher: ({ url, request }) => {
        return (url.hostname.includes('supabase.co') ||
                url.hostname.includes('amazonaws.com')) &&
               request.method === 'GET';
      },
      handler: new StaleWhileRevalidate({
        cacheName: "external-api-cache",
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