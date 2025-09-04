import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  basePath: '/client',
  assetPrefix: '/client',
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build', // Changes the build output directory to `build`
  outputFileTracingRoot: path.join(__dirname, '..'),
}

export default nextConfig

