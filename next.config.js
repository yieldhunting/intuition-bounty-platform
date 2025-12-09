/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  },
  transpilePackages: [
    '@0xintuition/sdk',
    '@0xintuition/protocol', 
    '@0xintuition/graphql'
  ]
}

module.exports = nextConfig