'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'How does a job post credit work?',
    a: "Each credit lets you publish one job listing. Once published, it stays active for the duration of your package (40 or 60 days). Credits don't expire — use them whenever you're ready.",
  },
  {
    q: 'Can I edit my job listing after posting?',
    a: 'Yes, you can edit your listing anytime from your employer dashboard. Changes go live immediately.',
  },
  {
    q: 'What is a Featured listing?',
    a: 'Featured listings appear at the top of search results and in the Featured Jobs carousel on the homepage. They get significantly more visibility than standard listings.',
  },
  {
    q: 'Can I message candidates directly?',
    a: 'Yes. All plans include built-in messaging so you can contact any candidate who applies to your job directly within the platform.',
  },
  {
    q: 'Do credits expire?',
    a: "No. Your job post credits never expire. Purchase now and use them whenever you're ready to hire.",
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards via Stripe. All payments are processed securely.',
  },
  {
    q: 'Can I get a refund?',
    a: "If you haven't used your credits yet, contact us within 7 days of purchase for a full refund.",
  },
  {
    q: 'Is there a free trial?',
    a: 'Candidates can always register for free. For employers, our Basic package at $8 is a low-risk way to try the platform.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid #E5E7EB' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '16px',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827', flex: 1, lineHeight: 1.4 }}>
          {q}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B7280"
          strokeWidth={2}
          width={20}
          height={20}
          style={{
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? '400px' : '0',
          transition: 'max-height 0.3s ease',
        }}
      >
        <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, paddingBottom: '20px', margin: 0 }}>
          {a}
        </p>
      </div>
    </div>
  )
}

export default function EmployerFAQ() {
  return (
    <section style={{ padding: '80px 24px', background: '#F9FAFB' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 12px',
          }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
            Everything you need to know about posting jobs on UmmahJobs
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '0 32px' }}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
