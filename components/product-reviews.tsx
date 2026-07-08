"use client"

import { Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { ReviewCard } from "./review-card"
import { RatingSummary } from "./product-reviews/rating-summary"
import { ReviewForm } from "./product-reviews/review-form"
import { useProductReviews } from "@/hooks/use-product-reviews"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const {
    data, loading,
    showForm, setShowForm,
    rating, setRating,
    title, setTitle,
    body, setBody,
    submitting, formError, setFormError, formSuccess,
    handleSubmit,
  } = useProductReviews(productId)

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
          <RatingSummary avg={data.avg} total={data.total} distribution={data.distribution} />

          {formSuccess ? (
            <p className="text-sm text-green-600 font-medium mb-6">
              Your review was submitted — thank you!
            </p>
          ) : !showForm ? (
            <Button variant="outline" className="mb-8" onClick={() => setShowForm(true)}>
              Write a review
            </Button>
          ) : (
            <ReviewForm
              rating={rating}
              onRatingChange={setRating}
              title={title}
              onTitleChange={setTitle}
              body={body}
              onBodyChange={setBody}
              submitting={submitting}
              formError={formError}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setFormError("") }}
            />
          )}

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
