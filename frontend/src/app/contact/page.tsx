import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | UmmahJobs',
  description: 'Get in touch with the UmmahJobs team. We\'re here to help candidates and employers with any questions about halal jobs and hiring.',
  openGraph: {
    title: 'Contact Us | UmmahJobs',
    description: 'Get in touch with the UmmahJobs team. We\'re here to help.',
    url: 'https://ummahjobs.com/contact',
    siteName: 'UmmahJobs',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us | UmmahJobs',
    description: 'Get in touch with the UmmahJobs team.',
  },
  alternates: {
    canonical: 'https://ummahjobs.com/contact',
  },
}

export default function ContactPage() {
  return <ContactForm />
}
