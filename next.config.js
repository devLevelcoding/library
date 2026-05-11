/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/webp"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  },
}

module.exports = nextConfig