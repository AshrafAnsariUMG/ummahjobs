import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { ToastProvider } from '@/components/ui/Toast'
import EpomRouteWatcher from '@/components/ads/EpomRouteWatcher'

const API = process.env.NEXT_PUBLIC_API_URL

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const SITE = 'https://ummahjobs.com'
const DEFAULT_TITLE = 'UmmahJobs — Halal Jobs for Muslim Professionals'
const DEFAULT_DESC = 'Find halal jobs and connect with Muslim-friendly employers. Browse thousands of halal career opportunities worldwide on UmmahJobs.com'
const DEFAULT_OG_IMAGE = `${SITE}/images/logo.png`
const KEYWORDS = 'halal jobs, Muslim jobs, Islamic careers, halal employment, Muslim professionals, Islamic finance jobs, halal work, Muslim-friendly employers, ummah jobs'

export async function generateMetadata(): Promise<Metadata> {
  let title = DEFAULT_TITLE
  let description = DEFAULT_DESC
  let ogImage = DEFAULT_OG_IMAGE

  try {
    const res = await fetch(`${API}/api/settings`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const settings: Record<string, string> = await res.json()
      if (settings.seo_title) title = settings.seo_title
      if (settings.seo_description) description = settings.seo_description
      if (settings.seo_og_image) ogImage = settings.seo_og_image
    }
  } catch { /* use defaults */ }

  return {
    title,
    description,
    keywords: KEYWORDS,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: SITE,
      siteName: 'UmmahJobs',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'UmmahJobs' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    icons: {
      icon: '/favicon.jpg',
      shortcut: '/favicon.jpg',
      apple: '/favicon.jpg',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Muslim Ad Network — loaded once globally so EPOM can find all <ins> slots */}
        <script async src="https://cdn77.aj2742.top/dcfc6ab7.js" />
        <script dangerouslySetInnerHTML={{ __html: `
  var _paq = window._paq = window._paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//analytics.ummahmediagroup.com/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '3']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
` }} />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <EpomRouteWatcher />
            <ConditionalLayout>{children}</ConditionalLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
