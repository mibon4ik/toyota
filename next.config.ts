import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
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
      {
        protocol: 'https',
        hostname: 'content.onliner.by', // Allow images from content.onliner.by
        port: '',
        pathname: '/**',
      },
      // Add other domains if needed, like 'example.com' if used
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
    // Optionally specify device sizes and image sizes for better optimization
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // formats: ['image/avif', 'image/webp'], // Enable AVIF and WebP
  },
   swcMinify: true, // Enable SWC minification for production builds
   // Ensure HTTP/2 is enabled if deployed on a supporting platform (Vercel enables by default)
   // No direct config here, depends on deployment environment.
};

export default nextConfig;
