/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Increase body size limit for large payloads in server actions
    serverActions: { bodySizeLimit: "5mb" },
  },
};
export default nextConfig;
