/** @type {import("next").NextConfig} */
import { withAxiom } from "next-axiom";

const config = withAxiom({
  reactStrictMode: true,
  /* If trying out the experimental appDir, comment the i18n config out
   * @see https://github.com/vercel/next.js/issues/41980 */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  transpilePackages: ["@zerodevapp", "@web3"],
});
export default config;
