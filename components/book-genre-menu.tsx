import prismadb from "@/lib/prismadb"
import BookGenreMenuClient from "./book-genre-menu-client"

const GENRE_ICONS: Record<string, string> = {
  "Fiction":          "📖",
  "Mystery":          "🔍",
  "Romance":          "❤️",
  "Science Fiction":  "🚀",
  "Fantasy":          "✨",
  "Biography":        "👤",
  "History":          "🏛️",
  "Thriller":         "⚡",
  "Horror":           "🕯️",
  "Adventure":        "🗺️",
  "Psychology":       "🧠",
  "Self Help":        "🎯",
  "Business":         "💼",
  "Cooking":          "🍳",
  "Travel":           "✈️",
  "Art":              "🎨",
  "Poetry":           "✍️",
  "Philosophy":       "💡",
  "Children":         "⭐",
  "Classic Literature": "📜",
}

export default async function BookGenreMenu() {
  let categories: { id: string; name: string }[] = []
  try {
    categories = await prismadb.category.findMany({
      where: { enabled: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  } catch {
    // DB not available at build time
  }

  const genres = categories.map(c => ({
    ...c,
    icon: GENRE_ICONS[c.name] ?? "📚",
  }))

  return <BookGenreMenuClient genres={genres} />
}
