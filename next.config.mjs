import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,   // Cache route JSON during client-side navigation
  disable: process.env.NODE_ENV === "development",
})(nextConfig);