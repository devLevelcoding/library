/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@prisma/client", "@libsql/client", "@prisma/adapter-libsql"],
}

module.exports = nextConfig
