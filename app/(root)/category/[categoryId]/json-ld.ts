interface BreadcrumbItem { label: string; href?: string }
interface JsonLdProduct { id: string; name: string; price: unknown; images: { url: string }[] }

export function buildBreadcrumbJsonLd(baseUrl: string, categoryId: string, breadcrumbItems: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      ...breadcrumbItems.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `${baseUrl}${item.href}` } : { item: `${baseUrl}/category/${categoryId}` }),
      })),
    ],
  }
}

export function buildItemListJsonLd(baseUrl: string, categoryName: string, totalCount: number, products: JsonLdProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryName,
    description: `Browse ${totalCount} ${categoryName} products`,
    numberOfItems: totalCount,
    itemListElement: products.slice(0, 10).map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: product.name,
        image: product.images[0]?.url ?? undefined,
        url: `${baseUrl}/product/${product.id}`,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  }
}
