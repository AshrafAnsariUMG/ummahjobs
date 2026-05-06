'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface Coupon {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  package_ids: number[] | null
  total_usage_limit: number | null
  per_employer_limit: number
  expires_at: string | null
  is_active: boolean
  uses_count: number
  created_at: string
}

interface CouponMeta {
  current_page: number
  last_page: number
  total: number
}

const EMPTY_FORM = {
  code: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: '',
  total_usage_limit: '',
  per_employer_limit: '1',
  expires_at: '',
  is_active: true,
}

export default function AdminCouponsPage() {
  const { showToast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [meta, setMeta] = useState<CouponMeta>({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Create form state
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // Toggle active state
  const [togglingId, setTogglingId] = useState<number | null>(null)

  function loadCoupons(p = 1) {
    setLoading(true)
    api.get(`/api/admin/coupons?page=${p}`)
      .then((res: { data: Coupon[]; meta: CouponMeta }) => {
        setCoupons(res.data)
        setMeta(res.meta)
      })
      .catch(() => showToast('Failed to load coupons.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCoupons(page) }, [page])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        per_employer_limit: parseInt(form.per_employer_limit),
        is_active: form.is_active,
      }
      if (form.total_usage_limit) body.total_usage_limit = parseInt(form.total_usage_limit)
      if (form.expires_at) body.expires_at = form.expires_at

      const created: Coupon = await api.post('/api/admin/coupons', body)
      setCoupons((prev) => [{ ...created, uses_count: 0 }, ...prev])
      setMeta((m) => ({ ...m, total: m.total + 1 }))
      setForm(EMPTY_FORM)
      setShowForm(false)
      showToast(`Coupon ${created.code} created.`, 'success')
    } catch (err: unknown) {
      const e = err as { message?: string }
      setFormError(e?.message ?? 'Failed to create coupon.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(coupon: Coupon) {
    setTogglingId(coupon.id)
    try {
      const updated: Coupon = await api.put(`/api/admin/coupons/${coupon.id}`, {
        is_active: !coupon.is_active,
      })
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, is_active: updated.is_active } : c))
    } catch {
      showToast('Failed to update coupon.', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await api.delete(`/api/admin/coupons/${id}`)
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      setMeta((m) => ({ ...m, total: m.total - 1 }))
      showToast('Coupon deleted.', 'success')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to delete coupon.', 'error')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-400 mt-1">{meta.total} coupon{meta.total !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError(null) }}
          style={{
            padding: '8px 16px', background: '#033BB0', color: 'white',
            border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ New Coupon'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Create Coupon</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. LAUNCH50"
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB',
                    borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}
                />
              </div>

              {/* Discount type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
              </div>

              {/* Discount value */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Discount Value * {form.discount_type === 'percentage' ? '(0–100%)' : '(USD)'}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={form.discount_type === 'percentage' ? 100 : undefined}
                  step="0.01"
                  value={form.discount_value}
                  onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                  placeholder={form.discount_type === 'percentage' ? '50' : '25.00'}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              {/* Per employer limit */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Uses per Employer *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.per_employer_limit}
                  onChange={(e) => setForm((f) => ({ ...f, per_employer_limit: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              {/* Total usage limit */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Total Uses Limit <span className="text-gray-400">(optional)</span></label>
                <input
                  type="number"
                  min={1}
                  value={form.total_usage_limit}
                  onChange={(e) => setForm((f) => ({ ...f, total_usage_limit: e.target.value }))}
                  placeholder="Unlimited"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              {/* Expires at */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Expires At <span className="text-gray-400">(optional)</span></label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: form.is_active ? '#0FBB0F' : '#D1D5DB',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  left: form.is_active ? 21 : 3,
                  width: 16, height: 16, background: 'white',
                  borderRadius: '50%', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
              <span className="text-sm text-gray-700">{form.is_active ? 'Active' : 'Inactive'}</span>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '9px 20px', background: '#033BB0', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Creating…' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null) }}
                style={{
                  padding: '9px 20px', background: 'white', color: '#374151',
                  border: '1px solid #D1D5DB', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth={1.5} className="w-12 h-12 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-gray-400 text-sm">No coupons yet. Create one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Code</th>
                  <th className="text-left px-5 py-3 font-medium">Discount</th>
                  <th className="text-left px-5 py-3 font-medium">Uses</th>
                  <th className="text-left px-5 py-3 font-medium">Per Employer</th>
                  <th className="text-left px-5 py-3 font-medium">Expires</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {/* Code */}
                    <td className="px-5 py-3">
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.08em',
                        fontSize: '13px', color: '#033BB0',
                      }}>
                        {coupon.code}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {coupon.discount_type === 'percentage'
                        ? `${parseFloat(coupon.discount_value).toFixed(0)}% off`
                        : `$${parseFloat(coupon.discount_value).toFixed(2)} off`}
                    </td>

                    {/* Uses */}
                    <td className="px-5 py-3 text-gray-600">
                      {coupon.uses_count}
                      {coupon.total_usage_limit ? ` / ${coupon.total_usage_limit}` : ''}
                    </td>

                    {/* Per employer */}
                    <td className="px-5 py-3 text-gray-600">{coupon.per_employer_limit}×</td>

                    {/* Expires */}
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : <span className="text-gray-300">Never</span>}
                    </td>

                    {/* Status toggle */}
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(coupon)}
                        disabled={togglingId === coupon.id}
                        style={{
                          width: 36, height: 20, borderRadius: 10,
                          background: coupon.is_active ? '#0FBB0F' : '#D1D5DB',
                          border: 'none', cursor: togglingId === coupon.id ? 'not-allowed' : 'pointer',
                          position: 'relative', transition: 'background 0.2s',
                          opacity: togglingId === coupon.id ? 0.6 : 1,
                        }}
                        title={coupon.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                      >
                        <span style={{
                          position: 'absolute', top: 2,
                          left: coupon.is_active ? 18 : 2,
                          width: 16, height: 16, background: 'white',
                          borderRadius: '50%', transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right">
                      {confirmDeleteId === coupon.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">Delete?</span>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={deletingId === coupon.id}
                            style={{
                              padding: '3px 10px', background: '#EF4444', color: 'white',
                              border: 'none', borderRadius: '5px', fontSize: '12px',
                              fontWeight: 600, cursor: 'pointer',
                              opacity: deletingId === coupon.id ? 0.6 : 1,
                            }}
                          >
                            {deletingId === coupon.id ? '…' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              padding: '3px 10px', background: 'white', color: '#374151',
                              border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '12px',
                              fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(coupon.id)}
                          style={{
                            padding: '4px 12px', background: 'white', color: '#EF4444',
                            border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '12px',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page === 1}
                className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page === meta.last_page}
                className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
