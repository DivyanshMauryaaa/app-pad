import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tvggptsdfwekivkkphkl.supabase.co',
        port: '', // Leave empty if no specific port is used
        pathname: '/storage/v1/object/public/**', // This allows any path under public
      },
    ],
  },

};

export default nextConfig;
