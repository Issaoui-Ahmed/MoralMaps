import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Ensure React Router is bundled correctly
  transpilePackages: ['react-router-dom'],
  basePath: '/app',
  assetPrefix: '/app',
}

export default nextConfig

