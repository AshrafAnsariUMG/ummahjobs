'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { Employer } from '@/types'
import { getStorageUrl } from '@/lib/imageUtils'

const NETWORKS = ['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'TikTok', 'Website']

interface SocialLink { network: string; url: string }

interface FormState {
  company_name: string
  category: string
  description: string
  email: string
  phone: string
  address: string
  map_lat: string
  map_lng: string
  show_profile: boolean
  socials: SocialLink[]
}

export default function EmployerProfileEditPage() {
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>({
    company_name: '',
    category: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    map_lat: '',
    map_lng: '',
    show_profile: true,
    socials: [],
  })
  const [employer, setEmployer] = useState<Employer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/api/employer/profile')
      .then((emp: Employer) => {
        setEmployer(emp)
        setForm({
          company_name: emp.company_name ?? '',
          category: emp.category ?? '',
          description: emp.description ?? '',
          email: emp.email ?? '',
          phone: emp.phone ?? '',
          address: emp.address ?? '',
          map_lat: emp.map_lat != null ? String(emp.map_lat) : '',
          map_lng: emp.map_lng != null ? String(emp.map_lng) : '',
          show_profile: emp.show_profile ?? true,
          socials: emp.socials ?? [],
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function addSocial() {
    setForm((prev) => ({ ...prev, socials: [...prev.socials, { network: 'LinkedIn', url: '' }] }))
  }

  function removeSocial(i: number) {
    setForm((prev) => ({ ...prev, socials: prev.socials.filter((_, idx) => idx !== i) }))
  }

  function setSocial(i: number, field: 'network' | 'url', value: string) {
    setForm((prev) => ({
      ...prev,
      socials: prev.socials.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.put('/api/employer/profile', {
        ...form,
        map_lat: form.map_lat ? Number(form.map_lat) : null,
        map_lng: form.map_lng ? Number(form.map_lng) : null,
        socials: form.socials.filter((s) => s.url.trim()),
      })
      showToast('JazakAllah Khayran! Profile updated.', 'success')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to save profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Company Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Update your public company profile</p>
      </div>

      {/* File uploads (disabled until S10) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Media</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Company Logo</p>
            {getStorageUrl(employer?.logo_path ?? null) && (
              <img src={getStorageUrl(employer?.logo_path ?? null)!} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-gray-200 mb-2" />
            )}
            <button
              disabled
              title="File upload coming soon"
              className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-400 cursor-not-allowed"
            >
              Change Logo (coming soon)
            </button>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Cover Photo</p>
            {getStorageUrl(employer?.cover_photo_path ?? null) && (
              <img src={getStorageUrl(employer?.cover_photo_path ?? null)!} alt="Cover" className="w-full h-16 rounded-xl object-cover border border-gray-200 mb-2" />
            )}
            <button
              disabled
              title="File upload coming soon"
              className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-400 cursor-not-allowed"
            >
              Change Cover (coming soon)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => set('company_name', e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="e.g. Technology, Finance, Education"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            placeholder="Tell candidates about your company…"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Full address"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Social links */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">Social Links</h2>
          <button
            onClick={addSocial}
            className="text-xs font-medium hover:underline"
            style={{ color: '#033BB0' }}
          >
            + Add link
          </button>
        </div>

        {form.socials.length === 0 ? (
          <p className="text-xs text-gray-400">No social links added yet.</p>
        ) : (
          <div className="space-y-3">
            {form.socials.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={s.network}
                  onChange={(e) => setSocial(i, 'network', e.target.value)}
                  className="w-32 px-2.5 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none shrink-0"
                >
                  {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input
                  type="url"
                  value={s.url}
                  onChange={(e) => setSocial(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none"
                />
                <button
                  onClick={() => removeSocial(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map location */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Map Location (optional)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={form.map_lat}
              onChange={(e) => set('map_lat', e.target.value)}
              placeholder="e.g. 51.5074"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={form.map_lng}
              onChange={(e) => set('map_lng', e.target.value)}
              placeholder="e.g. -0.1278"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Find your coordinates at{' '}
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">
            maps.google.com
          </a>
        </p>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.show_profile}
            onChange={(e) => set('show_profile', e.target.checked)}
            className="w-4 h-4 rounded accent-[#033BB0]"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Show my profile publicly</p>
            <p className="text-xs text-gray-400">Allow candidates to find and view your company profile</p>
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#033BB0' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
