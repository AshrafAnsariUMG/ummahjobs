'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AdminReview {
  id: number
  rating: number
  review_text: string | null
  created_at: string
  company_name: string
  employer_slug: string
  reviewer_name: string
  reviewer_email: string
}

interface PaginatedReviews {
  data: AdminReview[]
  current_page: number
  last_page: number
  total: number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className="w-4 h-4" fill={star <= rating ? '#f59e0b' : '#e5e7eb'} viewBox="0 0 20 20">
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
          <svg width={22} height={22} viewBox="0 0 20 20"
            fill={star <= display ? '#f59e0b' : 'none'}
            stroke={star <= display ? '#f59e0b' : '#D1D5DB'}
            strokeWidth={1.5}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const { showToast } = useToast()
  const [data, setData] = useState<PaginatedReviews | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [editId, setEditId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  async function load(p: number) {
    setLoading(true)
    try {
      const res = await api.get(`/api/admin/reviews?page=${p}`) as PaginatedReviews
      setData(res)
    } catch {
      showToast('Failed to load reviews.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  function startEdit(review: AdminReview) {
    setEditId(review.id)
    setEditRating(review.rating)
    setEditText(review.review_text ?? '')
  }

  function cancelEdit() {
    setEditId(null)
  }

  async function saveEdit() {
    if (!editId) return
    setSaving(true)
    try {
      const updated = await api.put(`/api/admin/reviews/${editId}`, {
        rating: editRating,
        review_text: editText,
      }) as AdminReview
      setData((prev) => prev ? {
        ...prev,
        data: prev.data.map((r) => r.id === editId ? { ...r, rating: updated.rating, review_text: updated.review_text } : r),
      } : prev)
      setEditId(null)
      showToast('Review updated.', 'success')
    } catch {
      showToast('Failed to update review.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/api/admin/reviews/${deleteId}`)
      setData((prev) => prev ? {
        ...prev,
        data: prev.data.filter((r) => r.id !== deleteId),
        total: prev.total - 1,
      } : prev)
      setDeleteId(null)
      showToast('Review deleted.', 'success')
    } catch {
      showToast('Failed to delete review.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Manage employer reviews from candidates</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <svg className="animate-spin h-6 w-6 mx-auto" style={{ color: '#033BB0' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-500 mb-3">{data.total} review{data.total !== 1 ? 's' : ''} total</div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reviewer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Review</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((review) => (
                  editId === review.id ? (
                    <tr key={review.id} className="bg-blue-50">
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                        <p className="text-xs text-gray-400">{review.reviewer_email}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <a
                          href={`/employers/${review.employer_slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium hover:underline"
                          style={{ color: '#033BB0' }}
                        >
                          {review.company_name}
                        </a>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StarSelector value={editRating} onChange={setEditRating} />
                      </td>
                      <td className="px-4 py-3 align-top" colSpan={2}>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value.slice(0, 1000))}
                          rows={3}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none resize-none"
                          style={{ fontSize: '13px' }}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{editText.length}/1000</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving || editRating === 0}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: '#033BB0' }}
                          >
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                        <p className="text-xs text-gray-400">{review.reviewer_email}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <a
                          href={`/employers/${review.employer_slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium hover:underline"
                          style={{ color: '#033BB0' }}
                        >
                          {review.company_name}
                        </a>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400 mt-0.5 block">{review.rating}/5</span>
                      </td>
                      <td className="px-4 py-3 align-top max-w-xs">
                        {review.review_text ? (
                          <>
                            <p className="text-gray-700 text-xs leading-relaxed">
                              {expandedIds.has(review.id) || review.review_text.length <= 100
                                ? review.review_text
                                : review.review_text.slice(0, 100) + '…'}
                            </p>
                            {review.review_text.length > 100 && (
                              <button
                                onClick={() => toggleExpand(review.id)}
                                className="text-xs mt-1 font-medium"
                                style={{ color: '#033BB0' }}
                              >
                                {expandedIds.has(review.id) ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No text</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-500 whitespace-nowrap">
                        {new Date(review.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(review)}
                            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(review.id)}
                            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.last_page > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                Page {data.current_page} of {data.last_page}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.current_page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                  disabled={data.current_page === data.last_page}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirm dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">Delete Review</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
