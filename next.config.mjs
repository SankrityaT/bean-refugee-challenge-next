/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed swcMinify as it's no longer needed in Next.js 15
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://10.182.151.64:3000',
  ],
};

export default nextConfig;