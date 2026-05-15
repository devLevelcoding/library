import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import * as fs from "fs"
import * as path from "path"

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter } as any)

interface CsvBook {
  name: string
  author: string
  price: number
  category: string
  image_url: string
}

function parseCsv(filePath: string): CsvBook[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.trim().split(/\r?\n/)
  return lines.slice(1).map(line => {
    // CSV may have commas in titles — split on first 4 commas only
    const parts = line.split(",")
    return {
      name:      parts[0]?.trim(),
      author:    parts[1]?.trim(),
      price:     parseFloat(parts[2]),
      category:  parts[3]?.trim(),
      image_url: parts.slice(4).join(",").trim(), // rejoin in case URL had commas
    }
  }).filter(b => b.name && b.author && !isNaN(b.price) && b.category && b.image_url)
}

function toTitleCase(s: string): string {
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

const BATCH = 500

async function main() {
  const csvPath = path.join(process.cwd(), "..", "books.csv")
  if (!fs.existsSync(csvPath)) {
    console.error("books.csv not found at:", csvPath)
    process.exit(1)
  }

  const books = parseCsv(csvPath)
  console.log(`Parsed ${books.length} books from CSV`)

  // Default size
  let defaultSize = await prisma.size.findFirst({ where: { value: "ONE" } })
  if (!defaultSize) {
    defaultSize = await prisma.size.create({
      data: { name: "One Size", value: "ONE", enabled: true },
    })
    console.log("Created default size")
  }

  // Upsert categories
  const categorySlugs = Array.from(new Set(books.map(b => b.category)))
  const existingCats = await prisma.category.findMany({
    where: { name: { in: categorySlugs } },
    select: { id: true, name: true },
  })
  const categoryMap: Record<string, string> = {}
  for (const cat of existingCats) categoryMap[cat.name] = cat.id
  for (const name of categorySlugs.filter(n => !categoryMap[n])) {
    const cat = await prisma.category.create({ data: { name, description: name, enabled: true } })
    categoryMap[name] = cat.id
    console.log(`  + Category: ${name}`)
  }

  // Skip existing
  const existingNames = new Set(
    (await prisma.product.findMany({ select: { name: true } })).map(p => p.name)
  )
  const toInsert = books.filter(b => categoryMap[b.category] && !existingNames.has(b.name))
  console.log(`\nInserting ${toInsert.length} new books (${books.length - toInsert.length} skipped)`)

  let created = 0
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)

    await prisma.product.createMany({
      data: batch.map(b => ({
        name:       b.name,
        author:     b.author,
        price:      b.price,
        isFeatured: false,
        isArchived: false,
        categoryId: categoryMap[b.category],
        sizeId:     defaultSize!.id,
      })),
    })

    const inserted = await prisma.product.findMany({
      where: { name: { in: batch.map(b => b.name) } },
      select: { id: true, name: true },
    })
    const nameToId = new Map(inserted.map(p => [p.name, p.id]))

    await prisma.image.createMany({
      data: batch
        .filter(b => nameToId.has(b.name))
        .map(b => ({ productId: nameToId.get(b.name)!, url: b.image_url })),
    })

    created += batch.length
    console.log(`  ${created} / ${toInsert.length}`)
  }

  console.log(`\nDone - ${created} books imported`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
