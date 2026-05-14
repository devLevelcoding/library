import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const indexes = [
    "CREATE INDEX IF NOT EXISTS Product_isArchived_idx ON Product (isArchived)",
    "CREATE INDEX IF NOT EXISTS Product_isArchived_createdAt_idx ON Product (isArchived, createdAt DESC)",
  ]
  for (const sql of indexes) {
    await client.execute(sql)
    console.log("✓", sql)
  }
  console.log("\nDone.")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => client.close())
