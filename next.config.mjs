/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["langraph"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        http2: false,
        tls: false,
        net: false,
        dns: false,
        "snowflake-sdk": false,
      };
    }
    return config;
  },
};

export default nextConfig;
