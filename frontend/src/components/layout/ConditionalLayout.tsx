'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

const NO_CHROME_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/candidate',
  '/employer',
  '/admin',
]

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideChrome = NO_CHROME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (hideChrome) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
