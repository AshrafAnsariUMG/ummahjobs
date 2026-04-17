'use client'

import { useState } from 'react'
import Link from 'next/link'
import FloatingOrbs from '@/components/ui/FloatingOrbs'
import FloatingCrescent from '@/components/ui/FloatingCrescent'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    // Will be wired to real endpoint in S17
    await new Promise((r) => setTimeout(r, 600))
    setSending(false)
    setSubmitted(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <FloatingOrbs variant="minimal" />
      <FloatingCrescent position="top-right" size={220} opacity={0.04} />
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Contact</span>
      </nav>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Contact Us</h1>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h2>
              <p className="text-sm text-gray-500">
                Thank you for reaching out. We&apos;ll get back to you within 1–2 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="subject">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Your message…"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: '#033BB0' }}
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Contact details */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-7">
            <h2 className="font-bold text-gray-900 mb-5">Get in Touch</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E6EDFF' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                  <address className="not-italic text-sm text-gray-700 leading-relaxed">
                    Ummah Media Group LLC<br />
                    515 Madison Ave Suite 9111<br />
                    Manhattan, New York 10022<br />
                    United States
                  </address>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E6EDFF' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                  <a href="tel:+18668870844" className="text-sm hover:underline" style={{ color: '#033BB0' }}>
                    +1 866-887-0844
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E6EDFF' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                  <a href="mailto:mail@ummahjobs.com" className="text-sm hover:underline" style={{ color: '#033BB0' }}>
                    mail@ummahjobs.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E6EDFF' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#033BB0" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Office Hours</p>
                  <p className="text-sm text-gray-700">Monday–Friday, 9am–5pm EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
