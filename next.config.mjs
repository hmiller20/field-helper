import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // You can add any additional Next.js configuration options here.
};

export default withPWA({
  ...nextConfig,
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development"
  }
});
