'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { JobAlert, JobCategory, JobType } from '@/types'
import { timeAgo } from '@/lib/timeAgo'

interface AlertForm {
  keyword: string
  category_id: string
  location: string
  job_type: string
  frequency: 'daily' | 'weekly'
}

const EMPTY_FORM: AlertForm = {
  keyword: '',
  category_id: '',
  location: '',
  job_type: '',
  frequency: 'daily',
}

function alertSummary(alert: JobAlert, categories: JobCategory[]): string {
  const parts: string[] = []
  if (alert.category_id) {
    const cat = categories.find((c) => c.id === alert.category_id)
    if (cat) parts.push(`Category: ${cat.name}`)
  }
  if (alert.location) parts.push(`Location: ${alert.location}`)
  if (alert.job_type) parts.push(`Type: ${alert.job_type}`)
  parts.push(alert.frequency === 'weekly' ? 'Weekly' : 'Daily')
  return parts.join(' · ')
}

export default function CandidateAlertsPage() {
  const { showToast } = useToast()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [jobTypes, setJobTypes] = useState<JobType[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<AlertForm>(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<AlertForm>(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/api/candidate/alerts'),
      api.get('/api/categories'),
      api.get('/api/job-types'),
    ])
      .then(([alts, cats, types]: [JobAlert[], JobCategory[], JobType[]]) => {
        setAlerts(alts)
        setCategories(cats)
        setJobTypes(types)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function setF(key: keyof AlertForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setEF(key: keyof AlertForm, value: string) {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleCreate() {
    if (!form.keyword && !form.category_id && !form.location && !form.job_type) {
      showToast('Please fill in at least one filter.', 'error')
      return
    }
    setCreating(true)
    try {
      const payload = {
        keyword: form.keyword || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        location: form.location || null,
        job_type: form.job_type || null,
        frequency: form.frequency,
      }
      const created: JobAlert = await api.post('/api/candidate/alerts', payload)
      setAlerts((prev) => [created, ...prev])
      setForm(EMPTY_FORM)
      showToast('Job alert created!', 'success')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to create alert.', 'error')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(alert: JobAlert) {
    setEditingId(alert.id)
    setEditForm({
      keyword: alert.keyword ?? '',
      category_id: alert.category_id ? String(alert.category_id) : '',
      location: alert.location ?? '',
      job_type: alert.job_type ?? '',
      frequency: alert.frequency,
    })
  }

  async function handleUpdate(id: number) {
    try {
      const payload = {
        keyword: editForm.keyword || null,
        category_id: editForm.category_id ? Number(editForm.category_id) : null,
        location: editForm.location || null,
        job_type: editForm.job_type || null,
        frequency: editForm.frequency,
      }
      const updated: JobAlert = await api.put(`/api/candidate/alerts/${id}`, payload)
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)))
      setEditingId(null)
      showToast('Alert updated!', 'success')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to update alert.', 'error')
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await api.delete(`/api/candidate/alerts/${id}`)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
      setConfirmDelete(null)
      showToast('Alert deleted.', 'success')
    } catch {
      showToast('Failed to delete alert.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1'
  const inputStyle = { '--tw-ring-color': '#033BB0' } as React.CSSProperties

  function AlertFormFields({
    vals, onChange, compact = false,
  }: {
    vals: AlertForm
    onChange: (k: keyof AlertForm, v: string) => void
    compact?: boolean
  }) {
    return (
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Keyword / Job Title *</label>
          <input
            type="text"
            value={vals.keyword}
            onChange={(e) => onChange('keyword', e.target.value)}
            placeholder="e.g. Frontend Developer"
            className={inputCls}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            value={vals.category_id}
            onChange={(e) => onChange('category_id', e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">Any category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
          <input
            type="text"
            value={vals.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="e.g. London, Remote"
            className={inputCls}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Job Type</label>
          <select
            value={vals.job_type}
            onChange={(e) => onChange('job_type', e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            <option value="">Any type</option>
            {jobTypes.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Frequency</label>
          <div className="flex gap-4">
            {(['daily', 'weekly'] as const).map((freq) => (
              <label key={freq} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`freq-${compact ? 'edit' : 'create'}`}
                  value={freq}
                  checked={vals.frequency === freq}
                  onChange={() => onChange('frequency', freq)}
                  className="accent-[#033BB0]"
                />
                <span className="text-sm text-gray-700 capitalize">{freq}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Job Alerts</h1>
        <p className="text-sm text-gray-400 mt-1">Get notified when new jobs match your criteria</p>
      </div>

      {/* Create alert form */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Create New Alert</h2>
        <AlertFormFields vals={form} onChange={setF} />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#033BB0' }}
          >
            {creating ? 'Creating…' : 'Create Alert'}
          </button>
        </div>
      </section>

      {/* Existing alerts */}
      <section>
        <h2 className="font-semibold text-gray-900 text-sm mb-4">
          Your Alerts {!loading && alerts.length > 0 && <span className="text-gray-400">({alerts.length})</span>}
        </h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2].map((i) => <div key={i} className="h-24 bg-white rounded-xl border border-gray-200" />)}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-4">
                {editingId === alert.id ? (
                  <>
                    <AlertFormFields vals={editForm} onChange={setEF} compact />
                    <div className="flex gap-2 mt-4 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(alert.id)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#033BB0' }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        {alert.keyword ? `"${alert.keyword}"` : 'All jobs'}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">{alertSummary(alert, categories)}</p>
                      <p className="text-xs text-gray-400">
                        {alert.last_sent_at
                          ? `Last sent ${timeAgo(alert.last_sent_at)}`
                          : 'Never sent yet'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(alert)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit alert"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {confirmDelete === alert.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(alert.id)}
                            disabled={deletingId === alert.id}
                            className="text-xs font-medium text-white px-2 py-1 rounded bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                          >
                            {deletingId === alert.id ? '…' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs text-gray-500 hover:text-gray-700 px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(alert.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete alert"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#E6EDFF' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No job alerts yet</h3>
            <p className="text-sm text-gray-500">
              Alerts help you stay updated on new opportunities matching your criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
