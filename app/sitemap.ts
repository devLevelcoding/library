import type { MetadataRoute } from "next"
import prismadb from "@/lib/prismadb"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_APP_URL || "https://library-git-main-devlevelcodings-projects.vercel.app"

  let categories: { id: string; updatedAt: Date }[] = []
  try {
    categories = await prismadb.category.findMany({
      where: { enabled: true },
      select: { id: true, updatedAt: true },
    })
  } catch {
    // DB unavailable at build time
  }

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...categories.map(c => ({
      url: `${base}/category/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
