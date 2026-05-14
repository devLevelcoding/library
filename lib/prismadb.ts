import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

function buildClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    // eslint-disable-next-line
    const { createClient } = require("@libsql/client")
    // eslint-disable-next-line
    const { PrismaLibSql } = require("@prisma/adapter-libsql")
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSql(libsql)
    // eslint-disable-next-line
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}

function getClient(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = buildClient()
  }
  return globalThis.prisma
}

// Lazy proxy — client is not created until first property access.
// This prevents crashes during Next.js static generation when env vars
// may not be fully available or native modules fail to load.
const prismadb = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return (getClient() as any)[prop]
  },
})

export default prismadb
