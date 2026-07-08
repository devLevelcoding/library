import { X } from "lucide-react"
import Image from "next/image"
import { CompareProduct } from "@/hooks/use-compare"

interface CoversRowProps {
  items: CompareProduct[]
  onRemove: (id: string) => void
}

export function CoversRow({ items, onRemove }: CoversRowProps) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `140px repeat(${items.length}, 1fr)` }}>
      <div />
      {items.map(item => (
        <div key={item.id} className="flex flex-col items-center gap-2 relative">
          <button onClick={() => onRemove(item.id)}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-white transition-colors">
            <X className="h-3 w-3" />
          </button>
          <div className="relative h-32 w-24 rounded-lg overflow-hidden border bg-muted">
            {item.image
              ? <Image src={item.image} alt={item.name} fill className="object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No cover</div>
            }
          </div>
          <p className="text-sm font-semibold text-center leading-tight line-clamp-2">{item.name}</p>
        </div>
      ))}
    </div>
  )
}
