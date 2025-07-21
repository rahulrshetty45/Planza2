/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['axios', 'socket.io-client'],
  },
  
  // Enable webpack configuration for Node.js modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow importing of .js files from parent directory
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/automation': '../',
      }
    }
    
    return config
  },
  
  // Environment variables configuration
  env: {
    CUSTOM_KEY: 'planza-takeoff-platform',
  },
  
  // Image configuration
  images: {
    domains: ['localhost'],
  },
  
  // Headers configuration for security and CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  
  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 