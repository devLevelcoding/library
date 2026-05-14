import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_APP_URL || "https://library-git-main-devlevelcodings-projects.vercel.app"
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
