/** @type {import('next').NextConfig} */
/**
 * Global Next.js configuration.
 * Disables the X-Powered-By header and applies strict security headers to all routes.
 */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Increase body size limit for large payloads in server actions
    serverActions: { bodySizeLimit: "5mb" },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};
export default nextConfig;
