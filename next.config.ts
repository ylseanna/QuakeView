import { withSentryConfig } from "@sentry/nextjs";
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
    // Redirect basePath to path with locale due to next-intl not supporting basePath
    async redirects() {
      return [
        {
          source: "/",
          destination: `/${defaultLocale}`,
          permanent: true,
          basePath: false,
        },
      ];
    },
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

export default withSentryConfig(undefined, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "ylse-anna-de-vries",

  project: "quakeview-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
