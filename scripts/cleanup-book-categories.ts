import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const VALID_CATEGORIES = new Set([
  "Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy",
  "Biography", "History", "Thriller", "Horror", "Adventure",
  "Psychology", "Self Help", "Business", "Cooking", "Travel",
  "Art", "Poetry", "Philosophy", "Children", "Classic Literature",
])

async function main() {
  const rows = await client.execute(`SELECT id, name FROM Category`)
  const bad = rows.rows.filter(r => !VALID_CATEGORIES.has(r[1] as string))

  if (bad.length === 0) {
    console.log("No bad categories found.")
    return
  }

  console.log(`Found ${bad.length} bad categories:`)
  for (const row of bad) console.log(`  - "${row[1]}" (id: ${row[0]})`)

  for (const row of bad) {
    const id = row[0] as string
    // Delete products (and their images via cascade) in bad categories
    const products = await client.execute({ sql: `SELECT id FROM Product WHERE categoryId = ?`, args: [id] })
    if (products.rows.length > 0) {
      await client.execute({ sql: `DELETE FROM Image WHERE productId IN (SELECT id FROM Product WHERE categoryId = ?)`, args: [id] })
      await client.execute({ sql: `DELETE FROM Product WHERE categoryId = ?`, args: [id] })
      console.log(`  Deleted ${products.rows.length} products from "${row[1]}"`)
    }
    await client.execute({ sql: `DELETE FROM Category WHERE id = ?`, args: [id] })
    console.log(`  Deleted category "${row[1]}"`)
  }

  const total = await client.execute(`SELECT COUNT(*) FROM Product`)
  console.log(`\nDone. Total books remaining: ${total.rows[0][0]}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => client.close())
