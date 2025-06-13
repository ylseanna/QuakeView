/** @type {import("next").NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */

const basePath = "";
const defaultLocale = "en";

module.exports = withNextIntl({
  reactStrictMode: false,
  output: "standalone",
  basePath: basePath,
  env: {
    HOST: "localhost:8090",
    API_HOST: "localhost:8100",
  },
  transpilePackages: ['mui-file-input'],
  devIndicators: false,
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
        source: '/api/:path*',
        destination: "http://localhost:8100/api/:path*", // Matched parameters can be used in the destination
      },
    ]
  },
});
