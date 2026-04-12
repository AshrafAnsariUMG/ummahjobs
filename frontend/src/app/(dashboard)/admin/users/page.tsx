'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'

interface AdminUser {
  id: string
  display_name: string
  email: string
  role: 'candidate' | 'employer' | 'admin'
  is_active: boolean
  created_at: string
}

interface UsersResponse {
  data: AdminUser[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: {
    total: number
    active: number
    inactive: number
  }
}

type RoleFilter = 'all' | 'candidate' | 'employer' | 'admin'
type StatusFilter = 'all' | 'active' | 'inactive'

const MOCK_USERS: AdminUser[] = [
  { id: '1', display_name: 'John Doe', email: 'john@example.com', role: 'candidate', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '2', display_name: 'Acme Corp', email: 'hr@acme.com', role: 'employer', is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: '3', display_name: 'Sarah Ahmed', email: 'sarah@example.com', role: 'candidate', is_active: false, created_at: '2026-02-01T00:00:00Z' },
  { id: '4', display_name: 'TechStart Ltd', email: 'contact@techstart.io', role: 'employer', is_active: true, created_at: '2026-02-10T00:00:00Z' },
  { id: '5', display_name: 'Admin User', email: 'admin@ummahjobs.com', role: 'admin', is_active: true, created_at: '2025-12-01T00:00:00Z' },
]

const ROLE_STYLES: Record<string, string> = {
  candidate: 'bg-blue-100 text-blue-700',
  employer:  'bg-purple-100 text-purple-700',
  admin:     'bg-red-100 text-red-700',
}

const ROLE_TABS: { key: RoleFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'candidate', label: 'Candidates' },
  { key: 'employer', label: 'Employers' },
  { key: 'admin', label: 'Admins' },
]

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: '#033BB0' }}
    >
      {initials}
    </div>
  )
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{body}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleModal({
  user,
  onSave,
  onCancel,
}: {
  user: AdminUser
  onSave: (role: AdminUser['role']) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<AdminUser['role']>(user.role)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (selected === user.role) { onCancel(); return }
    setSaving(true)
    await onSave(selected)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="font-bold text-gray-900 mb-1">Change Role</h3>
        <p className="text-sm text-gray-500 mb-4">
          Changing role for <span className="font-medium text-gray-700">{user.display_name}</span>
        </p>
        <div className="space-y-2 mb-5">
          {(['candidate', 'employer', 'admin'] as const).map((r) => (
            <label
              key={r}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selected === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={selected === r}
                onChange={() => setSelected(r)}
                className="sr-only"
              />
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[r]}`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </span>
            </label>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected === user.role}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50"
            style={{ backgroundColor: '#033BB0' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionsMenu({
  user,
  onRoleChange,
  onStatusToggle,
  onDelete,
}: {
  user: AdminUser
  onRoleChange: () => void
  onStatusToggle: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
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
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
          {user.role === 'employer' && (
            <a
              href={`/employers/${user.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              View Profile ↗
            </a>
          )}
          {user.role !== 'employer' && (
            <button
              disabled
              title="Candidate public profiles coming soon"
              className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
            >
              View Profile
            </button>
          )}
          <button
            onClick={() => { setOpen(false); onRoleChange() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Change Role
          </button>
          <button
            onClick={() => { setOpen(false); onStatusToggle() }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {user.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); onDelete() }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  // Modals
  const [roleModal, setRoleModal] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter, statusFilter])

  // Fetch users
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (roleFilter !== 'all') params.set('role', roleFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)

    api.get(`/api/admin/users?${params.toString()}`)
      .then((d: UsersResponse) => {
        setUsers(d.data)
        setStats(d.stats)
        setMeta(d.meta)
        setIsMock(false)
      })
      .catch(() => {
        setUsers(MOCK_USERS)
        setStats({ total: MOCK_USERS.length, active: MOCK_USERS.filter((u) => u.is_active).length, inactive: MOCK_USERS.filter((u) => !u.is_active).length })
        setMeta({ current_page: 1, last_page: 1, total: MOCK_USERS.length })
        setIsMock(true)
      })
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, roleFilter, statusFilter])

  async function handleRoleChange(userId: string, newRole: AdminUser['role']) {
    try {
      const updated = await api.put(`/api/admin/users/${userId}/role`, { role: newRole }) as AdminUser
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)))
    } catch {
      // silent — modal will close regardless
    }
    setRoleModal(null)
  }

  async function handleStatusToggle(user: AdminUser) {
    const newStatus = !user.is_active
    // Optimistic
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u)))
    setStatusTarget(null)
    try {
      await api.put(`/api/admin/users/${user.id}/status`, { is_active: newStatus })
    } catch {
      // Revert
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !newStatus } : u)))
    }
  }

  async function handleDelete(user: AdminUser) {
    setDeleteTarget(null)
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    try {
      await api.delete(`/api/admin/users/${user.id}`)
      setStats((s) => ({ ...s, total: s.total - 1, active: user.is_active ? s.active - 1 : s.active, inactive: !user.is_active ? s.inactive - 1 : s.inactive }))
    } catch {
      // Reload page to restore state
      setPage((p) => p)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      {/* Modals */}
      {roleModal && (
        <RoleModal
          user={roleModal}
          onSave={(role) => handleRoleChange(roleModal.id, role)}
          onCancel={() => setRoleModal(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          body={`Delete "${deleteTarget.display_name}"? This cannot be undone. All data associated with this user will be deleted.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {statusTarget && (
        <ConfirmDialog
          title={statusTarget.is_active ? 'Deactivate User' : 'Activate User'}
          body={`Are you sure you want to ${statusTarget.is_active ? 'deactivate' : 'activate'} "${statusTarget.display_name}"?`}
          confirmLabel={statusTarget.is_active ? 'Deactivate' : 'Activate'}
          confirmClass={statusTarget.is_active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}
          onConfirm={() => handleStatusToggle(statusTarget)}
          onCancel={() => setStatusTarget(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all platform users</p>
        </div>

        {/* Mock data banner */}
        {isMock && (
          <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-800">
              Showing mock data — the backend API is unreachable. Live user management will work once the server is accessible.
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xl font-extrabold text-gray-900">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Users</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xl font-extrabold text-green-600">{stats.active.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xl font-extrabold text-gray-400">{stats.inactive.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Inactive</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Export placeholder */}
            <button
              disabled
              title="Export coming soon"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>

          {/* Role tabs */}
          <div className="flex gap-1 mt-3 border-b border-gray-100 -mb-4 pb-0">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  roleFilter === tab.key
                    ? 'border-transparent'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={roleFilter === tab.key ? { borderColor: '#033BB0', color: '#033BB0' } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400">No users found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">User</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Role</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Joined</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        {/* User */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={user.display_name} />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{user.display_name}</p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {/* Joined */}
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <ActionsMenu
                            user={user}
                            onRoleChange={() => setRoleModal(user)}
                            onStatusToggle={() => setStatusTarget(user)}
                            onDelete={() => setDeleteTarget(user)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Page {meta.current_page} of {meta.last_page} · {meta.total.toLocaleString()} users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                      disabled={page === meta.last_page}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next →
                    </button>
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
