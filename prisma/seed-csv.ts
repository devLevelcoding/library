import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

interface CsvProduct {
  name: string
  price: number
  category: string
  image_url: string
}

function parseCsv(filePath: string): CsvProduct[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const lines = content.trim().split(/\r?\n/)
  return lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",")
      return {
        name: parts[0]?.trim(),
        price: parseFloat(parts[1]),
        category: parts[2]?.trim(),
        image_url: parts[3]?.trim(),
      }
    })
    .filter((p) => p.name && !isNaN(p.price) && p.category && p.image_url && ALLOWED_CATEGORY_SLUGS.has(p.category))
}

const ALLOWED_CATEGORY_SLUGS = new Set([
  "beauty", "fragrances", "furniture", "groceries", "home-decoration",
  "kitchen-accessories", "laptops", "mens-shirts", "mens-shoes", "mens-watches",
  "mobile-accessories", "motorcycle", "skin-care", "smartphones",
  "sports-accessories", "sunglasses", "tablets", "tops", "vehicle",
  "womens-bags", "womens-dresses", "womens-jewellery", "womens-shoes", "womens-watches",
])

function toTitleCase(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

const BATCH = 500

async function main() {
  const csvPath = path.join(process.cwd(), "..", "products.csv")
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found at: ${csvPath}`)
    process.exit(1)
  }

  const products = parseCsv(csvPath)
  console.log(`📄 Parsed ${products.length} products from CSV`)

  // Ensure default size
  let defaultSize = await prisma.size.findFirst({ where: { value: "ONE" } })
  if (!defaultSize) {
    defaultSize = await prisma.size.create({
      data: { name: "One Size", value: "ONE", enabled: true },
    })
    console.log("✅ Created default size")
  }

  // Upsert all categories in one pass
  const categorySlugs = Array.from(new Set(products.map((p) => p.category)))
  const existingCats = await prisma.category.findMany({
    where: { name: { in: categorySlugs.map(toTitleCase) } },
    select: { id: true, name: true },
  })
  const categoryMap: Record<string, string> = {}
  for (const cat of existingCats) {
    const slug = categorySlugs.find(s => toTitleCase(s) === cat.name)!
    categoryMap[slug] = cat.id
  }
  for (const slug of categorySlugs.filter(s => !categoryMap[s])) {
    const name = toTitleCase(slug)
    const cat = await prisma.category.create({ data: { name, description: name, enabled: true } })
    categoryMap[slug] = cat.id
    console.log(`  + Category: ${name}`)
  }

  // Skip products that already exist — single bulk query
  const existingNames = new Set(
    (await prisma.product.findMany({ select: { name: true } })).map(p => p.name)
  )
  const toInsert = products.filter(p => categoryMap[p.category] && !existingNames.has(p.name))
  console.log(`\n⚡ Inserting ${toInsert.length} new products (${products.length - toInsert.length} skipped)`)

  // Batch createMany for products, then images separately
  let created = 0
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)

    // Insert products without images
    await prisma.product.createMany({
      data: batch.map(p => ({
        name: p.name,
        price: p.price,
        isFeatured: false,
        isArchived: false,
        categoryId: categoryMap[p.category],
        sizeId: defaultSize!.id,
      })),
    })

    // Fetch the just-inserted product IDs by name
    const inserted = await prisma.product.findMany({
      where: { name: { in: batch.map(p => p.name) } },
      select: { id: true, name: true },
    })
    const nameToId = new Map(inserted.map(p => [p.name, p.id]))

    // Insert images in the same batch
    await prisma.image.createMany({
      data: batch
        .filter(p => nameToId.has(p.name))
        .map(p => ({ productId: nameToId.get(p.name)!, url: p.image_url })),
    })

    created += batch.length
    console.log(`  ✓ ${created} / ${toInsert.length}`)
  }

  console.log(`\n✅ Done — ${created} products imported`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
