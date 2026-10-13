import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Fonts + pre-rendered Malayalam read from disk by next/og routes.
  outputFileTracingIncludes: {
    '/api/pass/[id]': ['./src/assets/**/*'],
    '/opengraph-image': ['./src/assets/**/*'],
    '/twitter-image': ['./src/assets/**/*'],
    '/code/opengraph-image': ['./src/assets/**/*'],
    '/code/twitter-image': ['./src/assets/**/*'],
    '/apple-icon': ['./src/assets/**/*'],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
