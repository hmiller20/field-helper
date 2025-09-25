/** @type {import('next').NextConfig} */
import withSerwist from "@serwist/next";

const nextConfig = {
  // Your regular Next.js config options can go here
};

export default withSerwist({
  swSrc: "public/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  // This list precaches the core files needed for your PWA to launch offline,
  // based on your final manifest.json.
  additionalPrecacheEntries: [
    "/consent",
    "/manifest.json",
    "/favicon.ico",
    "/icon-192x192.png",
    "/icon-512x512.png",
  ],
  disable: process.env.NODE_ENV === "development",
})(nextConfig);