import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build', // Changes the build output directory to `build`
  outputFileTracingRoot: path.join(__dirname, '..'),
  // Ensure React Router is bundled correctly
  transpilePackages: ['react-router-dom'],
}

export default nextConfig

