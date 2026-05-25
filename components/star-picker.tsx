"use client"

import { useState } from "react"

interface StarPickerProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

export function StarPicker({ value, onChange, size = 28 }: StarPickerProps) {
  const [hovered, setHovered] = useState(0)

  return (
    <span className="inline-flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map(star => {
        const active = (hovered || value) >= star
        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M10 1l2.39 6.26H18l-4.69 3.56 1.78 6.18L10 13.27l-5.09 3.73 1.78-6.18L2 7.26h5.61z"
                fill={active ? "#f59e0b" : "#d1d5db"}
                className="transition-colors"
              />
            </svg>
          </button>
        )
      })}
    </span>
  )
}
