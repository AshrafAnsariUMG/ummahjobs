'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Props {
  /** What kind of account is being deleted — used to tailor the warning text */
  role: 'candidate' | 'employer' | 'admin'
  onClose: () => void
}

const REASONS = [
  '',
  'Found a job',
  'Not finding relevant jobs',
  'Privacy concerns',
  'Just trying it out',
  'Other',
]

export default function DeleteAccountModal({ role, onClose }: Props) {
  const { logout } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSubmit = password.length > 0 && confirmation === 'DELETE' && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const finalReason = reason === 'Other' ? customReason : reason
      const data = await api.post('/api/auth/delete-account', {
        password,
        confirmation,
        reason: finalReason || null,
      }) as { message: string; purge_at: string }
      const date = new Date(data.purge_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      setSuccess(`Your account will be permanently deleted on ${date}. Sign in any time before then to cancel.`)
      // Log out shortly so the success message can be read
      setTimeout(() => { logout() }, 4500)
    } catch (err) {
      const e = err as { message?: string }
      setError(e?.message ?? 'Could not process deletion request.')
      setSubmitting(false)
    }
  }

  const sharedSummary = (
    <ul style={{ margin: '12px 0 0 0', paddingLeft: '18px', fontSize: '13px', color: '#374151', lineHeight: 1.7 }}>
      <li><strong>Deleted:</strong> Your profile, files, and personal preferences</li>
      <li><strong>Anonymised (kept for the other party):</strong> Messages you sent, feedback you submitted</li>
      {role === 'candidate' && (
        <li><strong>Anonymised:</strong> Your job applications and any reviews you wrote (employers keep their record but with your name removed)</li>
      )}
      {role === 'employer' && (
        <li><strong>Archived:</strong> Your job postings are marked as expired and shown as &quot;Closed Account&quot;. Stripe payment records are kept for accounting (but unlinked from your name).</li>
      )}
      <li><strong>Grace period:</strong> You have 30 days to restore your account by signing back in</li>
    </ul>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={success ? undefined : onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: '#FEF3C7' }}>
              <svg className="w-6 h-6" fill="none" stroke="#92400E" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Deletion scheduled</h3>
            <p className="text-sm text-gray-600">{success}</p>
            <p className="text-xs text-gray-400 mt-4">Signing you out…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Delete account</h2>
            <p className="text-sm text-gray-500 mb-4">
              This will schedule your account for permanent deletion in 30 days. You can restore it by signing in before then.
            </p>

            <div className="rounded-lg p-3 mb-5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <p className="text-sm font-semibold" style={{ color: '#991B1B' }}>What happens to your data</p>
              {sharedSummary}
            </div>

            {error && (
              <div className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Why are you leaving? (optional)</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                >
                  {REASONS.map((r) => <option key={r} value={r}>{r || 'Prefer not to say'}</option>)}
                </select>
              </div>

              {reason === 'Other' && (
                <div>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Tell us more (optional)"
                    maxLength={500}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm your password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type <strong>DELETE</strong> to confirm</label>
                <input
                  type="text"
                  required
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white"
                style={{
                  background: canSubmit ? '#DC2626' : '#FCA5A5',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                {submitting ? 'Scheduling…' : 'Delete my account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
