'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AdminUser {
  id: string
  display_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
  email_verified_at: string | null
}

function EyeIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

export default function AdminProfilePage() {
  const { showToast } = useToast()
  const [profile, setProfile] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Personal info
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    api.get('/api/admin/profile')
      .then((data: unknown) => {
        const d = data as AdminUser
        setProfile(d)
        setDisplayName(d.display_name)
        setEmail(d.email)
      })
      .catch(() => showToast('Failed to load profile.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    setSavingInfo(true)
    try {
      const updated = await api.put('/api/admin/profile', { display_name: displayName, email }) as AdminUser
      setProfile(updated)
      setDisplayName(updated.display_name)
      setEmail(updated.email)
      showToast('JazakAllah Khayran! Profile updated.', 'success')
    } catch {
      showToast('Failed to update profile.', 'error')
    } finally {
      setSavingInfo(false)
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error')
      return
    }
    setSavingPassword(true)
    try {
      await api.put('/api/admin/profile', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('JazakAllah Khayran! Password updated.', 'success')
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to change password.'
      showToast(msg, 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin h-8 w-8" style={{ color: '#033BB0' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
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
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin account details</p>
      </div>

      {/* Personal Info */}
      <form onSubmit={handleSaveInfo} className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={savingInfo}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
            style={{ backgroundColor: '#033BB0' }}
          >
            {savingInfo ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handleSavePassword} className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
        <h2 className="font-bold text-gray-900 mb-4">Change Password</h2>
        <div className="space-y-4">
          {([
            { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
            { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew((v) => !v) },
            { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
          ] as const).map(({ label, value, setter, show, toggle }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon off={show} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
            style={{ backgroundColor: '#033BB0' }}
          >
            {savingPassword ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      </form>

      {/* Account Details */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Account Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <dt className="w-36 text-gray-500 shrink-0">Role</dt>
              <dd>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Administrator</span>
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="w-36 text-gray-500 shrink-0">Account Status</dt>
              <dd>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="w-36 text-gray-500 shrink-0">Member Since</dt>
              <dd className="text-gray-700">
                {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </dd>
            </div>
            {profile.email_verified_at && (
              <div className="flex items-center gap-3">
                <dt className="w-36 text-gray-500 shrink-0">Email Verified</dt>
                <dd className="text-gray-700">
                  {new Date(profile.email_verified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}
