import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'UmmahJobs — Halal Jobs for Muslim Professionals',
  description: 'Find halal jobs and connect with Muslim-friendly employers. Browse thousands of opportunities on UmmahJobs.com',
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
      </body>
    </html>
  )
}
