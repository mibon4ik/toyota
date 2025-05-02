
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Configure allowed domains for next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'fastly.picsum.photos', // Add if using fastly CDN
        port: '',
        pathname: '/**',
      },
      { // Add example.com to allowed hostnames
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      { // Allow images from content.onliner.by
        protocol: 'https',
        hostname: 'content.onliner.by',
        port: '',
        pathname: '/**',
      }
      // Add other domains if needed
    ],
    // Optionally, specify device sizes and image sizes for better optimization
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // formats: ['image/avif', 'image/webp'], // Enable AVIF and WebP
  },
   swcMinify: true, // Enable SWC minification for production builds
   // Remove experimental flags if not strictly needed or causing issues
  // experimental: {
  //   appDir: true, // Assuming App Router is used
  // },
   // Ensure HTTP/2 is enabled if deployed on a supporting platform (Vercel enables by default)
   // No direct config here, depends on deployment environment.
};

export default nextConfig;
