'use client'

import { useState } from 'react'
import DeleteAccountModal from './DeleteAccountModal'

export default function DangerZone({ role }: { role: 'candidate' | 'employer' | 'admin' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section
        className="rounded-2xl p-5 mt-8"
        style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
      >
        <h2 className="text-sm font-bold mb-1" style={{ color: '#991B1B' }}>Danger zone</h2>
        <p className="text-xs mb-4" style={{ color: '#7F1D1D' }}>
          Permanently delete your UmmahJobs account. You&apos;ll have 30 days to change your mind by signing back in.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
          style={{ borderColor: '#DC2626', color: '#DC2626', background: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#DC2626' }}
        >
          Delete my account
        </button>
      </section>
      {open && <DeleteAccountModal role={role} onClose={() => setOpen(false)} />}
    </>
  )
}
