"use client"

import { BadgeCheck } from "lucide-react"
import { StarRating } from "./star-rating"

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  title: string
  body: string
  verified: boolean
  createdAt: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })

  return (
    <div className="flex flex-col gap-2 py-5 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size={15} />
            {review.title && (
              <span className="font-semibold text-sm text-gray-900">{review.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-gray-700">{review.userName}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified purchase
              </span>
            )}
            <span>·</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>
    </div>
  )
}
