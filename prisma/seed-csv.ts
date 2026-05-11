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
  // skip header row
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

// Only import products whose category slug matches a known DummyJSON category
const ALLOWED_CATEGORY_SLUGS = new Set([
  "beauty", "fragrances", "furniture", "groceries", "home-decoration",
  "kitchen-accessories", "laptops", "mens-shirts", "mens-shoes", "mens-watches",
  "mobile-accessories", "motorcycle", "skin-care", "smartphones",
  "sports-accessories", "sunglasses", "tablets", "tops", "vehicle",
  "womens-bags", "womens-dresses", "womens-jewellery", "womens-shoes", "womens-watches",
])

function toTitleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

async function main() {
  // products.csv sits one level above the project root
  const csvPath = path.join(process.cwd(), "..", "products.csv")
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found at: ${csvPath}`)
    process.exit(1)
  }

  const products = parseCsv(csvPath)
  console.log(`📄 Parsed ${products.length} products from CSV`)

  // Ensure a default size exists
  let defaultSize = await prisma.size.findFirst({ where: { value: "ONE" } })
  if (!defaultSize) {
    defaultSize = await prisma.size.create({
      data: { name: "One Size", value: "ONE", enabled: true },
    })
    console.log("✅ Created default size: One Size")
  }

  // Collect unique category slugs
  const categorySlugs = Array.from(new Set(products.map((p) => p.category)))

  // Upsert categories
  const categoryMap: Record<string, string> = {}
  for (const slug of categorySlugs) {
    const name = toTitleCase(slug)
    let cat = await prisma.category.findFirst({ where: { name } })
    if (!cat) {
      cat = await prisma.category.create({
        data: { name, description: name, enabled: true },
      })
      console.log(`  + Category: ${name}`)
    }
    categoryMap[slug] = cat.id
  }

  // Insert products
  let created = 0
  let skipped = 0
  for (const p of products) {
    const categoryId = categoryMap[p.category]
    if (!categoryId) {
      skipped++
      continue
    }
    // skip if a product with same name already exists
    const existing = await prisma.product.findFirst({ where: { name: p.name } })
    if (existing) {
      skipped++
      continue
    }
    await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        isFeatured: false,
        isArchived: false,
        categoryId,
        sizeId: defaultSize.id,
        images: {
          create: [{ url: p.image_url }],
        },
      },
    })
    created++
  }

  console.log(`\n✅ Done — ${created} products imported, ${skipped} skipped`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
