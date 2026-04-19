'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { CreditBalance, Package, StripeOrderItem } from '@/types'

function PackagesContent() {
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [history, setHistory] = useState<StripeOrderItem[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<number | null>(null)
  const [successBanner, setSuccessBanner] = useState(false)

  const fetchBalance = () =>
    api.get('/api/employer/packages/balance').then(setBalance).catch(() => {})

  useEffect(() => {
    const hasSuccess = searchParams.get('success') === '1'
    const hasCancelled = searchParams.get('cancelled') === '1'
    if (hasSuccess) {
      setSuccessBanner(true)
      setTimeout(() => {
        fetchBalance()
        setSuccessBanner(false)
      }, 3500)
    }
    if (hasCancelled) {
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

  function isRecommended(pkg: Package) {
    const max = Math.max(...packages.map((p) => Number(p.price)))
    return pkg.name.toLowerCase().includes('extended') || Number(pkg.price) === max
  }

  return (
    <>
      {/* Success banner */}
      {successBanner && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Payment successful!</p>
            <p className="text-sm text-green-700">Your credits have been added. It may take a moment to appear.</p>
          </div>
        </div>
      )}

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
        <div className="grid sm:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const rec = isRecommended(pkg)
            const busy = checkingOut === pkg.id
            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl border-2 p-6 relative ${rec ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
              >
                {rec && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#033BB0' }}
                  >
                    Recommended
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-1">{pkg.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-extrabold text-gray-900">${Number(pkg.price).toFixed(0)}</span>
                  <span className="text-gray-400 text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 mb-5 text-sm text-gray-700">
                  <li>✓ {pkg.post_count} job post{pkg.post_count !== 1 ? 's' : ''}</li>
                  <li>✓ Active for {pkg.duration_days} days</li>
                  {pkg.includes_newsletter && <li>✓ Newsletter inclusion</li>}
                </ul>
                <button
                  onClick={() => handleCheckout(pkg.id)}
                  disabled={busy}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 ${
                    rec ? 'text-white' : 'border-2'
                  }`}
                  style={rec ? { backgroundColor: '#033BB0' } : { color: '#033BB0', borderColor: '#033BB0' }}
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
