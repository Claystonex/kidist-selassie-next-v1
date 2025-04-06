/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                port: '',
                pathname: '/users/**',
            },
        ],
        unoptimized: true, // Disable image optimization for better reliability
        domains: ['kidistselassieyouth.com'], // Add your domain to allowed list
    },
    reactStrictMode: true,
    // Set asset prefixes based on environment
    assetPrefix: process.env.NODE_ENV === 'production' ? 'https://kidistselassieyouth.com' : undefined,
};

export default config;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       domains: ['img.clerk.com', 'images.clerk.dev'],
//     },
//     reactStrictMode: true,
//   };

