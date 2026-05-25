"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { StarRating } from "./star-rating"
import { StarPicker } from "./star-picker"
import { ReviewCard, Review } from "./review-card"

interface ReviewSummary {
  reviews: Review[]
  avg: number
  total: number
  distribution: { star: number; count: number }[]
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [data, setData] = useState<ReviewSummary | null>(null)
  const [loading, setLoading] = useState(true)

  // form state
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/${productId}`)
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setFormError("Please select a star rating"); return }
    if (!body.trim()) { setFormError("Please write your review"); return }
    setSubmitting(true)
    setFormError("")
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, body }),
      })
      const json = await res.json()
      if (json.ok) {
        setFormSuccess(true)
        setShowForm(false)
        setRating(0); setTitle(""); setBody("")
        await fetchReviews()
      } else {
        setFormError(json.error ?? "Something went wrong")
      }
    } catch {
      setFormError("Could not submit review. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-14" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl font-bold text-gray-900 mb-6">
        Customer Reviews
      </h2>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading reviews…
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b">
            <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
              <span className="text-5xl font-bold text-gray-900">{data.avg.toFixed(1)}</span>
              <StarRating rating={data.avg} size={20} />
              <span className="text-sm text-muted-foreground">{data.total} review{data.total !== 1 ? "s" : ""}</span>
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              {data.distribution.map(({ star, count }) => {
                const pct = data.total ? Math.round((count / data.total) * 100) : 0
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

          {/* Write review button / success */}
          {formSuccess ? (
            <p className="text-sm text-green-600 font-medium mb-6">
              Your review was submitted — thank you!
            </p>
          ) : !showForm ? (
            <Button variant="outline" className="mb-8" onClick={() => setShowForm(true)}>
              Write a review
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10 p-5 border rounded-xl bg-gray-50">
              <h3 className="font-semibold text-gray-900">Your review</h3>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Summarize your review"
                  maxLength={120}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Review</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="What did you think of this book?"
                  rows={4}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white resize-none"
                />
              </div>

              {formError && <p className="text-xs text-destructive">{formError}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setFormError("") }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Review list */}
          {data.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No reviews yet. Be the first to review this book!
            </p>
          ) : (
            <div>
              {data.reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
