'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import SkillsInput from '@/components/candidate/SkillsInput'
import type { Candidate, JobCategory } from '@/types'
import { getStorageUrl } from '@/lib/imageUtils'

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const AGE_RANGE_OPTIONS = [
  { value: '', label: 'Select age range' },
  { value: 'Under 20', label: 'Under 20' },
  { value: '20-25', label: '20–25' },
  { value: '26-30', label: '26–30' },
  { value: '31-35', label: '31–35' },
  { value: '36-40', label: '36–40' },
  { value: '41-50', label: '41–50' },
  { value: '50+', label: '50+' },
]

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select experience' },
  { value: 'Fresh', label: 'Fresh Graduate' },
  { value: '1 Year', label: '1 Year' },
  { value: '2 Year', label: '2 Years' },
  { value: '3 Year', label: '3 Years' },
  { value: '4 Year', label: '4 Years' },
  { value: '5+ Year', label: '5+ Years' },
]

// Map legacy numeric strings stored in DB to current string values
const LEGACY_EXP_MAP: Record<string, string> = {
  '0': 'Fresh',
  '1': '1 Year',
  '2': '2 Year',
  '3': '3 Year',
  '4': '4 Year',
  '5': '5+ Year',
}

const QUALIFICATION_OPTIONS = [
  { value: '', label: 'Select qualification' },
  { value: 'High School', label: 'High School' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'Bachelor Degree', label: 'Bachelor Degree' },
  { value: 'Master Degree', label: 'Master Degree' },
  { value: 'PhD', label: 'PhD' },
  { value: 'Other', label: 'Other' },
]

const SALARY_TYPE_OPTIONS = [
  { value: '', label: 'Select preference' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Yearly', label: 'Yearly' },
]

const SOCIAL_NETWORKS = ['LinkedIn', 'Twitter', 'GitHub', 'Portfolio', 'Website', 'Other']

const LANGUAGE_SUGGESTIONS = ['English', 'Arabic', 'Urdu', 'French', 'Spanish', 'Turkish', 'Malay']

interface FormState {
  title: string
  location: string
  phone: string
  gender: string
  age_range: string
  experience_years: string
  qualification: string
  job_category: string
  salary_type: string
  languages: string[]
  skills: string[]
  socials: { network: string; url: string }[]
  show_profile: boolean
}

export default function CandidateProfileEditPage() {
  const { showToast } = useToast()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvProgress, setCvProgress] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [newLang, setNewLang] = useState('')

  const [form, setForm] = useState<FormState>({
    title: '',
    location: '',
    phone: '',
    gender: '',
    age_range: '',
    experience_years: '',
    qualification: '',
    job_category: '',
    salary_type: '',
    languages: [],
    skills: [],
    socials: [],
    show_profile: true,
  })

  useEffect(() => {
    Promise.all([
      api.get('/api/candidate/profile'),
      api.get('/api/categories'),
    ])
      .then(([profile, cats]: [Candidate, JobCategory[]]) => {
        setCandidate(profile)
        setCategories(cats)
        setPhotoPreview(getStorageUrl(profile.profile_photo_path))
        setForm({
          title: profile.title ?? '',
          location: profile.location ?? '',
          phone: profile.phone ?? '',
          gender: profile.gender ?? '',
          age_range: profile.age_range ?? '',
          experience_years: (() => {
            if (profile.experience_years == null) return ''
            const raw = String(profile.experience_years)
            return LEGACY_EXP_MAP[raw] ?? raw
          })(),
          qualification: profile.qualification ?? '',
          job_category: profile.job_category ?? '',
          salary_type: profile.salary_type ?? '',
          languages: profile.languages ?? [],
          skills: profile.skills ?? [],
          socials: profile.socials ?? [],
          show_profile: profile.show_profile ?? true,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function addLanguage() {
    const lang = newLang.trim()
    if (!lang || form.languages.includes(lang)) return
    set('languages', [...form.languages, lang])
    setNewLang('')
  }

  function removeLanguage(lang: string) {
    set('languages', form.languages.filter((l) => l !== lang))
  }

  function addSocial() {
    set('socials', [...form.socials, { network: 'LinkedIn', url: '' }])
  }

  function removeSocial(i: number) {
    set('socials', form.socials.filter((_, idx) => idx !== i))
  }

  function setSocial(i: number, field: 'network' | 'url', value: string) {
    set('socials', form.socials.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    const preview = URL.createObjectURL(file)
    setPhotoPreview(preview)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res: { profile_photo_path: string } = await api.upload('/api/candidate/profile/photo', fd)
      setPhotoPreview(getStorageUrl(res.profile_photo_path))
      setCandidate((prev) => prev ? { ...prev, profile_photo_path: res.profile_photo_path } : prev)
      showToast('JazakAllah Khayran! Photo updated.', 'success')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to upload photo.', 'error')
      setPhotoPreview(getStorageUrl(candidate?.profile_photo_path ?? null))
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleCVChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCV(true)
    setCvProgress(0)

    // Simulate progress since fetch doesn't expose upload progress
    const interval = setInterval(() => setCvProgress((p) => Math.min(p + 20, 80)), 200)

    try {
      const fd = new FormData()
      fd.append('cv', file)
      const res: { cv_path: string } = await api.upload('/api/candidate/profile/cv', fd)
      clearInterval(interval)
      setCvProgress(100)
      setCandidate((prev) => prev ? { ...prev, cv_path: res.cv_path } : prev)
      showToast('JazakAllah Khayran! CV uploaded.', 'success')
      setTimeout(() => setCvProgress(0), 1500)
    } catch (err: unknown) {
      clearInterval(interval)
      setCvProgress(0)
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to upload CV.', 'error')
    } finally {
      setUploadingCV(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated: Candidate = await api.put('/api/candidate/profile', {
        ...form,
        experience_years: form.experience_years !== '' ? form.experience_years : null,
        socials: form.socials.filter((s) => s.url.trim()),
      })
      setCandidate(updated)
      showToast('JazakAllah Khayran! Profile saved.', 'success')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to save profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const completionPct = candidate ? Math.round(Number(candidate.profile_complete_pct)) : 0

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            {[1,2,3].map((j) => <div key={j} className="h-10 bg-gray-100 rounded" />)}
          </div>
        ))}
      </div>
    )
  }

  const cvFilename = candidate?.cv_path
    ? decodeURIComponent(candidate.cv_path.split('/').pop() ?? 'cv')
    : null

  const initials = candidate?.user?.display_name
    ?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() ?? '?'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Profile {completionPct}% complete
          {completionPct < 100 && (
            <span className="ml-2 text-xs text-blue-600">Keep going!</span>
          )}
        </p>
        {completionPct < 100 && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full" style={{ width: `${completionPct}%`, backgroundColor: '#033BB0' }} />
          </div>
        )}
      </div>

      {/* Section 1: Profile Photo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white border-2 border-white shadow"
                style={{ backgroundColor: '#033BB0' }}
              >
                {initials}
              </div>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {photoPreview ? 'Looking good!' : 'No photo uploaded yet.'}
            </p>
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              {uploadingPhoto ? 'Uploading…' : photoPreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP, max 2MB</p>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      {/* Section 2: Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={candidate?.user?.display_name ?? ''}
            readOnly
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Contact support to change your name.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Headline / Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. London, UK"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+44 7700 900000"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => set('gender', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none"
            >
              {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
            <select
              value={form.age_range}
              onChange={(e) => set('age_range', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none"
            >
              {AGE_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Professional Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">Professional Information</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <select
              value={form.experience_years}
              onChange={(e) => set('experience_years', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none"
            >
              {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
            <select
              value={form.qualification}
              onChange={(e) => set('qualification', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none"
            >
              {QUALIFICATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Category Preference</label>
            <select
              value={form.job_category}
              onChange={(e) => set('job_category', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type Preference</label>
            <select
              value={form.salary_type}
              onChange={(e) => set('salary_type', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none"
            >
              {SALARY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Skills */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-1">Skills</h2>
        <p className="text-xs text-gray-400 mb-4">
          Add your key skills — be specific. e.g. React, Laravel, Python, Figma, Google Ads
        </p>
        <SkillsInput
          value={form.skills}
          onChange={(skills) => set('skills', skills)}
        />
      </div>

      {/* Section 5: Languages */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Languages</h2>

        {form.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {form.languages.map((lang) => (
              <span
                key={lang}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: '#033BB0' }}
              >
                {lang}
                <button
                  onClick={() => removeLanguage(lang)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
            placeholder="Type a language…"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none"
          />
          <button
            onClick={addLanguage}
            className="px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {LANGUAGE_SUGGESTIONS.filter((l) => !form.languages.includes(l)).map((l) => (
            <button
              key={l}
              onClick={() => set('languages', [...form.languages, l])}
              className="px-2.5 py-1 text-xs rounded-full border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              + {l}
            </button>
          ))}
        </div>
      </div>

      {/* Section 6: Social Links */}
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
                  className="w-28 px-2.5 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none shrink-0"
                >
                  {SOCIAL_NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input
                  type="url"
                  value={s.url}
                  onChange={(e) => setSocial(i, 'url', e.target.value)}
                  placeholder="https://…"
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

      {/* Section 7: CV */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">CV / Resume</h2>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            {cvFilename ? (
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700 font-medium truncate max-w-[240px]">{cvFilename}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-2">No CV uploaded yet.</p>
            )}

            {cvProgress > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div
                  className="h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${cvProgress}%`, backgroundColor: '#033BB0' }}
                />
              </div>
            )}

            <button
              onClick={() => cvInputRef.current?.click()}
              disabled={uploadingCV}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              {uploadingCV ? 'Uploading…' : cvFilename ? 'Replace CV' : 'Upload CV'}
            </button>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC or DOCX, max 5MB</p>
          </div>
        </div>
        <input
          ref={cvInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleCVChange}
        />
      </div>

      {/* Section 8: Visibility */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.show_profile}
            onChange={(e) => set('show_profile', e.target.checked)}
            className="w-4 h-4 rounded accent-[#033BB0]"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Show my profile to employers</p>
            <p className="text-xs text-gray-400">
              When enabled, employers can discover your profile when searching for candidates.
            </p>
          </div>
        </label>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#033BB0' }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
