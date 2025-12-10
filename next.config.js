/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add empty turbopack config to suppress the Next.js 16 warning
  turbopack: {},
  
  webpack: (config, { isServer, webpack }) => {
    // Exclude problematic viem test decorators completely
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /viem.*\/clients\/decorators\/test$/
      })
    )

    // Exclude specific problematic test files and actions
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /viem.*\/actions\/test\//
      })
    )

    // Ignore problematic test modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /(tap|why-is-node-running|worker_threads)$/
      })
    )

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
      "why-is-node-running": false,
      "pino-elasticsearch": false,
    }

    // Ignore all warnings and errors
    config.ignoreWarnings = [
      /node_modules\/pino/,
      /node_modules\/@metamask/,
      /node_modules\/thread-stream/,
      /node_modules.*\/test/,
      /node_modules.*viem.*test/,
      /Can't resolve.*tap/,
      /Can't resolve.*pino-pretty/,
      /Can't resolve.*pino-elasticsearch/,
      /Can't resolve.*@react-native-async-storage/,
      /Can't resolve.*worker_threads/,
      /Can't resolve.*why-is-node-running/,
      /Module not found/,
      /Attempted import error/,
    ]

    return config
  },
  transpilePackages: [
    '@0xintuition/sdk',
    '@0xintuition/protocol', 
    '@0xintuition/graphql'
  ],
  typescript: {
    ignoreBuildErrors: false
  }
}

module.exports = nextConfig