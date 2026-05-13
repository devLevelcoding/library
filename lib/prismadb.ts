import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    // eslint-disable-next-line
    const { createClient } = require("@libsql/client")
    // eslint-disable-next-line
    const { PrismaLibSQL } = require("@prisma/adapter-libsql")
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSQL(libsql)
    // eslint-disable-next-line
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}

const prismadb = globalThis.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb

export default prismadb
