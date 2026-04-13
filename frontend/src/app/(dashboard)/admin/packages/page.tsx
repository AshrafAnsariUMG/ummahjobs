'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AdminPackage {
  id: number
  name: string
  price: string
  post_count: number
  post_type: 'regular' | 'featured'
  duration_days: number
  includes_newsletter: boolean
  is_active: boolean
  description: string | null
  total_purchases: number
  total_revenue: number
}

interface EditState {
  price: string
  post_count: string
  duration_days: string
  includes_newsletter: boolean
  description: string
}

function formatCurrency(val: number | string): string {
  return Number(val).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function ToggleSwitch({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${checked ? 'bg-green-500' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
}

function PackageCard({
  pkg, onUpdated,
}: { pkg: AdminPackage; onUpdated: (updated: AdminPackage) => void }) {
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [edit, setEdit] = useState<EditState>({
    price: pkg.price,
    post_count: String(pkg.post_count),
    duration_days: String(pkg.duration_days),
    includes_newsletter: pkg.includes_newsletter,
    description: pkg.description ?? '',
  })

  function startEdit() {
    setEdit({
      price: pkg.price,
      post_count: String(pkg.post_count),
      duration_days: String(pkg.duration_days),
      includes_newsletter: pkg.includes_newsletter,
      description: pkg.description ?? '',
    })
    setEditing(true)
  }

  async function handleToggleActive() {
    setToggling(true)
    try {
      const res = await api.put(`/api/admin/packages/${pkg.id}`, { is_active: !pkg.is_active }) as { package: AdminPackage }
      onUpdated(res.package)
      showToast(`Package ${res.package.is_active ? 'activated' : 'deactivated'}.`, 'success')
    } catch {
      showToast('Failed to update package.', 'error')
    } finally {
      setToggling(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await api.put(`/api/admin/packages/${pkg.id}`, {
        price: parseFloat(edit.price),
        post_count: parseInt(edit.post_count),
        duration_days: parseInt(edit.duration_days),
        includes_newsletter: edit.includes_newsletter,
        description: edit.description || null,
      }) as { package: AdminPackage }
      onUpdated(res.package)
      setEditing(false)
      showToast('Package updated!', 'success')
    } catch {
      showToast('Failed to save changes.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent'
  const ringStyle = { '--tw-ring-color': '#033BB0' } as React.CSSProperties

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">ID #{pkg.id}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">{pkg.is_active ? 'Active' : 'Inactive'}</span>
          <ToggleSwitch
            checked={pkg.is_active}
            onChange={handleToggleActive}
            label="Active"
          />
          {toggling && <span className="text-xs text-gray-400 animate-pulse">...</span>}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 py-3 grid grid-cols-3 gap-3 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">{pkg.total_purchases}</p>
          <p className="text-xs text-gray-500 mt-0.5">Purchases</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">{formatCurrency(pkg.total_revenue)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Revenue</p>
        </div>
        <div className="text-center">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${pkg.post_type === 'featured' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
            {pkg.post_type === 'featured' ? 'Featured' : 'Regular'}
          </span>
          <p className="text-xs text-gray-500 mt-0.5">Post Type</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1">
        {!editing ? (
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price</span>
              <span className="font-semibold text-gray-900">{formatCurrency(pkg.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Job posts included</span>
              <span className="font-semibold text-gray-900">{pkg.post_count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Days per listing</span>
              <span className="font-semibold text-gray-900">{pkg.duration_days}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Newsletter inclusion</span>
              <span className={`font-semibold ${pkg.includes_newsletter ? 'text-green-600' : 'text-gray-400'}`}>
                {pkg.includes_newsletter ? 'Yes' : 'No'}
              </span>
            </div>
            {pkg.description && (
              <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">{pkg.description}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={edit.price}
                onChange={(e) => setEdit((p) => ({ ...p, price: e.target.value }))}
                className={inputClass}
                style={ringStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Job posts included</label>
              <input
                type="number"
                min="1"
                value={edit.post_count}
                onChange={(e) => setEdit((p) => ({ ...p, post_count: e.target.value }))}
                className={inputClass}
                style={ringStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Days per listing</label>
              <input
                type="number"
                min="1"
                value={edit.duration_days}
                onChange={(e) => setEdit((p) => ({ ...p, duration_days: e.target.value }))}
                className={inputClass}
                style={ringStyle}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Newsletter inclusion</label>
              <ToggleSwitch
                checked={edit.includes_newsletter}
                onChange={(v) => setEdit((p) => ({ ...p, includes_newsletter: v }))}
                label="Newsletter inclusion"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={edit.description}
                onChange={(e) => setEdit((p) => ({ ...p, description: e.target.value.slice(0, 500) }))}
                rows={3}
                placeholder="Short description shown to employers..."
                className={`${inputClass} resize-none`}
                style={ringStyle}
              />
              <p className="text-xs text-gray-400 mt-0.5 text-right">{edit.description.length}/500</p>
            </div>

            {/* Warning banner */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-xs text-amber-700">
                Changes affect all future purchases. Existing credits are not affected.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
        {!editing ? (
          <button
            onClick={startEdit}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#033BB0' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminPackagesPage() {
  const { showToast } = useToast()
  const [packages, setPackages] = useState<AdminPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/admin/packages')
      .then((d: { packages: AdminPackage[] }) => setPackages(d.packages))
      .catch(() => showToast('Failed to load packages.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  function handleUpdated(updated: AdminPackage) {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
  }

  const totalRevenue = packages.reduce((sum, p) => sum + Number(p.total_revenue), 0)
  const totalPurchases = packages.reduce((sum, p) => sum + p.total_purchases, 0)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Packages</h1>
        <p className="text-sm text-gray-500 mt-1">Manage job posting packages and pricing</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-80 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Packages grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onUpdated={handleUpdated} />
            ))}
          </div>

          {/* Revenue summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue Summary</h2>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Revenue</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{totalPurchases}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Purchases</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{packages.filter((p) => p.is_active).length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Active Packages</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
