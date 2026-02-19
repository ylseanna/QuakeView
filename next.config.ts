/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import("next").NextConfig} */

const createNextIntlPlugin = require("next-intl/plugin");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */

const basePath = "";
const defaultLocale = "en-US";

module.exports = withBundleAnalyzer(
  withNextIntl({
    reactStrictMode: false,
    basePath: basePath,
    env: {
      HOST: "localhost:8090",
      API_HOST: "localhost:8100",
    },
    transpilePackages: ["mui-file-input"],
    devIndicators: false,
    experimental: {
      proxyTimeout: 600000,
      optimizePackageImports: ["@mui/material", "@mui/icons-material" ],
    },
    // // Redirect basePath to path with locale due to next-intl not supporting basePath
    // async redirects() {
    //   return [
    //     {
    //       source: "/",
    //       destination: `/${defaultLocale}`,
    //       permanent: true,
    //     },
    //   ];
    // },
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8100/api/:path*", // Matched parameters can be used in the destination
        },
      ];
    },
  }),
);
