import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  
  // This bypasses the TS check while keeping the config functional for your dev environment
  // @ts-ignore
  allowedDevOrigins: ["192.168.1.4"],
};

export default nextConfig;