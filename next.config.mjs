import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withSerwist({
  swSrc: "public/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,   // Cache route JSON during client-side navigation
  additionalPrecacheEntries: ["/"],  // Ensure root path is always cached as app shell
  disable: process.env.NODE_ENV === "development",
})(nextConfig);