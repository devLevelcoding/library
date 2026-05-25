"use client"

interface StarRatingProps {
  rating: number      // 0–5, supports decimals
  size?: number       // px
  showValue?: boolean
}

export function StarRating({ rating, size = 16, showValue = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <span className="inline-flex items-center gap-1">
      {stars.map(star => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)))
        const id = `grad-${star}-${Math.random().toString(36).slice(2, 7)}`

        return (
          <svg key={star} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={id}>
                <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
                <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              d="M10 1l2.39 6.26H18l-4.69 3.56 1.78 6.18L10 13.27l-5.09 3.73 1.78-6.18L2 7.26h5.61z"
              fill={`url(#${id})`}
            />
          </svg>
        )
      })}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
      )}
    </span>
  )
}
