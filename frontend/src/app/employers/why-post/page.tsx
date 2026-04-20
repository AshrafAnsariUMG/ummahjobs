import AnimatedSection from '@/components/ui/AnimatedSection'
import EmployerFAQ from '@/components/employers/EmployerFAQ'
import type { Package } from '@/types'

export const metadata = {
  title: 'Post a Job | UmmahJobs',
  description: 'Reach thousands of qualified Muslim professionals. Post your halal job listing on UmmahJobs today.',
}

async function getPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.packages ?? [])
  } catch {
    return []
  }
}

type Tier = 'basic' | 'standard' | 'extended'

function getPkgTier(name: string): Tier | null {
  const n = name.toLowerCase()
  if (n.includes('extended')) return 'extended'
  if (n.includes('standard')) return 'standard'
  if (n.includes('basic')) return 'basic'
  return null
}

const TAGLINES: Record<Tier, string> = {
  basic: 'Perfect for trying us out',
  standard: 'Most popular choice',
  extended: 'Best value for growing teams',
}

const FEATURE_ROWS: { label: string; tiers: Tier[]; note?: Partial<Record<Tier, string>> }[] = [
  { label: 'Job post credits', tiers: ['basic', 'standard', 'extended'], note: { basic: '1 post', standard: '1 post', extended: '3 posts' } },
  { label: 'Listing duration', tiers: ['basic', 'standard', 'extended'], note: { basic: '40 days', standard: '40 days', extended: '60 days' } },
  { label: 'Featured listing (carousel + top of search)', tiers: ['standard', 'extended'] },
  { label: 'AI job description generator', tiers: ['basic', 'standard', 'extended'] },
  { label: 'Candidate match scoring', tiers: ['basic', 'standard', 'extended'] },
  { label: 'Company profile + Halal Verified badge', tiers: ['basic', 'standard', 'extended'] },
  { label: 'Newsletter inclusion', tiers: ['extended'] },
  { label: 'Priority support', tiers: ['extended'] },
]

const STEPS = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up as an employer in under 2 minutes. Set up your company profile and get your Halal Verified badge.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth="1.5" width="32" height="32"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
  },
  {
    step: '02',
    title: 'Post Your Job',
    desc: 'Fill in your job details or use our AI description generator. Your listing goes live immediately after posting.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth="1.5" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  },
  {
    step: '03',
    title: 'Review & Hire',
    desc: 'Browse applicants, review CVs, message candidates directly, and move them through your hiring pipeline.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth="1.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  },
]

const FEATURES = [
  {
    title: 'AI Job Description Writer',
    desc: 'Generate professional job descriptions in seconds using our built-in AI writer.',
    color: '#EFF6FF',
    iconColor: '#033BB0',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>`,
  },
  {
    title: 'AI Match Scoring',
    desc: 'Our engine scores each candidate against your job requirements automatically.',
    color: '#F0FFF4',
    iconColor: '#0FBB0F',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  },
  {
    title: 'Halal Verified Badge',
    desc: 'Get verified as a Muslim-friendly employer and stand out to candidates.',
    color: '#FFF7ED',
    iconColor: '#D97706',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    title: 'Built-in Messaging',
    desc: 'Message candidates directly within the platform. No need for external tools.',
    color: '#FDF4FF',
    iconColor: '#7C3AED',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
  {
    title: 'Applicant Pipeline',
    desc: 'Track every applicant from Applied to Offer with a clear visual pipeline.',
    color: '#EFF6FF',
    iconColor: '#033BB0',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  },
  {
    title: 'Analytics Dashboard',
    desc: 'See views, applications, and conversion rates for each of your listings.',
    color: '#F0FFF4',
    iconColor: '#0FBB0F',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  },
]

const TRUST_ITEMS = [
  '100+ Employers trust UmmahJobs',
  '2,000+ Active Candidates',
  'Starting from $8',
]

export default async function WhyPostPage() {
  const packages = await getPackages()

  return (
    <div>

      {/* ── Section 1: Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #022a8a 0%, #033BB0 60%, #0244b8 100%)',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-60px', top: '-60px', opacity: 0.06 }}>
          <svg viewBox="0 0 300 300" width={300} height={300} fill="white">
            <path d="M150 20A130 130 0 1 0 280 150 100 100 0 1 1 150 20z" />
          </svg>
        </div>

        <AnimatedSection animation="fade-up">
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(15,187,15,0.2)',
              border: '1px solid rgba(15,187,15,0.4)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0FBB0F',
              marginBottom: '24px',
              letterSpacing: '0.5px',
            }}>
              FOR EMPLOYERS
            </div>

            <h1 style={{
              color: 'white',
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: '0 0 20px',
            }}>
              Hire Qualified Muslim Talent
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '18px',
              lineHeight: 1.7,
              margin: '0 0 36px',
              maxWidth: '580px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Connect with 2,000+ Muslim professionals actively seeking halal employment.
              Post your job today and find the right fit for your team.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register?role=employer" style={{
                padding: '16px 36px',
                background: '#0FBB0F',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
              }}>
                Get Started Free
              </a>
              <a href="#pricing" style={{
                padding: '16px 36px',
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.35)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
              }}>
                View Pricing
              </a>
            </div>

            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '40px', flexWrap: 'wrap' }}>
              {TRUST_ITEMS.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                  <svg viewBox="0 0 20 20" fill="#0FBB0F" width={16} height={16}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Section 2: How it works ── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AnimatedSection animation="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
                Hire in 3 Simple Steps
              </h2>
              <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
                From signup to your first hire — the process is simple, fast and halal.
              </p>
            </div>
          </AnimatedSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            {STEPS.map((item, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 150}>
                <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '32px', position: 'relative', border: '1px solid #E5E7EB' }}>
                  <div style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '48px', fontWeight: 800, color: '#033BB0', opacity: 0.07, lineHeight: 1 }}>
                    {item.step}
                  </div>
                  <div style={{ width: '56px', height: '56px', background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}
                    dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Platform Features ── */}
      <section style={{ padding: '80px 24px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <AnimatedSection animation="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
                Everything You Need to Hire
              </h2>
              <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
                Built specifically for Muslim employers and halal-conscious hiring.
              </p>
            </div>
          </AnimatedSection>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
            {FEATURES.map((feature, i) => (
              <div key={i} style={{ width: 'calc(25% - 24px)', minWidth: '220px', maxWidth: '280px' }}>
                <AnimatedSection animation="fade-up" delay={i * 100}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #E5E7EB', height: '100%' }}>
                    <div style={{ width: '48px', height: '48px', background: feature.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: feature.iconColor }}
                      dangerouslySetInnerHTML={{ __html: feature.icon }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{feature.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
                  </div>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Pricing ── */}
      {packages.length > 0 && (
        <section id="pricing" style={{ padding: '80px 24px', background: 'white' }}>
          <style>{`
            .pkg-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
            .pkg-card:hover { transform: translateY(-4px); }
            .pkg-card-standard { transform: scale(1.03); box-shadow: 0 20px 60px rgba(3,59,176,0.15); }
            .pkg-card-standard:hover { transform: scale(1.03) translateY(-4px); }
            .pkg-btn { background: white; color: #033BB0; transition: background 0.2s, color 0.2s; }
            .pkg-btn:hover { background: #033BB0; color: white; }
          `}</style>
          <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

            <AnimatedSection animation="fade-up">
              <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
                  Simple, Transparent Pricing
                </h2>
                <p style={{ color: '#6B7280', fontSize: '16px', margin: 0 }}>
                  One-time payment. No subscriptions. No hidden fees.
                </p>
              </div>
            </AnimatedSection>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
              {packages.map((pkg, i) => {
                const tier = getPkgTier(pkg.name ?? '')
                const isStandard = tier === 'standard'
                const isExtended = tier === 'extended'
                const isBasic = tier === 'basic'

                return (
                  <AnimatedSection key={pkg.id} animation="fade-up" delay={i * 150}>
                    <div
                      className={`pkg-card${isStandard ? ' pkg-card-standard' : ''}`}
                      style={{
                        borderRadius: '20px',
                        padding: '36px',
                        position: 'relative',
                        background: isExtended ? '#F9FAFB' : 'white',
                        border: isStandard ? '2px solid #033BB0' : '1px solid #E5E7EB',
                      }}
                    >
                      {/* Badge */}
                      {isStandard && (
                        <div style={{
                          position: 'absolute', top: '-14px', left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#033BB0', color: 'white',
                          fontSize: '12px', fontWeight: 700,
                          padding: '4px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
                        }}>
                          Most Popular
                        </div>
                      )}
                      {isExtended && (
                        <div style={{
                          position: 'absolute', top: '-14px', left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#0FBB0F', color: 'white',
                          fontSize: '12px', fontWeight: 700,
                          padding: '4px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
                        }}>
                          Best Value
                        </div>
                      )}

                      {/* Header */}
                      <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                        {pkg.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px', minHeight: '20px' }}>
                        {tier ? TAGLINES[tier] : ''}
                      </p>

                      {/* Price */}
                      <div style={{ lineHeight: 1 }}>
                        <span style={{ fontSize: '48px', fontWeight: 800, color: '#033BB0' }}>
                          ${parseFloat(String(pkg.price)).toFixed(0)}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 24px' }}>one-time payment</p>

                      {/* Core info highlight */}
                      <div style={{
                        background: isStandard ? '#EFF6FF' : '#F9FAFB',
                        borderRadius: '10px', padding: '14px 16px', marginBottom: '24px',
                        display: 'flex', gap: '12px',
                      }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: '#033BB0', lineHeight: 1 }}>
                            {pkg.post_count}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>
                            Post{pkg.post_count !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div style={{ width: '1px', background: '#E5E7EB' }} />
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: '#033BB0', lineHeight: 1 }}>
                            {pkg.duration_days}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>Days</div>
                        </div>
                        <div style={{ width: '1px', background: '#E5E7EB' }} />
                        <div style={{ flex: 2, textAlign: 'center' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', lineHeight: 1.2 }}>
                            {pkg.post_type === 'featured' ? 'Featured' : 'Standard'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>Listing type</div>
                        </div>
                      </div>

                      {/* Feature list */}
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                        {FEATURE_ROWS.map((row, fi) => {
                          const included = tier ? row.tiers.includes(tier) : false
                          const note = tier ? row.note?.[tier] : undefined
                          return (
                            <li key={fi} style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '7px 0', fontSize: '14px',
                              color: included ? '#374151' : '#9CA3AF',
                              borderBottom: fi < FEATURE_ROWS.length - 1 ? '1px solid #F3F4F6' : undefined,
                            }}>
                              {included ? (
                                <svg viewBox="0 0 20 20" fill="#0FBB0F" width={16} height={16} style={{ flexShrink: 0 }}>
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 20 20" fill="#D1D5DB" width={16} height={16} style={{ flexShrink: 0 }}>
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span style={{ flex: 1 }}>{row.label}</span>
                              {included && note && (
                                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>{note}</span>
                              )}
                            </li>
                          )
                        })}
                      </ul>

                      {/* Social proof / save note */}
                      {isStandard && (
                        <p style={{ fontSize: '13px', color: '#0FBB0F', fontWeight: 600, textAlign: 'center', margin: '0 0 16px' }}>
                          Chosen by 70% of our employers
                        </p>
                      )}
                      {isExtended && (
                        <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', margin: '0 0 16px' }}>
                          Save compared to buying Basic × 3
                        </p>
                      )}
                      {isBasic && (
                        <p style={{ fontSize: '13px', color: 'transparent', margin: '0 0 16px' }}>
                          &nbsp;
                        </p>
                      )}

                      {/* CTA */}
                      <a
                        href="/register?role=employer"
                        className="pkg-btn"
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '14px',
                          border: '2px solid #033BB0',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '15px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        Get Started
                      </a>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>

            <AnimatedSection animation="fade-up" delay={300}>
              <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', marginTop: '32px' }}>
                All prices in USD. Need a custom plan?{' '}
                <a href="/contact" style={{ color: '#033BB0' }}>Contact us</a>
              </p>
            </AnimatedSection>

          </div>
        </section>
      )}

      {/* ── Section 5: FAQ ── */}
      <EmployerFAQ />

      {/* ── Section 6: Final CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #022a8a 0%, #033BB0 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <AnimatedSection animation="fade-up">
          <h2 style={{ color: 'white', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, margin: '0 0 16px' }}>
            Ready to Find Your Next Hire?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '17px', maxWidth: '460px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join 100+ employers already using UmmahJobs to build their teams with halal-conscious talent.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register?role=employer" style={{
              padding: '16px 40px',
              background: '#0FBB0F',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
            }}>
              Post a Job
            </a>
            <a href="/contact" style={{
              padding: '16px 40px',
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.35)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '16px',
              textDecoration: 'none',
            }}>
              Talk to Us
            </a>
          </div>
        </AnimatedSection>
      </section>

    </div>
  )
}
