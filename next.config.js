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
      "tap": false,
      "worker_threads": false,
    }

    // Ignore all warnings and errors for optional dependencies and test-related modules
    config.ignoreWarnings = [
      { module: /node_modules\/pino/ },
      { module: /node_modules\/@metamask/ },
      { module: /node_modules\/thread-stream/ },
      { module: /node_modules.*\/test\// },
      { message: /Can't resolve 'tap'/ },
      { message: /Can't resolve 'pino-pretty'/ },
      { message: /Can't resolve '@react-native-async-storage\/async-storage'/ },
      { message: /Can't resolve 'worker_threads'/ },
      { message: /Module not found.*tap/ },
      { message: /Attempted import error.*test/ }
    ]

    return config
  },
  transpilePackages: [
    '@0xintuition/sdk',
    '@0xintuition/protocol', 
    '@0xintuition/graphql'
  ],
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: false
  }
}

module.exports = nextConfig