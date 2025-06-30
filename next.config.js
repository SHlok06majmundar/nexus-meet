/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable for socket.io and PeerJS to work properly
  // Enable WebSocket support in Vercel deployments
  webpack: (config, { isServer }) => {
    // Add WebSocket support
    config.externals = [...(config.externals || [])];
    
    // Important for socket.io-client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false
      };
    }
    return config;
  },
}

module.exports = nextConfig
