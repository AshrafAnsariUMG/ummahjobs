'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import { getStorageUrl } from '@/lib/imageUtils'

interface AdminEmployer {
  id: number
  company_name: string
  slug: string
  category: string | null
  description: string | null
  email: string | null
  phone: string | null
  address: string | null
  socials: Array<{ platform: string; url: string }> | Record<string, string> | null
  logo_path: string | null
  cover_photo_path: string | null
  map_lat: number | string | null
  map_lng: number | string | null
  is_verified: boolean
  show_profile: boolean
  views_count: number
  created_at: string
  user: { id: string; email: string; is_active: boolean } | null
}

interface EmployersResponse {
  data: AdminEmployer[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}


interface Package {
  id: number
  name: string
  price: number
  post_count: number
  duration_days: number
}

type SocialEntry = { platform: string; url: string }

function normalizeSocials(raw: AdminEmployer['socials']): SocialEntry[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as SocialEntry[]
  if (typeof raw === 'object') {
    return Object.entries(raw).map(([platform, url]) => ({ platform, url: String(url) }))
  }
  return []
}

function GrantCreditsModal({
  employer,
  onClose,
  onGranted,
}: {
  employer: AdminEmployer
  onClose: () => void
  onGranted: () => void
}) {
  const [packages, setPackages] = useState<Package[]>([])
  const [packageId, setPackageId] = useState<number | ''>('')
  const [credits, setCredits] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/packages')
      .then((data: unknown) => {
        const pkgs = data as Package[]
        setPackages(pkgs)
        if (pkgs.length > 0) setPackageId(pkgs[0].id)
      })
      .catch(() => setError('Failed to load packages.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!packageId) return
    setSaving(true)
    setError(null)
    try {
      await api.post('/api/admin/credits/grant', {
        employer_id: employer.id,
        package_id: packageId,
        credits,
        note: note || undefined,
      })
      onGranted()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to grant credits.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    color: '#111827',
    background: 'white',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Grant Credits</h3>
            <p className="text-sm text-gray-500 mt-0.5">{employer.company_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="py-8 flex justify-center">
            <svg className="animate-spin h-6 w-6" style={{ color: '#033BB0' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(Number(e.target.value))}
                  style={{ ...inputStyle }}
                  required
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.post_count} posts · {pkg.duration_days}d
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Credits</label>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(Math.max(1, Math.min(50, Number(e.target.value))))}
                  min={1}
                  max={50}
                  style={inputStyle}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Maximum 50 credits per grant</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Reason for granting credits..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-5">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !packageId}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-60"
                style={{ backgroundColor: '#033BB0' }}
              >
                {saving ? 'Granting…' : 'Grant Credits'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function EditEmployerModal({
  employer,
  onClose,
  onSaved,
}: {
  employer: AdminEmployer
  onClose: () => void
  onSaved: (updated: AdminEmployer) => void
}) {
  const [tab, setTab] = useState<'info' | 'media'>('info')
  const [form, setForm] = useState({
    company_name: employer.company_name ?? '',
    category: employer.category ?? '',
    description: employer.description ?? '',
    email: employer.email ?? '',
    phone: employer.phone ?? '',
    address: employer.address ?? '',
    map_lat: String(employer.map_lat ?? ''),
    map_lng: String(employer.map_lng ?? ''),
    show_profile: employer.show_profile,
  })
  const [socials, setSocials] = useState<SocialEntry[]>(normalizeSocials(employer.socials))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Media state
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(getStorageUrl(employer.logo_path))
  const [coverPreview, setCoverPreview] = useState<string | null>(getStorageUrl(employer.cover_photo_path))
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [mediaSuccess, setMediaSuccess] = useState<string | null>(null)

  // Re-initialise previews when a different employer is loaded into the modal
  useEffect(() => {
    setLogoPreview(getStorageUrl(employer.logo_path))
    setCoverPreview(getStorageUrl(employer.cover_photo_path))
    setLogoFile(null)
    setCoverFile(null)
    setMediaSuccess(null)
    setError(null)
  }, [employer.id])

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent'
  const inputStyle = { '--tw-ring-color': '#033BB0' } as React.CSSProperties

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        map_lat: form.map_lat ? parseFloat(form.map_lat) : null,
        map_lng: form.map_lng ? parseFloat(form.map_lng) : null,
        socials: socials.filter((s) => s.platform && s.url),
      }
      const updated = await api.put(`/api/admin/employers/${employer.id}/profile`, payload) as AdminEmployer
      onSaved(updated)
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadLogo() {
    if (!logoFile) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('uj_token') : null
    if (!token) return
    setUploadingLogo(true)
    setMediaSuccess(null)
    try {
      const fd = new FormData()
      fd.append('logo', logoFile)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/employers/${employer.id}/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json() as { logo_path: string }
      const fullUrl = getStorageUrl(data.logo_path)
      setLogoPreview(fullUrl)
      setLogoFile(null)
      setMediaSuccess('Logo uploaded successfully.')
      onSaved({ ...employer, logo_path: fullUrl })
    } catch {
      setError('Logo upload failed.')
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleUploadCover() {
    if (!coverFile) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('uj_token') : null
    if (!token) return
    setUploadingCover(true)
    setMediaSuccess(null)
    try {
      const fd = new FormData()
      fd.append('cover', coverFile)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/employers/${employer.id}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json() as { cover_path: string }
      const fullCoverUrl = getStorageUrl(data.cover_path)
      setCoverPreview(fullCoverUrl)
      setCoverFile(null)
      setMediaSuccess('Cover photo uploaded successfully.')
      onSaved({ ...employer, cover_photo_path: fullCoverUrl })
    } catch {
      setError('Cover upload failed.')
    } finally {
      setUploadingCover(false)
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Edit Employer</h3>
            <p className="text-sm text-gray-500 mt-0.5">{employer.company_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 shrink-0">
          {(['info', 'media'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setMediaSuccess(null) }}
              className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize"
              style={tab === t
                ? { borderColor: '#033BB0', color: '#033BB0' }
                : { borderColor: 'transparent', color: '#6b7280' }}
            >
              {t === 'info' ? 'Company Info' : 'Media'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>
          )}
          {mediaSuccess && (
            <div className="mb-4 p-3 rounded-lg text-sm text-green-700 bg-green-50 border border-green-200">{mediaSuccess}</div>
          )}

          {tab === 'info' && (
            <form id="employer-info-form" onSubmit={handleSaveInfo}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                    <input value={form.company_name} onChange={(e) => set('company_name', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <input value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Technology" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputCls} style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <input value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Map Latitude</label>
                    <input type="number" step="any" value={form.map_lat} onChange={(e) => set('map_lat', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. 51.5074" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Map Longitude</label>
                    <input type="number" step="any" value={form.map_lng} onChange={(e) => set('map_lng', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. -0.1278" />
                  </div>
                </div>

                {/* Social links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Social Links</label>
                    <button
                      type="button"
                      onClick={() => setSocials((s) => [...s, { platform: '', url: '' }])}
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#033BB0' }}
                    >
                      + Add
                    </button>
                  </div>
                  {socials.length === 0 && (
                    <p className="text-xs text-gray-400">No social links added.</p>
                  )}
                  {socials.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        value={s.platform}
                        onChange={(e) => setSocials((prev) => prev.map((x, j) => j === i ? { ...x, platform: e.target.value } : x))}
                        placeholder="Platform (e.g. LinkedIn)"
                        className="w-32 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                      />
                      <input
                        value={s.url}
                        onChange={(e) => setSocials((prev) => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                        placeholder="https://..."
                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSocials((prev) => prev.filter((_, j) => j !== i))}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{ backgroundColor: form.show_profile ? '#033BB0' : '#D1D5DB' }}
                      onClick={() => set('show_profile', !form.show_profile)}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.show_profile ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Profile Visible</span>
                  </label>
                </div>
              </div>
            </form>
          )}

          {tab === 'media' && (
            <div className="space-y-6">
              {/* Logo */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Company Logo</h4>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                    {(logoPreview ?? getStorageUrl(employer.logo_path)) ? (
                      <img src={logoPreview ?? getStorageUrl(employer.logo_path)!} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-lg font-bold" style={{ color: '#033BB0' }}>{employer.company_name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={handleLogoChange} />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 mb-2"
                    >
                      Choose Logo
                    </button>
                    {logoFile && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600 truncate max-w-[200px]">{logoFile.name}</p>
                        <button
                          type="button"
                          onClick={handleUploadLogo}
                          disabled={uploadingLogo}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-60"
                          style={{ backgroundColor: '#033BB0' }}
                        >
                          {uploadingLogo ? 'Uploading…' : 'Upload'}
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP or SVG · max 2MB</p>
                  </div>
                </div>
              </div>

              {/* Cover photo */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Cover Photo</h4>
                {(coverPreview ?? getStorageUrl(employer.cover_photo_path)) && (
                  <div className="w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-3">
                    <img src={coverPreview ?? getStorageUrl(employer.cover_photo_path)!} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Choose Cover
                  </button>
                  {coverFile && (
                    <>
                      <p className="text-xs text-gray-600 truncate max-w-[180px]">{coverFile.name}</p>
                      <button
                        type="button"
                        onClick={handleUploadCover}
                        disabled={uploadingCover}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-60"
                        style={{ backgroundColor: '#033BB0' }}
                      >
                        {uploadingCover ? 'Uploading…' : 'Upload'}
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP · max 5MB · recommended 1200×300px</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Close
          </button>
          {tab === 'info' && (
            <button
              type="submit"
              form="employer-info-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
              style={{ backgroundColor: '#033BB0' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionsMenu({
  employer,
  onProfileToggle,
  onGrantCredits,
  onEditProfile,
}: {
  employer: AdminEmployer
  onProfileToggle: () => void
  onGrantCredits: () => void
  onEditProfile: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
          <a
            href={`/employers/${employer.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            View Profile ↗
          </a>
          <button
            onClick={() => { setOpen(false); onEditProfile() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit Profile
          </button>
          <button
            onClick={() => { setOpen(false); onGrantCredits() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Grant Credits
          </button>
          <button
            onClick={() => { setOpen(false); onProfileToggle() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {employer.show_profile ? 'Hide Profile' : 'Show Profile'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminEmployersPage() {
  const { showToast } = useToast()
  const [employers, setEmployers] = useState<AdminEmployer[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [grantCreditsTarget, setGrantCreditsTarget] = useState<AdminEmployer | null>(null)
  const [editTarget, setEditTarget] = useState<AdminEmployer | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (debouncedSearch) params.set('search', debouncedSearch)

    api.get(`/api/admin/employers?${params}`)
      .then((d: EmployersResponse) => { setEmployers(d.data); setMeta(d.meta) })
      .catch(() => showToast('Failed to load employers.', 'error'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch])

  async function handleProfileToggle(employer: AdminEmployer) {
    const newVal = !employer.show_profile
    setEmployers((prev) => prev.map((e) => e.id === employer.id ? { ...e, show_profile: newVal } : e))
    try {
      await api.put(`/api/admin/employers/${employer.id}`, { show_profile: newVal })
      showToast(newVal ? 'Profile is now visible.' : 'Profile hidden.', 'success')
    } catch {
      setEmployers((prev) => prev.map((e) => e.id === employer.id ? { ...e, show_profile: !newVal } : e))
      showToast('Failed to update employer.', 'error')
    }
  }

  function handleEmployerSaved(updated: AdminEmployer) {
    setEmployers((prev) => prev.map((e) => e.id === updated.id ? { ...e, ...updated } : e))
    if (editTarget?.id === updated.id) setEditTarget((prev) => prev ? { ...prev, ...updated } : prev)
    showToast('JazakAllah Khayran! Employer profile updated.', 'success')
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
    {grantCreditsTarget && (
      <GrantCreditsModal
        employer={grantCreditsTarget}
        onClose={() => setGrantCreditsTarget(null)}
        onGranted={() => {
          setGrantCreditsTarget(null)
          showToast('JazakAllah Khayran! Credits granted.', 'success')
        }}
      />
    )}
    {editTarget && (
      <EditEmployerModal
        employer={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={handleEmployerSaved}
      />
    )}
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Employers</h1>
        <p className="text-sm text-gray-500 mt-1">Manage employer accounts · {meta.total.toLocaleString()} total</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company name..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
          </div>
        ) : employers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-400">No employers found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Company</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Category</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Profile</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employers.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      {/* Company */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {getStorageUrl(emp.logo_path) ? (
                            <img src={getStorageUrl(emp.logo_path)!} alt={emp.company_name} className="w-8 h-8 rounded-lg object-contain border border-gray-100 shrink-0 bg-gray-50" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#033BB0' }}>
                              {emp.company_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{emp.company_name}</p>
                            <p className="text-xs text-gray-400 truncate">{emp.user?.email ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        {emp.category ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{emp.category}</span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      {/* Profile visibility */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.show_profile ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                          {emp.show_profile ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(emp.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ActionsMenu
                          employer={emp}
                          onProfileToggle={() => handleProfileToggle(emp)}
                          onGrantCredits={() => setGrantCreditsTarget(emp)}
                          onEditProfile={() => setEditTarget(emp)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page} · {meta.total.toLocaleString()} employers</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                  <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
}
