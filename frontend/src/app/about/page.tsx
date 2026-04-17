import Link from 'next/link'
import FloatingCrescent from '@/components/ui/FloatingCrescent'

export const metadata = {
  title: 'About Us | UmmahJobs',
  description: 'UmmahJobs is a halal employment platform connecting Muslim job seekers with employers who respect their values and faith.',
}

export default function AboutPage() {
  return (
    <div style={{ position: 'relative' }}>
      <FloatingCrescent position="bottom-right" size={200} opacity={0.03} />

      {/* ── Section 1: Hero Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, #022E8A 0%, #033BB0 50%, #0256CC 100%)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(15,187,15,0.15)',
          border: '1px solid rgba(15,187,15,0.3)',
          borderRadius: '20px',
          padding: '4px 16px',
          color: '#86efac',
          fontSize: '13px',
          marginBottom: '20px',
          fontWeight: 500,
        }}>
          Serving the Muslim Community
        </div>

        <h1 style={{
          color: 'white',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          marginBottom: '16px',
          lineHeight: 1.15,
        }}>
          About UmmahJobs
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '18px',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          We believe every Muslim deserves the opportunity to earn halal rizq
          in a workplace that respects their values and faith.
        </p>
      </section>

      {/* ── Section 2: Mission Statement ── */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="flex flex-col md:flex-row items-start gap-12">

            {/* Left — text */}
            <div style={{ flex: 1 }}>
              {/* Decorative quote mark */}
              <div style={{
                color: '#E6EDFF',
                fontSize: '120px',
                lineHeight: 0.8,
                fontFamily: 'Georgia, serif',
                marginBottom: '16px',
                userSelect: 'none',
              }}>
                &ldquo;
              </div>

              <p style={{
                color: '#033BB0',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                Our Mission
              </p>

              <p style={{
                fontSize: '20px',
                color: '#1F2937',
                lineHeight: 1.8,
                fontWeight: 400,
              }}>
                UmmahJobs.com is a halal employment platform dedicated to connecting
                Muslim job seekers with employers who offer Muslim-friendly, ethical
                work environments.
              </p>

              <p style={{
                fontSize: '16px',
                color: '#6B7280',
                lineHeight: 1.8,
                marginTop: '16px',
              }}>
                We believe work is worship — and every Muslim deserves the opportunity
                to earn halal rizq in a workplace that honours their prayers, their
                values, and their identity.
              </p>
            </div>

            {/* Right — illustration card */}
            <div style={{ flexShrink: 0, width: '100%', maxWidth: '380px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #EFF6FF, #F0FFF0)',
                borderRadius: '20px',
                padding: '40px',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}>
                {/* Crescent moon SVG */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#033BB0"
                  strokeWidth={1.5}
                  width={60}
                  height={60}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <p style={{
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>
                  Purposeful Work
                </p>
                <p style={{ color: '#6B7280', fontSize: '13px', textAlign: 'center', lineHeight: 1.6 }}>
                  Connecting Muslims with careers<br />that honour their deen
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 3: Values / What We Believe ── */}
      <section style={{ background: '#F8F9FA', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px',
            }}>
              What We Believe
            </h2>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>
              The principles that guide everything we build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — Halal First */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px 28px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #F3F4F6',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth={2} width={24} height={24}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '16px 0 8px' }}>
                Halal First
              </h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7 }}>
                Every feature we build, every decision we make — we ask: does this serve
                the Muslim community with integrity? Halal earning is not just a checkbox
                for us. It&apos;s the foundation.
              </p>
            </div>

            {/* Card 2 — Community Over Commerce */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px 28px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #F3F4F6',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#F0FFF0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0FBB0F" strokeWidth={2} width={24} height={24}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '16px 0 8px' }}>
                Community Over Commerce
              </h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7 }}>
                We are part of the Ummah too. We built this platform because we felt
                the gap ourselves — finding work that doesn&apos;t compromise your deen
                shouldn&apos;t be this hard.
              </p>
            </div>

            {/* Card 3 — For the Whole Ummah */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px 28px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #F3F4F6',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FFF7ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2} width={24} height={24}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '16px 0 8px' }}>
                For the Whole Ummah
              </h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7 }}>
                From imams to engineers, nurses to NGO workers — UmmahJobs serves every
                Muslim professional, in every field, in every corner of the world.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 4: Stats Strip ── */}
      <section style={{
        background: 'linear-gradient(135deg, #033BB0, #0256CC)',
        padding: '48px 24px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { number: '2,000+', label: 'Muslim Professionals' },
              { number: '100+',   label: 'Employers' },
              { number: '26',     label: 'Job Categories' },
              { number: 'Free',   label: 'to Join' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  textAlign: 'center',
                  padding: '16px 24px',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : undefined,
                }}
                className={i > 0 ? 'hidden md:block md:border-l' : ''}
              >
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: 2×2 grid without inner borders */}
          <div className="grid grid-cols-2 md:hidden gap-6 mt-0">
            {[
              { number: '2,000+', label: 'Muslim Professionals' },
              { number: '100+',   label: 'Employers' },
              { number: '26',     label: 'Job Categories' },
              { number: 'Free',   label: 'to Join' },
            ].map((stat) => (
              <div key={`m-${stat.label}`} style={{ textAlign: 'center', padding: '8px' }}>
                <div style={{ fontSize: '30px', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Our Story ── */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="flex flex-col md:flex-row items-start gap-12">

            {/* Left — timeline */}
            <div style={{ flexShrink: 0, width: '100%', maxWidth: '340px' }}>
              <div style={{
                background: '#F8F9FA',
                borderRadius: '16px',
                padding: '32px',
              }}>
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#9CA3AF',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '24px',
                }}>
                  Timeline
                </h3>

                <div style={{ position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute',
                    left: '4px',
                    top: '10px',
                    bottom: '10px',
                    width: '2px',
                    background: '#E5E7EB',
                  }} />

                  {[
                    { year: '2019', text: 'UmmahJobs.com first launched, connecting Muslim professionals with halal opportunities.', past: true },
                    { year: '2022', text: 'Grew to 2,000+ registered candidates across the globe.', past: true },
                    { year: '2025', text: 'Platform rebuilt from the ground up on modern infrastructure.', past: true },
                    { year: '2026', text: 'New features: AI job matching, private messaging, and employer tools — launched.', past: false },
                  ].map((item) => (
                    <div key={item.year} style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative' }}>
                      {/* Dot */}
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: item.past ? '#0FBB0F' : '#033BB0',
                        flexShrink: 0,
                        marginTop: '4px',
                        position: 'relative',
                        zIndex: 1,
                        boxShadow: !item.past ? '0 0 0 4px rgba(3,59,176,0.15)' : undefined,
                      }}
                      className={!item.past ? 'animate-pulse' : undefined}
                      />
                      <div>
                        <span style={{ fontWeight: 700, color: '#033BB0', fontSize: '14px' }}>
                          {item.year}
                        </span>
                        <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginTop: '2px' }}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — story text */}
            <div style={{ flex: 1 }}>
              <p style={{
                color: '#0FBB0F',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Our Story
              </p>

              <h2 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '16px',
                lineHeight: 1.3,
              }}>
                Built by Muslims,<br />For Muslims
              </h2>

              <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>
                UmmahJobs started as a simple idea: what if there was a job board that truly
                understood the needs of Muslim professionals? A place where you could filter for
                Muslim-friendly environments, find roles at Islamic organisations, and connect with
                employers who respect your faith.
              </p>

              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.8 }}>
                What began as a small community project has grown into a platform serving thousands
                of Muslims worldwide — from fresh graduates looking for their first halal role, to
                seasoned professionals seeking meaningful career moves.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 6: Ummah Media Group ── */}
      <section style={{ background: '#F8F9FA', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Operated by
          </p>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '12px',
          }}>
            Ummah Media Group LLC
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#6B7280',
            lineHeight: 1.7,
            marginBottom: '24px',
          }}>
            A New York-based company dedicated to building digital platforms that serve
            the global Muslim community.
          </p>

          <address style={{
            fontStyle: 'normal',
            fontSize: '14px',
            color: '#9CA3AF',
            lineHeight: 1.8,
          }}>
            515 Madison Ave Suite 9111<br />
            Manhattan, New York 10022<br />
            United States
          </address>

          <div style={{ marginTop: '24px' }}>
            <a
              href="https://ummahmediagroup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:bg-blue-50 hover:border-blue-300"
              style={{
                color: '#033BB0',
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                border: '1px solid #C7D2FE',
                borderRadius: '8px',
                padding: '10px 20px',
                background: 'white',
              }}
            >
              Visit UmmahMediaGroup.com
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 7: Contact + CTA ── */}
      <section style={{ background: 'white', padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="flex flex-col md:flex-row gap-10 items-start">

            {/* Left — Contact info */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '20px',
              }}>
                Get in Touch
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth={2} width={18} height={18}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '1px' }}>Email</p>
                    <a
                      href="mailto:mail@ummahjobs.com"
                      style={{ fontSize: '15px', color: '#111827', textDecoration: 'none', fontWeight: 500 }}
                      className="hover:underline"
                    >
                      mail@ummahjobs.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth={2} width={18} height={18}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '1px' }}>Phone</p>
                    <a
                      href="tel:+18668870844"
                      style={{ fontSize: '15px', color: '#111827', textDecoration: 'none', fontWeight: 500 }}
                      className="hover:underline"
                    >
                      +1 866-887-0844
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#033BB0" strokeWidth={2} width={18} height={18}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '1px' }}>Location</p>
                    <p style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>
                      Manhattan, New York
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — CTA card */}
            <div style={{
              flexShrink: 0,
              width: '100%',
              maxWidth: '360px',
              background: 'linear-gradient(135deg, #033BB0, #0256CC)',
              borderRadius: '16px',
              padding: '32px',
              color: 'white',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '8px',
                lineHeight: 1.3,
              }}>
                Ready to find your<br />halal career?
              </h3>

              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}>
                Join thousands of Muslim professionals on UmmahJobs today.
                It&apos;s free to register.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/jobs"
                  className="block text-center text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
                  style={{
                    padding: '12px 24px',
                    background: 'white',
                    color: '#033BB0',
                    textDecoration: 'none',
                  }}
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/register"
                  className="block text-center text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
                  style={{
                    padding: '12px 24px',
                    background: '#0FBB0F',
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Register Free
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
