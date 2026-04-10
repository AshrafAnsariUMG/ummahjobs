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
  title: 'UmmahJobs — Halal Employment Platform',
  description: 'Connecting Muslim professionals with halal opportunities.',
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
