/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
}

module.exports = nextConfig
