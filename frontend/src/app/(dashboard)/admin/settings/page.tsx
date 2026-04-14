'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'

type SettingType = 'text' | 'textarea' | 'boolean' | 'color' | 'image' | 'url'

interface Setting {
  key: string
  value: string | null
  type: SettingType
  group: string
  label: string
  description: string | null
}

type GroupedSettings = Record<string, Setting[]>

const TABS: { id: string; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'seo', label: 'SEO' },
  { id: 'social', label: 'Social' },
]

export default function AdminSettingsPage() {
  const [grouped, setGrouped] = useState<GroupedSettings>({})
  const [activeTab, setActiveTab] = useState('general')
  const [changed, setChanged] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/api/admin/settings')
      .then((data: unknown) => setGrouped((data as { grouped: GroupedSettings }).grouped))
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setIsLoading(false))
  }, [])

  function getValue(setting: Setting): string {
    return changed[setting.key] !== undefined
      ? changed[setting.key]
      : (setting.value ?? '')
  }

  function handleChange(key: string, value: string) {
    setChanged((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (Object.keys(changed).length === 0) return
    setIsSaving(true)
    setError(null)
    try {
      await api.post('/api/admin/settings', changed)
      // Merge changes into grouped
      setGrouped((prev) => {
        const next = { ...prev }
        for (const group of Object.keys(next)) {
          next[group] = next[group].map((s) =>
            changed[s.key] !== undefined ? { ...s, value: changed[s.key] } : s
          )
        }
        return next
      })
      setChanged({})
      setSavedAt(new Date())
    } catch {
      setError('Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const data = await api.upload('/api/admin/settings/logo', formData) as { url: string }
      // Reflect in grouped state immediately
      setGrouped((prev) => {
        const next = { ...prev }
        if (next.appearance) {
          next.appearance = next.appearance.map((s) =>
            s.key === 'logo_path' ? { ...s, value: data.url } : s
          )
        }
        return next
      })
      setSavedAt(new Date())
    } catch {
      setError('Logo upload failed.')
    } finally {
      setLogoUploading(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const currentSettings = grouped[activeTab] ?? []
  const hasChanges = Object.keys(changed).length > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin h-8 w-8" style={{ color: '#033BB0' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Control site content without touching code</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && !hasChanges && (
            <span className="text-sm text-gray-400">
              Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            style={{
              height: '38px',
              padding: '0 20px',
              background: hasChanges ? '#033BB0' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: hasChanges && !isSaving ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s',
            }}
          >
            {isSaving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {hasChanges && (
        <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ background: '#FFF9E6', border: '1px solid #F59E0B', color: '#92400E' }}>
          You have unsaved changes — remember to click Save Changes.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#033BB0' : '#6B7280',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings fields */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {currentSettings.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-400">No settings in this group.</p>
        )}
        {currentSettings.map((setting) => (
          <div key={setting.key} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="sm:w-72 shrink-0">
              <label
                htmlFor={setting.key}
                className="text-sm font-medium text-gray-900 block"
              >
                {setting.label}
              </label>
              {setting.description && (
                <p className="text-xs text-gray-400 mt-1">{setting.description}</p>
              )}
            </div>
            <div className="flex-1">
              <SettingField
                setting={setting}
                value={getValue(setting)}
                onChange={(v) => handleChange(setting.key, v)}
                onLogoUpload={setting.key === 'logo_path' ? handleLogoUpload : undefined}
                logoUploading={logoUploading}
                logoInputRef={setting.key === 'logo_path' ? logoInputRef : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingField({
  setting,
  value,
  onChange,
  onLogoUpload,
  logoUploading,
  logoInputRef,
}: {
  setting: Setting
  value: string
  onChange: (v: string) => void
  onLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void
  logoUploading?: boolean
  logoInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const inputBase: React.CSSProperties = {
    width: '100%',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    color: '#111827',
    background: 'white',
  }

  if (setting.type === 'boolean') {
    const checked = value === '1' || value === 'true'
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <div
          onClick={() => onChange(checked ? '0' : '1')}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: checked ? '#0FBB0F' : '#D1D5DB',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.2s',
          }} />
        </div>
        <span style={{ fontSize: '14px', color: '#374151' }}>
          {checked ? 'Enabled' : 'Disabled'}
        </span>
      </label>
    )
  }

  if (setting.type === 'textarea') {
    return (
      <textarea
        id={setting.key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...inputBase, padding: '8px 12px', resize: 'vertical' }}
      />
    )
  }

  if (setting.type === 'color') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="color"
          value={value || '#033BB0'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '44px', height: '36px', borderRadius: '6px', border: '1px solid #D1D5DB', padding: '2px', cursor: 'pointer' }}
        />
        <input
          id={setting.key}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#033BB0"
          style={{ ...inputBase, maxWidth: '140px' }}
        />
      </div>
    )
  }

  if (setting.type === 'image') {
    return (
      <div>
        {value && (
          <div style={{ marginBottom: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Current"
              style={{ height: '48px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #E5E7EB', padding: '4px' }}
            />
          </div>
        )}
        <input
          ref={logoInputRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*"
          onChange={onLogoUpload}
          style={{ display: 'none' }}
          id={`upload-${setting.key}`}
        />
        <label
          htmlFor={`upload-${setting.key}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            cursor: logoUploading ? 'not-allowed' : 'pointer',
            background: 'white',
            opacity: logoUploading ? 0.6 : 1,
          }}
        >
          {logoUploading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Uploading…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {value ? 'Replace image' : 'Upload image'}
            </>
          )}
        </label>
        {value && (
          <p style={{ marginTop: '6px', fontSize: '12px', color: '#9CA3AF', wordBreak: 'break-all' }}>{value}</p>
        )}
      </div>
    )
  }

  // text or url
  return (
    <input
      id={setting.key}
      type={setting.type === 'url' ? 'url' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={setting.type === 'url' ? 'https://' : ''}
      style={inputBase}
    />
  )
}
