import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    output: 'standalone', // For Docker deployment
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'etfbgipaorilamlvgylu.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default nextConfig;
