import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  distDir: 'build', // Changes the build output directory to `build`
  outputFileTracingRoot: path.join(__dirname, '..'),
  // Ensure React Router is bundled correctly
  transpilePackages: ['react-router-dom'],
}

export default nextConfig

