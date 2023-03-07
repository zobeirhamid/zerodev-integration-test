/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL,
  generateRobotsTxt: true, // (optional)
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", disallow: "/developer" },
      { userAgent: "*", allow: "/" },
    ],
  },
  exclude: ["/developer"],
}; // ref: https://www.youtube.com/watch?v=fOoH9Z5adrg&ab_channel=LeighHalliday
