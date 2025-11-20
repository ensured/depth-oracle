import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    // fix warnings for async functions in the browser (https://github.com/vercel/next.js/issues/64792)
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }
    return config;
  },
  env: {
    // Add any environment variables here if needed
  },
  async rewrites() {
    return [
      {
        source: "/api/koios/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "https://preprod.koios.rest/api/v1/:path*"
            : "https://api.koios.rest/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
