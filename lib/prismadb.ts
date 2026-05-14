// All Prisma/libsql packages are in serverExternalPackages so they are NOT
// bundled by webpack — loaded from node_modules at runtime instead.
// Using require() so webpack cannot statically inline them.

import type { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

function buildClient(): PrismaClient {
  const { PrismaClient: PC } = require("@prisma/client")
  if (process.env.TURSO_DATABASE_URL) {
    const { PrismaLibSQL } = require("@prisma/adapter-libsql")
    // v6 adapter factory takes the config directly, not a pre-created client
    const adapter = new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PC({ adapter })
  }
  return new PC()
}

function getClient(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = buildClient()
  }
  return globalThis.prisma
}

const prismadb = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return (getClient() as any)[prop]
  },
})

export default prismadb
