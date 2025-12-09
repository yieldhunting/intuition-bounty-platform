/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Handle missing optional dependencies for both server and client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
    }

    // Ignore warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/pino/ },
      { module: /node_modules\/@metamask/ },
      { message: /Can't resolve 'pino-pretty'/ },
      { message: /Can't resolve '@react-native-async-storage\/async-storage'/ }
    ]

    return config
  },
  transpilePackages: [
    '@0xintuition/sdk',
    '@0xintuition/protocol', 
    '@0xintuition/graphql'
  ]
}

module.exports = nextConfig