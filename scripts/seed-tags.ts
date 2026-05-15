/**
 * Creates Tag + ProductTag tables in Turso, inserts all tags,
 * then auto-assigns tags to every book based on its category.
 *
 * Run:
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-tags.ts
 */

import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// ── Tag definitions ────────────────────────────────────────────────────────
const TAGS = [
  // Mood
  { name: "Dark",             slug: "dark",             color: "#374151", group: "Mood" },
  { name: "Emotional",        slug: "emotional",        color: "#ec4899", group: "Mood" },
  { name: "Funny",            slug: "funny",            color: "#f59e0b", group: "Mood" },
  { name: "Inspiring",        slug: "inspiring",        color: "#f97316", group: "Mood" },
  { name: "Light Read",       slug: "light-read",       color: "#84cc16", group: "Mood" },
  { name: "Romantic",         slug: "romantic",         color: "#e11d48", group: "Mood" },
  { name: "Scary",            slug: "scary",            color: "#6d28d9", group: "Mood" },
  { name: "Thrilling",        slug: "thrilling",        color: "#dc2626", group: "Mood" },
  { name: "Thought-Provoking",slug: "thought-provoking",color: "#0f766e", group: "Mood" },

  // Audience
  { name: "Children",         slug: "children",         color: "#16a34a", group: "Audience" },
  { name: "Young Adult",      slug: "young-adult",      color: "#0891b2", group: "Audience" },
  { name: "Adult",            slug: "adult",            color: "#4b5563", group: "Audience" },

  // Format
  { name: "Paperback",        slug: "paperback",        color: "#78716c", group: "Format" },
  { name: "Hardcover",        slug: "hardcover",        color: "#92400e", group: "Format" },
  { name: "eBook",            slug: "ebook",            color: "#1d4ed8", group: "Format" },
  { name: "Audiobook",        slug: "audiobook",        color: "#7c3aed", group: "Format" },

  // Theme
  { name: "Award Winner",     slug: "award-winner",     color: "#d97706", group: "Theme" },
  { name: "Bestseller",       slug: "bestseller",       color: "#b45309", group: "Theme" },
  { name: "Classic",          slug: "classic",          color: "#6b7280", group: "Theme" },
  { name: "Series",           slug: "series",           color: "#2563eb", group: "Theme" },

  // Length
  { name: "Quick Read",       slug: "quick-read",       color: "#10b981", group: "Length" },
  { name: "Epic",             slug: "epic",             color: "#7c2d12", group: "Length" },
]

// Mood+Audience tags auto-assigned per category
const CATEGORY_TAGS: Record<string, string[]> = {
  "Fiction":           ["inspiring", "light-read",      "adult"],
  "Mystery":           ["thrilling", "thought-provoking","adult"],
  "Romance":           ["romantic",  "emotional",        "adult"],
  "Science Fiction":   ["thought-provoking",             "adult"],
  "Fantasy":           ["epic",                          "adult"],
  "Biography":         ["inspiring", "thought-provoking","adult"],
  "History":           ["thought-provoking",             "adult"],
  "Thriller":          ["thrilling", "scary",            "adult"],
  "Horror":            ["scary",     "dark",             "adult"],
  "Adventure":         ["thrilling", "inspiring",        "adult"],
  "Psychology":        ["thought-provoking","inspiring", "adult"],
  "Self Help":         ["inspiring", "thought-provoking","adult"],
  "Business":          ["thought-provoking",             "adult"],
  "Cooking":           ["light-read",                    "adult"],
  "Travel":            ["inspiring", "light-read",       "adult"],
  "Art":               ["thought-provoking",             "adult"],
  "Poetry":            ["emotional", "thought-provoking","adult"],
  "Philosophy":        ["thought-provoking",             "adult"],
  "Children":          ["light-read",                    "children"],
  "Classic Literature":["classic",   "thought-provoking","adult"],
}

// Random format — one per book (seeded by index for reproducibility)
const FORMATS = ["paperback", "paperback", "paperback", "hardcover", "ebook", "audiobook"]
function pickFormat(idx: number) { return FORMATS[idx % FORMATS.length] }

// ~12% of books get "bestseller", ~6% get "award-winner", ~8% get "series"
function bonusTags(idx: number): string[] {
  const tags: string[] = []
  if (idx % 8 === 0)  tags.push("bestseller")
  if (idx % 16 === 3) tags.push("award-winner")
  if (idx % 12 === 5) tags.push("series")
  return tags
}

async function main() {
  console.log("1/4  Creating Tag + ProductTag tables...")
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Tag" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "name"      TEXT NOT NULL UNIQUE,
      "slug"      TEXT NOT NULL UNIQUE,
      "color"     TEXT NOT NULL DEFAULT '#6b7280',
      "group"     TEXT NOT NULL DEFAULT 'General',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await client.execute(`CREATE INDEX IF NOT EXISTS "Tag_slug_idx" ON "Tag"("slug")`)
  await client.execute(`CREATE INDEX IF NOT EXISTS "Tag_group_idx" ON "Tag"("group")`)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "ProductTag" (
      "productId" TEXT NOT NULL,
      "tagId"     TEXT NOT NULL,
      PRIMARY KEY ("productId", "tagId"),
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
      FOREIGN KEY ("tagId")     REFERENCES "Tag"("id")     ON DELETE CASCADE
    )
  `)
  await client.execute(`CREATE INDEX IF NOT EXISTS "ProductTag_productId_idx" ON "ProductTag"("productId")`)
  await client.execute(`CREATE INDEX IF NOT EXISTS "ProductTag_tagId_idx"     ON "ProductTag"("tagId")`)
  console.log("    Tables ready.")

  // ── 2. Insert tags ──────────────────────────────────────────────────────
  console.log("2/4  Inserting tags...")
  const { v4: uuidv4 } = await import("uuid")
  const tagIdMap: Record<string, string> = {}

  for (const t of TAGS) {
    const existing = await client.execute({ sql: `SELECT id FROM Tag WHERE slug = ?`, args: [t.slug] })
    if (existing.rows.length > 0) {
      tagIdMap[t.slug] = existing.rows[0][0] as string
    } else {
      const id = uuidv4()
      await client.execute({
        sql: `INSERT INTO Tag (id, name, slug, color, "group") VALUES (?, ?, ?, ?, ?)`,
        args: [id, t.name, t.slug, t.color, t.group],
      })
      tagIdMap[t.slug] = id
    }
    process.stdout.write(`    ${t.name} (${t.group})\n`)
  }

  // ── 3. Fetch all products with their category name ──────────────────────
  console.log("3/4  Fetching products...")
  const result = await client.execute(`
    SELECT p.id, c.name as categoryName
    FROM Product p
    JOIN Category c ON p.categoryId = c.id
    ORDER BY p.rowid
  `)
  console.log(`    Found ${result.rows.length} books.`)

  // ── 4. Assign tags in batches ───────────────────────────────────────────
  console.log("4/4  Assigning tags...")
  const BATCH = 200
  let assigned = 0

  for (let i = 0; i < result.rows.length; i += BATCH) {
    const slice = result.rows.slice(i, i + BATCH)
    const stmts = []

    for (let j = 0; j < slice.length; j++) {
      const productId = String(slice[j][0])
      const categoryName = String(slice[j][1])
      const globalIdx = i + j

      const slugs = [
        ...(CATEGORY_TAGS[categoryName] ?? ["adult"]),
        pickFormat(globalIdx),
        ...bonusTags(globalIdx),
      ]

      for (const slug of slugs) {
        const tagId = tagIdMap[slug]
        if (!tagId) continue
        stmts.push({
          sql: `INSERT OR IGNORE INTO ProductTag (productId, tagId) VALUES (?, ?)`,
          args: [productId, tagId],
        })
      }
    }

    if (stmts.length > 0) await client.batch(stmts)
    assigned += slice.length
    console.log(`    ${assigned} / ${result.rows.length}`)
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  const total = await client.execute(`SELECT COUNT(*) FROM ProductTag`)
  console.log(`\nDone. ${total.rows[0][0]} tag assignments across ${result.rows.length} books.`)
  console.log("\nTags available:")
  for (const g of ["Mood", "Audience", "Format", "Theme", "Length"]) {
    const inGroup = TAGS.filter(t => t.group === g).map(t => t.name).join(", ")
    console.log(`  ${g}: ${inGroup}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => client.close())
