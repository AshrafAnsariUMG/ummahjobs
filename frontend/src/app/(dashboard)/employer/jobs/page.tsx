'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { Job, JobCategory, PaginatedResponse } from '@/types'
import IslamicEmptyState from '@/components/ui/IslamicEmptyState'
import { BriefcaseIcon } from '@/components/ui/IslamicIcons'

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Volunteer']
const EXPERIENCE_LEVELS = ['Fresh', '1 Year', '2 Year', '3 Year', '4 Year', '5+ Year']
const CAREER_LEVELS = ['Student', 'Officer', 'Manager', 'Executive', 'Others']
const SALARY_TYPES = ['Monthly', 'Yearly', 'Hourly']

type Tab = 'active' | 'expired' | 'all'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

interface EditForm {
  title: string
  category_id: string
  job_type: string
  location: string
  country: string
  experience_level: string
  career_level: string
  description: string
  apply_type: string
  apply_url: string
  salary_min: string
  salary_max: string
  salary_currency: string
  salary_type: string
  is_urgent: boolean
}

export default function EmployerJobsPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('active')
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get('/api/categories').then(setCategories).catch(() => {})
  }, [])

  const fetchJobs = useCallback(() => {
    setLoading(true)
    const status = tab === 'all' ? '' : `&status=${tab}`
    api.get(`/api/employer/jobs?per_page=20${status}`)
      .then((data: PaginatedResponse<Job>) => {
        setJobs(data.data ?? [])
        setTotal(data.meta?.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  function openEdit(job: Job) {
    setEditJob(job)
    setEditForm({
      title: job.title,
      category_id: job.category ? String(job.category.id) : '',
      job_type: job.job_type ?? '',
      location: job.location ?? '',
      country: job.country ?? '',
      experience_level: job.experience_level ?? '',
      career_level: job.career_level ?? '',
      description: job.description,
      apply_type: job.apply_type,
      apply_url: job.apply_url ?? '',
      salary_min: job.salary_min ? String(job.salary_min) : '',
      salary_max: job.salary_max ? String(job.salary_max) : '',
      salary_currency: job.salary_currency ?? 'USD',
      salary_type: job.salary_type ?? 'Monthly',
      is_urgent: job.is_urgent,
    })
  }

  async function saveEdit() {
    if (!editJob || !editForm) return
    setSaving(true)
    try {
      await api.put(`/api/employer/jobs/${editJob.id}`, {
        ...editForm,
        category_id: editForm.category_id || null,
        salary_min: editForm.salary_min ? Number(editForm.salary_min) : null,
        salary_max: editForm.salary_max ? Number(editForm.salary_max) : null,
      })
      showToast('JazakAllah Khayran! Job updated.', 'success')
      setEditJob(null)
      fetchJobs()
    } catch {
      showToast('Failed to update job.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteJob(id: number) {
    setDeleting(true)
    try {
      await api.delete(`/api/employer/jobs/${id}`)
      showToast('Job deleted.', 'success')
      setDeleteConfirm(null)
      fetchJobs()
      const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET
      fetch(`/api/revalidate?secret=${secret}`, { method: 'POST' }).catch(() => {})
    } catch {
      showToast('Failed to delete job.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
    { key: 'all', label: 'All' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-400 mt-1">{total} total jobs</p>
        </div>
        <Link
          href="/employer/post-job"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#033BB0' }}
        >
          + Post a Job
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
          </div>
        ) : jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Job</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Posted</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Expires</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Views</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 max-w-xs truncate">{job.title}</p>
                      {job.category && <p className="text-xs text-gray-400">{job.category.name}</p>}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-5 py-3 hidden sm:table-cell text-gray-500 text-xs">
                      {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {job.expires_at
                        ? new Date(job.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-gray-500">{job.views_count}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employer/jobs/${job.id}/applicants?title=${encodeURIComponent(job.title)}`}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                          style={{ color: '#033BB0' }}
                        >
                          Applicants
                        </Link>
                        <button
                          onClick={() => openEdit(job)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <a
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 transition-colors"
                        >
                          View
                        </a>
                        <button
                          onClick={() => setDeleteConfirm(job.id)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-red-200 hover:border-red-300 text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          tab === 'all' ? (
            <IslamicEmptyState
              icon={<BriefcaseIcon size={28} />}
              title="No job listings yet"
              message="Post your first halal job and connect with thousands of Muslim professionals across the Ummah."
              actionLabel="Post a Job"
              actionHref="/employer/post-job"
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">
                {tab === 'active' ? 'No active listings.' : 'No expired listings.'}
              </p>
            </div>
          )
        )}
      </div>

      {/* Edit modal */}
      {editJob && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Edit Job</h2>
              <button onClick={() => setEditJob(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none bg-white"
                  >
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    value={editForm.job_type}
                    onChange={(e) => setEditForm({ ...editForm, job_type: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none bg-white"
                  >
                    <option value="">None</option>
                    {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={editForm.experience_level}
                    onChange={(e) => setEditForm({ ...editForm, experience_level: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none bg-white"
                  >
                    <option value="">None</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Level</label>
                  <select
                    value={editForm.career_level}
                    onChange={(e) => setEditForm({ ...editForm, career_level: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none bg-white"
                  >
                    <option value="">None</option>
                    {CAREER_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apply Type</label>
                  <select
                    value={editForm.apply_type}
                    onChange={(e) => setEditForm({ ...editForm, apply_type: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none bg-white"
                  >
                    <option value="external">External URL</option>
                    <option value="platform">On Platform</option>
                  </select>
                </div>
                {editForm.apply_type === 'external' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apply URL</label>
                    <input
                      type="url"
                      value={editForm.apply_url}
                      onChange={(e) => setEditForm({ ...editForm, apply_url: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="number"
                  value={editForm.salary_min}
                  onChange={(e) => setEditForm({ ...editForm, salary_min: e.target.value })}
                  placeholder="Salary min"
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
                />
                <input
                  type="number"
                  value={editForm.salary_max}
                  onChange={(e) => setEditForm({ ...editForm, salary_max: e.target.value })}
                  placeholder="Salary max"
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none"
                />
                <select
                  value={editForm.salary_type}
                  onChange={(e) => setEditForm({ ...editForm, salary_type: e.target.value })}
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none bg-white"
                >
                  {SALARY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.is_urgent}
                    onChange={(e) => setEditForm({ ...editForm, is_urgent: e.target.checked })}
                    className="accent-[#033BB0]"
                  />
                  Urgent
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditJob(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: '#033BB0' }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="font-bold text-gray-900 mb-2">Delete Job?</h2>
            <p className="text-sm text-gray-500 mb-5">This cannot be undone. The listing will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteJob(deleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
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
