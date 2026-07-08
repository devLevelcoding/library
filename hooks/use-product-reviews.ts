import { useCallback, useEffect, useState } from "react"
import { Review } from "@/components/review-card"

interface ReviewSummary {
  reviews: Review[]
  avg: number
  total: number
  distribution: { star: number; count: number }[]
}

export function useProductReviews(productId: string) {
  const [data, setData] = useState<ReviewSummary | null>(null)
  const [loading, setLoading] = useState(true)

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

  return {
    data, loading,
    showForm, setShowForm,
    rating, setRating,
    title, setTitle,
    body, setBody,
    submitting, formError, setFormError, formSuccess,
    handleSubmit,
  }
}
