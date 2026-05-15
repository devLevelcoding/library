import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const r = await client.execute(`
    SELECT name, (SELECT COUNT(*) FROM Product WHERE categoryId = Category.id) as cnt
    FROM Category ORDER BY name
  `)
  r.rows.forEach(row => console.log(` - ${row[0]} (${row[1]} books)`))
  console.log("\nTotal categories:", r.rows.length)
  client.close()
}

main()
