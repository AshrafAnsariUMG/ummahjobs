'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/packages', label: 'Packages' },
  { href: '/blog', label: 'Blog' },
]

const aboutLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
]

function ActiveLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className="text-sm font-medium transition-colors pb-0.5"
      style={{
        color: isActive ? '#033BB0' : '#374151',
        borderBottom: isActive ? '2px solid #033BB0' : '2px solid transparent',
      }}
    >
      {label}
    </Link>
  )
}

function AboutDropdown() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = pathname.startsWith('/about') || pathname.startsWith('/contact')

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
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium transition-colors pb-0.5"
        style={{
          color: isActive ? '#033BB0' : '#374151',
          borderBottom: isActive ? '2px solid #033BB0' : '2px solid transparent',
        }}
      >
        About
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {aboutLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AvatarDropdown() {
  const { user, role, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user?.display_name
    ?.split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() ?? '?'

  const dashboardLinks =
    role === 'candidate'
      ? [
          { href: '/candidate/dashboard', label: 'Dashboard' },
          { href: '/candidate/profile/edit', label: 'Edit Profile' },
        ]
      : role === 'employer'
      ? [
          { href: '/employer/dashboard', label: 'Dashboard' },
          { href: '/employer/profile/edit', label: 'Edit Profile' },
        ]
      : [{ href: '/admin', label: 'Admin Panel' }]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full focus:outline-none"
        aria-label="Account menu"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: '#033BB0' }}
        >
          {initials}
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.display_name}</p>
            <span
              className="inline-block text-xs px-2 py-0.5 rounded-full text-white mt-1"
              style={{ backgroundColor: '#033BB0' }}
            >
              {role}
            </span>
          </div>
          {dashboardLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 mt-1">
            <button
              onClick={() => { setOpen(false); logout() }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated, isLoading, role } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-xl font-bold" style={{ color: '#033BB0' }}>Ummah</span>
            <span className="text-xl font-bold text-gray-500">Jobs</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <ActiveLink key={link.href} {...link} />
            ))}
            <AboutDropdown />
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoading && !isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
                  style={{ color: '#033BB0', borderColor: '#033BB0' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#033BB0' }}
                >
                  Post a Job
                </Link>
              </>
            )}

            {!isLoading && isAuthenticated && (
              <>
                {role === 'employer' && (
                  <Link
                    href="/employer/post-job"
                    className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#033BB0' }}
                  >
                    Post a Job
                  </Link>
                )}
                <AvatarDropdown />
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
          {aboutLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {!isLoading && !isAuthenticated && (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium px-4 py-2.5 rounded-lg border text-center"
                  style={{ color: '#033BB0', borderColor: '#033BB0' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium px-4 py-2.5 rounded-lg text-white text-center"
                  style={{ backgroundColor: '#033BB0' }}
                >
                  Post a Job
                </Link>
              </>
            )}
            {!isLoading && isAuthenticated && (
              <Link
                href={role === 'employer' ? '/employer/dashboard' : role === 'admin' ? '/admin' : '/candidate/dashboard'}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium px-4 py-2.5 rounded-lg text-center text-white"
                style={{ backgroundColor: '#033BB0' }}
              >
                My Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
