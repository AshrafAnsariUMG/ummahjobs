# UmmahJobs — Project Context

## What This Is
UmmahJobs.com is a halal employment platform connecting Muslim job
seekers with Muslim-friendly employers globally. Full rebuild from
scratch on Laravel 11 + Next.js 15, migrating from legacy WordPress
+ WP Job Board Pro.

## Key Numbers
- 2,069 users migrated (1,949 candidates, 105 employers, 5 admins)
- 3 employers with active paid credits to honour on launch:
  CelebrateMercy (2), Echotalk (1), LaunchGood (3)
- 4 blog posts migrated from WordPress XML
- 26 job categories seeded

## Auth Strategy (Option B dual auth)
- UmmahPass SSO as primary (ummahpass.io)
- Email/password as secondary
- Legacy users: legacy_password=true flag, forced reset on first login
- New UmmahPass client ID required on ummahpass.io (separate from ISWP ID 13, MAN ID 19)

## Packages
Basic $8.40 — 1 regular post, 40 days
Standard $38.50 — 1 featured post, 40 days
Extended $70.00 — 3 featured posts, 60 days + Flodesk newsletter

## AI Features (Phase 5)
- Job match score: Claude Sonnet API, cached in job_match_cache table
- CV reviewer: candidate uploads CV, gets structured AI feedback
- JD writer: employer inputs role details, Claude writes full JD

## Session Map
S1: Scaffold (current) → S2: DB migrations → S3: Auth →
S4: Data migration → S5: Jobs API → S6: Public frontend →
S7: Blog + static pages → S8: Stripe + packages →
S9: Employer dashboard → S10: Candidate API →
S11: Candidate frontend + alerts → S12: AI match + CV →
S13: JD writer + analytics → S14: Messaging →
S15: Admin users/jobs/employers → S16: Admin blog/packages/audit →
S17: Flodesk + reviews + badges → S18: Go-live
