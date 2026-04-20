'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { CreditBalance, Package, StripeOrderItem } from '@/types'

function getFeatures(pkg: Package): { label: string; included: boolean }[] {
  const nameLower = pkg.name?.toLowerCase() ?? ''
  return [
    { label: `${pkg.post_count} job post${pkg.post_count > 1 ? 's' : ''}`, included: true },
    { label: `Active for ${pkg.duration_days} days`, included: true },
    { label: 'Featured listing placement', included: pkg.post_type === 'featured' },
    { label: 'AI job description generator', included: true },
    { label: 'Candidate match scoring', included: true },
    { label: 'Company profile + Halal Verified', included: true },
    { label: 'Newsletter inclusion', included: pkg.includes_newsletter === true || nameLower === 'extended' },
    { label: 'Priority support', included: nameLower === 'extended' },
  ]
}

function PackagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [history, setHistory] = useState<StripeOrderItem[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<number | null>(null)

  useEffect(() => {
    if (searchParams.get('cancelled') === '1') {
      showToast('Payment cancelled. You can try again anytime.', 'error')
    }

    Promise.all([
      api.get('/api/employer/packages/balance'),
      api.get('/api/employer/packages/history'),
      api.get('/api/packages'),
    ])
      .then(([bal, hist, pkgs]: [CreditBalance, StripeOrderItem[], Package[]]) => {
        setBalance(bal)
        setHistory(hist)
        setPackages(pkgs.filter((p) => p.is_active))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [searchParams])

  // Auto-poll for credits after successful payment
  useEffect(() => {
    if (searchParams.get('success') !== '1') return

    let attempts = 0
    const successRedirect = searchParams.get('success_redirect')

    const interval = setInterval(async () => {
      attempts++
      try {
        const token = localStorage.getItem('uj_token')
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employer/packages/balance`,
          { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
        )
        const data: CreditBalance = await res.json()
        if ((data.total_credits ?? 0) > 0) {
          clearInterval(interval)
          if (successRedirect) {
            router.push(successRedirect)
          } else {
            setBalance(data)
            window.history.replaceState({}, '', '/employer/packages')
            showToast('JazakAllah Khayran! Your credits are ready.', 'success')
          }
        }
      } catch {
        // silent fail
      }
      if (attempts >= 12) clearInterval(interval)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  async function handleCheckout(packageId: number) {
    setCheckingOut(packageId)
    try {
      const data: { checkout_url: string } = await api.post('/api/employer/packages/checkout', {
        package_id: packageId,
      })
      window.location.href = data.checkout_url
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e?.message ?? 'Failed to start checkout.', 'error')
      setCheckingOut(null)
    }
  }

  return (
    <>
      {/* Current balance */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Current Balance</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
          </div>
        ) : balance?.packages && balance.packages.length > 0 ? (
          <>
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#E6EDFF' }}>
              <span className="text-2xl font-bold" style={{ color: '#033BB0' }}>{balance.total_credits}</span>
              <span className="text-sm font-medium text-blue-700">credits remaining</span>
            </div>
            <div className="space-y-3">
              {balance.packages.map((pkg) => {
                const total = pkg.package?.post_count ?? 1
                const pct = Math.round((pkg.credits_remaining / total) * 100)
                return (
                  <div key={pkg.id} className="rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{pkg.package?.name ?? 'Package'}</span>
                        {pkg.granted_by_admin && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Admin Grant</span>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#033BB0' }}>
                        {pkg.credits_remaining} / {total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: '#033BB0' }} />
                    </div>
                    <p className="text-xs text-gray-400">{pkg.duration_days} days per listing</p>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">No credits yet. Purchase a package below to get started.</p>
        )}
      </section>

      {/* Purchase history */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 text-sm">Purchase History</h2>
        {loading ? (
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Package</th>
                  <th className="text-left py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50">
                    <td className="py-3 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 font-medium text-gray-900">{order.package?.name ?? '—'}</td>
                    <td className="py-3 text-gray-600">${Number(order.amount).toFixed(2)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No purchases yet.</p>
        )}
      </section>

      {/* Buy more */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-5">Need more credits?</h2>
        <div className="grid sm:grid-cols-3 gap-5 items-center">
          {packages.map((pkg) => {
            const nameLower = pkg.name?.toLowerCase() ?? ''
            const isStandard = nameLower.includes('standard')
            const isExtended = nameLower.includes('extended')
            const busy = checkingOut === pkg.id
            const features = getFeatures(pkg)
            return (
              <div
                key={pkg.id}
                style={{
                  background: isExtended ? '#F9FAFB' : 'white',
                  border: isStandard ? '2px solid #033BB0' : '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '28px',
                  position: 'relative',
                  boxShadow: isStandard ? '0 8px 30px rgba(3,59,176,0.12)' : undefined,
                }}
              >
                {isStandard && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#033BB0', color: 'white',
                    fontSize: '11px', fontWeight: 700,
                    padding: '3px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}
                {isExtended && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0FBB0F', color: 'white',
                    fontSize: '11px', fontWeight: 700,
                    padding: '3px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                  }}>
                    Best Value
                  </div>
                )}

                <h3 className="font-bold text-gray-900 mb-1">{pkg.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-extrabold" style={{ color: '#033BB0' }}>
                    ${Number(pkg.price).toFixed(0)}
                  </span>
                  <span className="text-gray-400 text-sm ml-1">one-time</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                  {features.map((f, fi) => (
                    <li key={fi} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 0', fontSize: '13px',
                      color: f.included ? '#374151' : '#9CA3AF',
                      borderBottom: fi < features.length - 1 ? '1px solid #F3F4F6' : undefined,
                    }}>
                      {f.included ? (
                        <svg viewBox="0 0 20 20" fill="#0FBB0F" width={15} height={15} style={{ flexShrink: 0 }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="#D1D5DB" width={15} height={15} style={{ flexShrink: 0 }}>
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {f.label}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(pkg.id)}
                  disabled={busy}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'white',
                    color: '#033BB0',
                    border: '2px solid #033BB0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    opacity: busy ? 0.6 : 1,
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!busy) { const b = e.currentTarget; b.style.background = '#033BB0'; b.style.color = 'white' } }}
                  onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = 'white'; b.style.color = '#033BB0' }}
                >
                  {busy ? 'Redirecting…' : `Purchase ${pkg.name}`}
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

export default function EmployerPackagesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Packages &amp; Credits</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your job posting credits</p>
      </div>
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-40 bg-gray-100 rounded-xl" /><div className="h-32 bg-gray-100 rounded-xl" /></div>}>
        <PackagesContent />
      </Suspense>
    </div>
  )
}
