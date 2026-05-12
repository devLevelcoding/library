/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  },
}

module.exports = nextConfig