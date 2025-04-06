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
        unoptimized: true, // This is critical for consistent rendering
        domains: ['kidistselassieyouth.com', 'localhost'], // Add your domain to allowed list
    },
    reactStrictMode: true,
    // Output option for improved static file handling
    output: 'standalone',
};

export default config;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       domains: ['img.clerk.com', 'images.clerk.dev'],
//     },
//     reactStrictMode: true,
//   };

