import { createClient } from "@libsql/client"

const TURSO_URL = process.env.TURSO_DATABASE_URL!
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!

const source = createClient({ url: "file:./prisma/dev.db" })
const dest = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })

// Insert order respects FK dependencies
const TABLE_ORDER = [
  "Setting", "Size", "User",
  "Category",     // self-ref parentId — handled in two passes
  "Product",      // -> Category, Size
  "Image",        // -> Product
  "Account",      // -> User
  "Session",      // -> User
  "VerificationRequest", // -> User
  "Order",        // -> User
  "OrderItem",    // -> Order, Product
]

async function copyTable(name: string) {
  const rows = await source.execute(`SELECT * FROM "${name}"`)
  if (rows.rows.length === 0) { console.log(`  - ${name}: empty`); return }

  const cols = rows.columns.map(c => `"${c}"`).join(", ")
  const placeholders = rows.columns.map((_, i) => `?${i + 1}`).join(", ")

  let inserted = 0
  for (let i = 0; i < rows.rows.length; i += 50) {
    const batch = rows.rows.slice(i, i + 50)
    const statements = [
      { sql: "PRAGMA defer_foreign_keys = ON", args: [] as any[] },
      ...batch.map(row => ({
        sql: `INSERT OR REPLACE INTO "${name}" (${cols}) VALUES (${placeholders})`,
        args: rows.columns.map(col => (row as any)[col] ?? null),
      }))
    ]
    await dest.batch(statements, "write")
    inserted += batch.length
  }
  console.log(`  ✓ ${name}: ${inserted} rows`)
}

async function migrate() {
  console.log("Reading schema from dev.db...")
  const tablesResult = await source.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'"
  )
  const tableMap = new Map((tablesResult.rows as any[]).map(r => [r.name, r.sql]))

  console.log(`Found tables: ${Array.from(tableMap.keys()).join(", ")}`)

  // Drop & recreate all tables in Turso
  console.log("\nRecreating schema in Turso...")
  const dropOrder = [...TABLE_ORDER].reverse()
  for (const name of dropOrder) {
    if (tableMap.has(name)) {
      await dest.execute(`DROP TABLE IF EXISTS "${name}"`)
    }
  }
  for (const name of TABLE_ORDER) {
    if (tableMap.has(name)) {
      await dest.execute(tableMap.get(name)!)
      console.log(`  ✓ Created ${name}`)
    }
  }

  // Copy data
  console.log("\nCopying data...")
  for (const name of TABLE_ORDER) {
    if (name === "Category") {
      // Two-pass for self-referential: roots first, then children
      const all = await source.execute(`SELECT * FROM "Category"`)
      if (all.rows.length === 0) { console.log("  - Category: empty"); continue }

      const cols = all.columns.map(c => `"${c}"`).join(", ")
      const placeholders = all.columns.map((_, i) => `?${i + 1}`).join(", ")
      const makeStmt = (row: any) => ({
        sql: `INSERT OR REPLACE INTO "Category" (${cols}) VALUES (${placeholders})`,
        args: all.columns.map(col => (row as any)[col] ?? null),
      })

      const roots = (all.rows as any[]).filter(r => !r.parentId)
      const children = (all.rows as any[]).filter(r => r.parentId)

      for (let i = 0; i < roots.length; i += 50) {
        await dest.batch([{ sql: "PRAGMA defer_foreign_keys = ON", args: [] }, ...roots.slice(i, i + 50).map(makeStmt)], "write")
      }
      for (let i = 0; i < children.length; i += 50) {
        await dest.batch([{ sql: "PRAGMA defer_foreign_keys = ON", args: [] }, ...children.slice(i, i + 50).map(makeStmt)], "write")
      }
      console.log(`  ✓ Category: ${all.rows.length} rows`)
    } else if (tableMap.has(name)) {
      await copyTable(name)
    }
  }

  console.log("\n✅ Migration complete!")
  source.close()
  dest.close()
}

migrate().catch(e => { console.error("\n❌ Migration failed:", e.message); process.exit(1) })
