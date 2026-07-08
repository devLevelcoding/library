import { StarRating } from "@/components/star-rating"

interface RatingSummaryProps {
  avg: number
  total: number
  distribution: { star: number; count: number }[]
}

export function RatingSummary({ avg, total, distribution }: RatingSummaryProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b">
      <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
        <span className="text-5xl font-bold text-gray-900">{avg.toFixed(1)}</span>
        <StarRating rating={avg} size={20} />
        <span className="text-sm text-muted-foreground">{total} review{total !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        {distribution.map(({ star, count }) => {
          const pct = total ? Math.round((count / total) * 100) : 0
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right text-muted-foreground">{star}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
