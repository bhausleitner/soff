/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en"
  },
  transpilePackages: ["geist"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // This copies the worker file to the build directory
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(
                process.cwd(),
                "node_modules/pdfjs-dist/build/pdf.worker.js"
              ),
              to: path.resolve(
                process.cwd(),
                ".next/static/chunks/pdf.worker.js"
              )
            }
          ]
        })
      );

      // Alias the worker path to the copied location
      config.resolve.alias["pdfjs-dist/build/pdf.worker"] =
        "/_next/static/chunks/pdf.worker.js";
    }
    return config;
  }
};

export default config;
