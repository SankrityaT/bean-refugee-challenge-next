/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow cross-origin requests during development
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://10.182.151.64:3000',
  ],
};

export default nextConfig;