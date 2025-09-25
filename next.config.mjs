/** @type {import('next').NextConfig} */
// This now uses the official two-step initialization from the Serwist docs.
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // IMPORTANT: The source file is now in `app/`, not `public/`.
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // We still precache the essentials for our app shell.
  additionalPrecacheEntries: [
    "/consent",
    "/manifest.json",
    "/favicon.ico",
    "/icon-192x192.png",
    "/icon-512x512.png",
  ],
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  // Your regular Next.js config options can go here
};

// The final export wraps your Next.js config.
export default withSerwist(nextConfig);