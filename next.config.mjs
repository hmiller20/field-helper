import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withSerwist({
  swSrc: 'public/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  additionalPrecacheEntries: ['/consent', 'manifest.json', 'favicon.ico'], // or '/' if you keep the root shell
  // register: true is default
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);