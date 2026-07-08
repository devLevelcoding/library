import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarPicker } from "@/components/star-picker"

interface ReviewFormProps {
  rating: number
  onRatingChange: (val: number) => void
  title: string
  onTitleChange: (val: string) => void
  body: string
  onBodyChange: (val: string) => void
  submitting: boolean
  formError: string
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function ReviewForm({
  rating, onRatingChange, title, onTitleChange, body, onBodyChange, submitting, formError, onSubmit, onCancel,
}: ReviewFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mb-10 p-5 border rounded-xl bg-gray-50">
      <h3 className="font-semibold text-gray-900">Your review</h3>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <StarPicker value={rating} onChange={onRatingChange} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Summarize your review"
          maxLength={120}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-white"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Review</label>
        <textarea
          value={body}
          onChange={e => onBodyChange(e.target.value)}
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
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
