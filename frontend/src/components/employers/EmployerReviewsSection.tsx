'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { EmployerReview } from '@/types'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-4 h-4"
          fill={star <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer' }}
        >
          <svg
            width={28}
            height={28}
            viewBox="0 0 20 20"
            fill={star <= display ? '#0FBB0F' : 'none'}
            stroke={star <= display ? '#0FBB0F' : '#D1D5DB'}
            strokeWidth={1.5}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

interface Props {
  slug: string
  initialReviews: EmployerReview[]
}

export default function EmployerReviewsSection({ slug, initialReviews }: Props) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<EmployerReview[]>(initialReviews)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      showToast('Please select a star rating.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const newReview = await api.post(`/api/employers/${slug}/reviews`, {
        rating,
        review: reviewText,
      }) as EmployerReview
      setReviews((prev) => [{ ...newReview, reviewer: { id: user!.id, display_name: user!.display_name } }, ...prev])
      setSubmitted(true)
      showToast('JazakAllah Khayran! Review submitted.', 'success')
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string }
      if (e?.status === 422 || (e as { errors?: unknown })?.errors) {
        setAlreadyReviewed(true)
        setSubmitted(true)
      } else {
        showToast(e?.message ?? 'Failed to submit review.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {/* Review form / prompt */}
      <div className="mb-6">
        {!user ? (
          <div style={{
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#6B7280', margin: '0 0 12px' }}>
              Share your experience working with this employer
            </p>
            <a href="/login" style={{
              padding: '8px 20px',
              background: '#033BB0',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-block',
            }}>
              Login to Write a Review
            </a>
          </div>
        ) : submitted ? (
          <div style={{
            background: alreadyReviewed ? '#FFF3CD' : '#F0FFF4',
            border: `1px solid ${alreadyReviewed ? '#FDE68A' : '#BBF7D0'}`,
            borderRadius: '8px',
            padding: '16px 20px',
            fontSize: '14px',
            color: alreadyReviewed ? '#92400E' : '#166534',
          }}>
            {alreadyReviewed
              ? 'You have already reviewed this employer.'
              : 'You have reviewed this employer. JazakAllah Khayran!'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Write a Review</h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Your Rating</label>
              <StarSelector value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your Experience</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Share your experience working with or applying to this employer..."
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none resize-none"
                style={{ fontSize: '14px', color: '#111827' }}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{reviewText.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#033BB0' }}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {review.reviewer?.display_name ?? 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.review_text && (
                <p className="text-sm text-gray-700 leading-relaxed">{review.review_text}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to leave one.</p>
        </div>
      )}
    </section>
  )
}
