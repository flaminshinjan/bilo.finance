/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip TypeScript type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        _http_common: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
        querystring: false,
        util: false,
        buffer: false,
        events: false,
        net: false,
        tls: false,
        dns: false,
        worker_threads: false,
        child_process: false,
      };
    }
    
    // Handle ES modules
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Ignore problematic test files
    config.module.rules.push({
      test: /test\/.*\.mjs$/,
      loader: 'ignore-loader'
    });

    return config;
  },
  // Updated for Next.js 15+
  serverExternalPackages: ['@mastra/core', '@ai-sdk/anthropic'],
};

module.exports = nextConfig;
