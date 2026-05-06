# UmmahJobs — Full Project Context

> **Single source of truth for the ummahjobs.com project.**
> Read this file and CLAUDE.md before any work session.
> Written from direct codebase inspection. Updated: 2026-05-01.

---

## Table of Contents

1. [What This Platform Does](#1-what-this-platform-does)
2. [Stack & Infrastructure](#2-stack--infrastructure)
3. [Environment Variables](#3-environment-variables)
4. [Build Status](#4-build-status)
5. [API Routes](#5-api-routes)
6. [Models & Relationships](#6-models--relationships)
7. [Frontend Pages](#7-frontend-pages)
8. [Frontend Components](#8-frontend-components)
9. [Services](#9-services)
10. [Background Jobs](#10-background-jobs)
11. [Frontend Lib & Auth](#11-frontend-lib--auth)
12. [Pre-Granted Employer Credits](#12-pre-granted-employer-credits)
13. [Brand & Admin Credentials](#13-brand--admin-credentials)
14. [Known Issues & Pending Items](#14-known-issues--pending-items)
15. [Developer Notes & Gotchas](#15-developer-notes--gotchas)

---

## 1. What This Platform Does

UmmahJobs.com is a halal employment platform connecting Muslim job seekers with Muslim-friendly employers globally. Candidates create profiles (skills, CV, photo, languages, experience) and apply to jobs; employers purchase posting packages via Stripe, post jobs with an AI-assisted JD writer, manage applicants through a status funnel, and message candidates directly. Admins manage all users, jobs, employers, candidates, blog posts, packages, site settings, and a feedback/ticketing system. The platform migrated 2,069 users and 12 jobs from a legacy WordPress/WP Job Board Pro installation. DNS cutover to ummahjobs.com is pending (S18).

---

## 2. Stack & Infrastructure

| Layer | Tech | Version | Port | PM2 Process Name |
|-------|------|---------|------|-----------------|
| Backend API | Laravel | 11 (PHP 8.3) | 8003 | `ummahjobs-backend` |
| Frontend | Next.js (App Router, TypeScript) | 15 | 3003 | `ummahjobs-frontend` |
| Queue worker | Laravel queue (Redis) | — | — | `ummahjobs-queue` |
| Database | MySQL 8.0 | — | 3306 | systemd |
| Cache / Queue / Sessions | Redis 7.x | — | 6379 | systemd |
| Web server | Nginx | — | 80/443 | staged, NOT enabled |

**Dev URL:** http://37.27.215.90:3003
**Live URL:** https://ummahjobs.com (DNS not yet pointed)
**Server IP:** 37.27.215.90
**GitHub:** https://github.com/AshrafAnsariUMG/ummahjobs

### PM2 Commands (run as claude-dev with sudo)
```bash
sudo pm2 restart ummahjobs-backend
sudo pm2 restart ummahjobs-frontend
sudo pm2 restart ummahjobs-queue
sudo pm2 logs ummahjobs-backend --lines 50
sudo pm2 logs ummahjobs-frontend --lines 50
sudo pm2 list
sudo pm2 save
```

### Nginx Routing
Config: `/etc/nginx/sites-available/ummahjobs`
Status: **NOT enabled** — activate at go-live (S18)
- `/api/*` and `/storage/*` → `http://127.0.0.1:8003` (Laravel)
- `/*` → `http://127.0.0.1:3003` (Next.js)

### Database
- Name: `ummahjobs_umg`
- User: `ummahjobs`
- Host: `127.0.0.1:3306`
- WP tables: `wp_*` prefix coexist in same DB (wp_import connection, no conflicts)

### Auth Mechanism
Dual auth: email/password (primary, live) + UmmahPass SSO (deferred to post-DNS cutover). UmmahPass button exists on login/register but is disabled. New UmmahPass client ID must be registered on ummahpass.io before enabling. Cloudflare WAF bypass required for `/api/auth/ummahpass/*` at go-live.

Legacy users (migrated from WordPress): `legacy_password=true` flag, forced password reset on first login via GmailMailerService email.

---

## 3. Environment Variables

### Backend (`backend/.env`) — Key Names Only
```
APP_NAME, APP_ENV, APP_KEY, APP_DEBUG, APP_URL
FRONTEND_URL
DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
SESSION_DRIVER, SESSION_LIFETIME
QUEUE_CONNECTION
CACHE_STORE
REDIS_CLIENT, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT
GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_FROM_ADDRESS
GMAIL_REFRESH_TOKEN, GMAIL_FROM_NAME
MAIL_MAILER (legacy — email goes via GmailMailerService directly)
SANCTUM_STATEFUL_DOMAINS, CORS_ALLOWED_ORIGINS
STRIPE_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET
FLODESK_API_KEY, FLODESK_SEGMENT_ID
REVALIDATION_SECRET
```

### Frontend (`frontend/.env.local`) — Key Names Only
```
NEXT_PUBLIC_API_URL
REVALIDATION_SECRET
NEXT_PUBLIC_REVALIDATION_SECRET
```

---

## 4. Build Status

### Completed Sessions (in order)
| Session | What Was Built |
|---------|---------------|
| S1 | Laravel 11 + Next.js 15 scaffold, PM2, Nginx config staged |
| S2 | 20 migrations, 3 seeders (26 categories, 7 job types, 3 packages), 17 Eloquent models |
| S3a | Auth backend — Sanctum, CORS, 7 auth endpoints, password reset, legacy_password flow |
| S3b | Auth frontend — TypeScript types, API client, AuthContext, login, register (2-step), forgot/reset password, dashboard placeholders |
| S4a | WP dump loaded (wp_* tables), 2,061 users migrated (legacy_password=true) |
| S4b | 1,955 candidates + 101 employers migrated from WP data |
| S4c | 11 blog posts imported; 3 employer credits granted (CelebrateMercy×2, Echotalk×1, LaunchGood×3) |
| S5 | Jobs API (index/show/featured/stats), Employer API, Categories, Job Types, Packages — all public |
| S6a | Navbar (sticky, auth-aware, avatar dropdown), Footer, ConditionalLayout, Homepage |
| S6b | /jobs list + filter sidebar, /jobs/[slug] detail, /employers/[slug] profile, Toast system |
| S7 | Blog API + listing/detail pages, packages pricing page, about/contact/terms/privacy pages |
| S8 | Stripe checkout + webhook, EmployerPackageService, employer package routes |
| S9 | Full employer dashboard — layout, overview, post-job 3-step wizard, jobs listing, packages |
| S10 | Candidate profile API, CV/photo upload, saved jobs, applications, alerts |
| S11a | Full candidate dashboard — layout, overview, profile editor, saved-jobs, applications, alerts, messages placeholder |
| S11b | Employer applicants page, analytics page |
| S12 | JobMatchService (6-dimension algorithmic scoring, no Claude API), CVTextExtractor, 24h cache |
| S12b | CV text wired into skills dimension, batch scoring endpoint, dimensions JSON column |
| S12c.1 | role_equivalencies table (30 groups), skills JSON field on candidates, JobMatchService rewritten |
| S12c.2 | SkillsInput component on candidate profile, skills tags, dashboard nudge for empty skills |
| S13 | JDWriterService (template-based, zero cost), generate-description endpoint, employer wizard button |
| S14a | MessageController (5 endpoints), unread count on /auth/me |
| S14b | MessagesPage shared component (thread list + view + compose), candidate + employer messages pages, unread badge (30s poll) |
| S15a | Admin layout, dashboard overview (8 stat cards), users page (CRUD, role change, activate/deactivate) |
| S15b | Admin jobs, employers, candidates pages |
| S16a | Admin blog CRUD — list, new post, edit post |
| S16b | Admin packages (inline edit), audit log page |
| S17 | FlodeskService (subscribe + segment), newsletter controller, FooterNewsletter, alert auto-subscribe |
| UI-1 | Logo in Navbar/Footer, green brand color #0FBB0F, CategoryIcon.tsx (26 SVGs), SVG replacements for emoji |
| UI-2 | Homepage hero redesign (two-column), JobCard hover border, LogoFallback color cycling |
| UI-2-fix | Hero rebuilt as single-column, HeroSearch unified bar |
| UI-Fix1 | Blog image URL helper, BlogFeaturedImage component, /api/revalidate Next.js route, hero heading fix |
| UI-About | About page rebuilt (7 sections: hero/mission/values/stats/story/UMG/CTA) |
| UI-3 | All auth pages rebuilt as split-screen (blue branded left + white form right) |
| S-SiteSettings | site_settings table (22 settings/5 groups), SiteSettingsService (Redis 1h cache), admin settings page, AnnouncementBar, dynamic logo |
| S-WPJobs | 12 WordPress jobs migrated via artisan command (6 active, 6 expired, 19 skipped as external) |
| Admin-Features-A | Admin profile page, Add User modal, Grant Credits modal |
| Admin-Features-B | Package create/delete, admin post job page with employer search autocomplete |
| Admin-Features-C | Admin edit employer/candidate profiles with file uploads |
| S-Mail | GmailMailerService (Gmail OAuth2 API), wired into all 4 email paths |
| S-Mail-HTML | EmailTemplateService (branded HTML emails: wrap/button/heading/paragraph/infoBox/divider) |
| S-ExternalEmployer | External employer support — nullable employer_id on jobs, WP import updated, frontend null-safe |
| Feedback-System | feedback table + FeedbackModal + candidate/employer/admin feedback pages |

### Pending Before Go-Live
- **S18:** DNS cutover — point ummahjobs.com to 37.27.215.90; enable Nginx config (`sites-enabled` symlink); SSL via Certbot; UmmahPass client ID registration; Stripe switch to live keys; Flodesk production keys

### Post-Launch Backlog
- UmmahPass SSO full activation (Cloudflare WAF bypass + new client ID on ummahpass.io)
- CV reviewer feature (candidate uploads CV, gets structured AI feedback)
- Job alert emails (AlertController exists, send logic not yet implemented)
- Employer reviews admin moderation (ReviewController exists but not linked to admin reviews page review flow)

---

## 5. API Routes

All routes prefixed `/api/`. Backend base: `http://37.27.215.90:8003`

### Public Auth (no middleware)
```
POST   /auth/register              register new user (candidate or employer)
POST   /auth/login                 email/password login
POST   /auth/forgot-password       send password reset email
POST   /auth/reset-password        consume token + set new password
```

### Authenticated Auth (auth:sanctum)
```
GET    /auth/me                    current user + unread_messages count
POST   /auth/logout                revoke token
PUT    /auth/password              change password
```

### Public Jobs
```
GET    /jobs                       paginated job list (?keyword, category_id, job_type, location, experience_level, page)
GET    /jobs/featured              featured jobs list
GET    /jobs/stats                 site stats (jobs, employers, candidates)
GET    /jobs/{slug}                job detail (increments views_count)
```

### Public Employers
```
GET    /employers/{slug}           employer profile
GET    /employers/{slug}/reviews   employer reviews
```

### Public Utility
```
GET    /categories                 all 26 job categories
GET    /job-types                  all 7 job types
GET    /packages                   all active packages
GET    /blog                       blog post listing
GET    /blog/{slug}                blog post detail
GET    /settings                   public site settings (no auth)
POST   /newsletter/subscribe       subscribe to newsletter (throttle:3,1)
POST   /contact                    contact form (throttle:3,60)
POST   /webhooks/stripe            Stripe webhook (no auth, CSRF excluded)
```

### Authenticated Any Role (auth:sanctum)
```
POST   /employers/{slug}/reviews   submit employer review
POST   /jobs/batch-match-scores    batch AI match scores (max 20 slugs)
GET    /jobs/{slug}/match-score    single job match score (24h cache)
GET    /feedback                   own feedback submissions
POST   /feedback                   submit feedback (bug/feature/general)
GET    /messages                   inbox (thread list)
GET    /messages/unread-count      unread message count
POST   /messages                   send message
GET    /messages/thread/{userId}   thread with specific user
PUT    /messages/thread/{userId}/read  mark thread as read
```

### Employer Routes (auth:sanctum)
```
POST   /employer/packages/checkout         Stripe checkout session
GET    /employer/packages/balance          credit balance
GET    /employer/packages/history          purchase history
GET    /employer/profile                   employer profile
PUT    /employer/profile                   update employer profile
POST   /employer/profile/logo              upload logo
POST   /employer/profile/cover             upload cover photo
POST   /employer/jobs/generate-description AI JD generation (template-based)
GET    /employer/jobs                      own job listings
POST   /employer/jobs                      post new job (debits credit)
PUT    /employer/jobs/{id}                 update job listing
DELETE /employer/jobs/{id}                 delete job listing
GET    /employer/jobs/{id}/analytics       job analytics (views, apps, conversion, days remaining)
GET    /employer/applicants                all applicants (?job_id, ?status)
PUT    /employer/applicants/{id}/status    update applicant status
```

### Candidate Routes (auth:sanctum)
```
GET    /candidate/profile          candidate profile
PUT    /candidate/profile          update candidate profile (including skills array)
POST   /candidate/profile/cv       upload CV (PDF/DOCX)
POST   /candidate/profile/photo    upload profile photo
GET    /candidate/saved-jobs       saved jobs list
POST   /candidate/saved-jobs       save a job
DELETE /candidate/saved-jobs/{jobId}  unsave a job
GET    /candidate/applications     applications list
POST   /candidate/applications     apply for a job (with cover letter)
GET    /candidate/applications/check/{jobId}  check if already applied
GET    /candidate/alerts           job alerts list
POST   /candidate/alerts           create job alert (auto-subscribes to Flodesk)
PUT    /candidate/alerts/{id}      update job alert
DELETE /candidate/alerts/{id}      delete job alert
```

### Admin Routes (auth:sanctum + role:admin)
```
GET    /admin/profile              admin's own profile
PUT    /admin/profile              update admin's own profile

POST   /admin/users                create user (role + company_name for employer)
GET    /admin/users                list users (search, role filter, pagination)
PUT    /admin/users/{id}/role      change user role
PUT    /admin/users/{id}/status    activate/deactivate user
DELETE /admin/users/{id}           delete user (not self)

POST   /admin/credits/grant        grant package credits to employer (audit logged)
GET    /admin/credits/history      credit grant history

GET    /admin/stats                platform stats (9 metrics including revenue_month)
GET    /admin/audit-log            paginated audit log (action + days filters)
GET    /admin/reviews              all employer reviews
PUT    /admin/reviews/{id}         update review (approve/reject)
DELETE /admin/reviews/{id}         delete review

POST   /admin/jobs                 post job (employer_type=existing|external, employer search)
GET    /admin/jobs                 all jobs (search, status, featured filter)
PUT    /admin/jobs/{id}            update job (feature/unfeature, mark expired)
DELETE /admin/jobs/{id}            delete job (audit logged)

GET    /admin/employers/search     search employers (debounced autocomplete)
GET    /admin/employers            list employers (search, verified filter)
PUT    /admin/employers/{id}       update employer (is_verified, show_profile with audit log)
PUT    /admin/employers/{id}/profile  update employer profile (full edit + audit log)
POST   /admin/employers/{id}/logo  upload employer logo
POST   /admin/employers/{id}/cover upload employer cover photo

GET    /admin/candidates           list candidates (search, CV filter, completion filter, stats)
PUT    /admin/candidates/{id}/profile  update candidate profile + recalc completion %
POST   /admin/candidates/{id}/photo   upload candidate photo
POST   /admin/candidates/{id}/cv      upload candidate CV (invalidates JobMatchCache)

POST   /admin/packages             create package
GET    /admin/packages             list packages (with total_purchases + total_revenue per package)
PUT    /admin/packages/{id}        update package (inline edit + audit log)
DELETE /admin/packages/{id}        delete package (422 if credits_remaining > 0)

GET    /admin/feedback/stats       feedback stats (open/in_progress/resolved counts)
GET    /admin/feedback             all feedback (type/status filters, paginated)
PUT    /admin/feedback/{id}        update feedback status + admin_notes (notifies user by email)

GET    /admin/blog                 blog list (stats row + table)
POST   /admin/blog                 create blog post
POST   /admin/blog/upload-image    upload inline blog image (public disk)
GET    /admin/blog/{slug}          blog post detail
PUT    /admin/blog/{slug}          update blog post (partial update, slug regen on title change)
DELETE /admin/blog/{slug}          delete blog post

GET    /admin/settings             all site settings (grouped)
POST   /admin/settings             update site settings (triggers revalidation)
POST   /admin/settings/logo        upload site logo
```

### Next.js Internal Route
```
POST   /api/revalidate             cache revalidation (NEXT_PUBLIC_REVALIDATION_SECRET header, not a Laravel route)
```

---

## 6. Models & Relationships

### User
ULID primary key (auto-generated in boot()). Sanctum HasApiTokens.
- Fields: `id` (ULID string), `email`, `password` (hashed), `role` (candidate|employer|admin), `legacy_password` (bool), `display_name`, `ummahpass_id`, `is_active`, `email_verified_at`
- Relationships: `hasOne Candidate`, `hasOne Employer`
- Note: `personal_access_tokens` uses `ulidMorphs` not default morphs to support ULID PKs

### Candidate
One per candidate-role user.
- Fields: `user_id` FK, `title`, `location`, `phone`, `gender`, `age_range`, `experience_years`, `qualification`, `languages` (JSON array), `skills` (JSON array), `job_category`, `salary_type`, `socials` (JSON), `cv_path`, `profile_photo_path`, `show_profile`, `profile_complete_pct` (decimal:2 out of 14 fields), `views_count`
- Relationships: `belongsTo User`, `hasMany JobApplication`, `hasMany SavedJob`, `hasMany JobAlert`

### Employer
One per employer-role user.
- Fields: `user_id` FK, `company_name`, `slug` (unique), `category`, `description`, `email`, `phone`, `address`, `socials` (JSON), `logo_path`, `cover_photo_path`, `map_lat`, `map_lng`, `is_verified` (bool), `show_profile` (bool), `views_count`
- Relationships: `belongsTo User`, `hasMany Job`, `hasMany EmployerPackage`, `hasMany EmployerReview`

### Job
Supports external employer jobs (nullable employer_id).
- Fields: `employer_id` (nullable FK), `employer_package_id` FK, `category_id` FK, `title`, `slug`, `description`, `job_type`, `location`, `country`, `salary_min`, `salary_max`, `salary_currency`, `salary_type`, `experience_level`, `career_level`, `apply_type`, `apply_url`, `is_featured`, `is_urgent`, `status` (active|expired|draft), `expires_at`, `views_count`, `external_employer_name`, `external_employer_website`, `external_employer_email`
- Accessor: `is_external` ($appends) = `is_null($this->employer_id)`
- Relationships: `belongsTo Employer`, `belongsTo JobCategory`, `belongsTo EmployerPackage`, `hasMany JobApplication`

### Package
Three seeded: Basic ($8.40/1 regular/40 days), Standard ($38.50/1 featured/40 days), Extended ($70/3 featured/60 days + newsletter).
- Fields: `name`, `price`, `post_count`, `post_type` (regular|featured), `duration_days`, `includes_newsletter` (bool), `is_active` (bool), `description`
- Relationships: `hasMany EmployerPackage`

### EmployerPackage
One row per purchase or admin-grant.
- Fields: `employer_id` FK, `package_id` FK, `stripe_order_id` (nullable), `credits_remaining`, `duration_days`, `granted_by_admin` (bool), `expires_at`
- Relationships: `belongsTo Employer`, `belongsTo Package`, `hasMany Job`

### JobApplication
No standard timestamps (has `applied_at`).
- Fields: `job_id` FK, `candidate_id` FK, `status` (pending|reviewing|shortlisted|rejected|hired), `cover_letter`, `applied_at`
- Relationships: `belongsTo Job`, `belongsTo Candidate`

### SavedJob
No standard timestamps.
- Fields: `candidate_id` FK, `job_id` FK, `saved_at`
- Relationships: `belongsTo Candidate`, `belongsTo Job`

### JobAlert
- Fields: `candidate_id` FK, `keyword`, `category_id` FK (nullable), `location`, `job_type`, `frequency` (daily|weekly), `last_sent_at`
- Relationships: `belongsTo Candidate`, `belongsTo JobCategory`

### JobMatchCache
No standard timestamps. Keyed on (job_id, candidate_id).
- Fields: `job_id` FK, `candidate_id` FK, `match_score` (0–100), `match_reasons` (JSON array of strings), `dimensions` (JSON object with 6 keys), `cached_at`
- Relationships: `belongsTo Job`, `belongsTo Candidate`

### Message
Thread dedup: sorted-pair key from sender_id + recipient_id.
- Fields: `sender_id` FK→users, `recipient_id` FK→users, `job_id` FK (nullable), `body`, `read_at`
- Relationships: `belongsTo User (sender)`, `belongsTo User (recipient)`, `belongsTo Job`

### EmployerReview
- Fields: `employer_id` FK, `reviewer_id` FK→users, `rating` (1–5), `review_text`
- Relationships: `belongsTo Employer`, `belongsTo User (reviewer)`

### BlogPost
- Fields: `author_id` FK→users, `title`, `slug`, `content`, `excerpt`, `category`, `featured_image_path`, `published_at`
- Relationships: `belongsTo User (author)`

### StripeOrder
Idempotency via `stripe_session_id` dedup in webhook handler.
- Fields: `employer_id` FK, `package_id` FK, `stripe_session_id` (unique), `amount`, `status` (pending|completed), `completed_at`
- Relationships: `belongsTo Employer`, `belongsTo Package`

### AdminAuditLog
Table: `admin_audit_log`.
- Fields: `admin_id` FK→users, `target_user_id` FK→users (nullable), `action`, `notes`
- Relationships: `belongsTo User (admin)`, `belongsTo User (targetUser)`

### Feedback
- Fields: `user_id` FK, `type` (bug|feature|general), `title`, `description`, `status` (open|in_progress|resolved), `admin_notes`, `admin_id` FK (nullable), `resolved_at`
- Relationships: `belongsTo User`, `belongsTo User (admin)`

### Other Tables (no dedicated models)
| Table | Purpose |
|-------|---------|
| `role_equivalencies` | 30 seeded job-title equivalency groups for JobMatchService lookup |
| `site_settings` | key (PK), value, type, group, label, description — 22 settings across 5 groups (general/appearance/homepage/seo/social) |
| `password_reset_tokens` | Standard Laravel password reset tokens |
| `personal_access_tokens` | Sanctum API tokens (ulidMorphs) |

---

## 7. Frontend Pages

All pages under `frontend/src/app/` (Next.js 15 App Router). No `src/` prefix — the app directory is at `frontend/src/app/`.

### Public Pages
| Route | File | Description | Auth |
|-------|------|-------------|------|
| `/` | `app/page.tsx` | Homepage — hero search, featured jobs carousel, categories grid, latest jobs, stats counter, newsletter | No |
| `/about` | `app/about/page.tsx` | 7-section about page (hero/mission/values/stats/story/UMG/CTA) | No |
| `/blog` | `app/blog/page.tsx` | Blog listing (category tabs, search, sidebar) | No |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Blog post detail (featured image, read time, share, newsletter sidebar) | No |
| `/contact` | `app/contact/page.tsx` | Contact form with honeypot | No |
| `/jobs` | `app/jobs/page.tsx` | Job listings with FilterSidebar | No |
| `/jobs/[slug]` | `app/jobs/[slug]/page.tsx` | Job detail (apply button, share, bookmark, AI match score, message employer) | No |
| `/employers/[slug]` | `app/employers/[slug]/page.tsx` | Employer profile (cover, open jobs, reviews, map) | No |
| `/employers/why-post` | `app/employers/why-post/page.tsx` | Why post a job (conversion page for employers) | No |
| `/packages` | `app/packages/page.tsx` | Packages pricing (3-col grid, FAQ, recommended badge) | No |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy | No |
| `/terms` | `app/terms/page.tsx` | Terms of service | No |

### Auth Pages (`(auth)` route group)
| Route | File | Description |
|-------|------|-------------|
| `/login` | `(auth)/login/page.tsx` | Split-screen login — email/password + disabled UmmahPass button |
| `/register` | `(auth)/register/page.tsx` | Split-screen register — 2-step (role selection → form; employer gets company_name) |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Password reset request (green checkmark success state) |
| `/reset-password` | `(auth)/reset-password/page.tsx` | Password reset form (Suspense boundary; 2s countdown then redirect) |

### Candidate Dashboard (`(dashboard)/candidate/`)
| Route | Auth |
|-------|------|
| `/candidate/dashboard` | role=candidate |
| `/candidate/profile/edit` | role=candidate — 7-section profile editor (photo/basic/professional/languages/skills/CV/visibility) |
| `/candidate/saved-jobs` | role=candidate |
| `/candidate/applications` | role=candidate — pipeline stepper, cover letter toggle |
| `/candidate/alerts` | role=candidate — CRUD job alerts |
| `/candidate/messages` | role=candidate — MessagesPage shared component |
| `/candidate/feedback` | role=candidate — own feedback submissions |

### Employer Dashboard (`(dashboard)/employer/`)
| Route | Auth |
|-------|------|
| `/employer/dashboard` | role=employer — stats, credit balance, recent listings |
| `/employer/post-job` | role=employer — 3-step wizard with JD generator |
| `/employer/jobs` | role=employer — tabs (active/expired/all), edit modal, delete confirm |
| `/employer/jobs/[id]/applicants` | role=employer — status funnel, per-applicant status dropdown |
| `/employer/analytics` | role=employer — job selector, 4 stat cards, CSS bar chart |
| `/employer/packages` | role=employer — balance cards, purchase history, Stripe checkout |
| `/employer/profile/edit` | role=employer — all profile fields, social links, map coords |
| `/employer/messages` | role=employer — MessagesPage shared component |
| `/employer/applicants` | role=employer — all applicants across all jobs |
| `/employer/feedback` | role=employer — own feedback submissions |

### Admin Dashboard (`(dashboard)/admin/`)
| Route | Auth |
|-------|------|
| `/admin` | role=admin — 8 stat cards, audit log table, 3 quick action buttons |
| `/admin/users` | role=admin — search, role tabs, status filter, Add User modal |
| `/admin/jobs` | role=admin — search, status tabs, featured filter, feature/expire/delete |
| `/admin/jobs/post` | role=admin — post job with employer search autocomplete |
| `/admin/employers` | role=admin — search, Halal Verified grant/revoke, show/hide, EditEmployerModal |
| `/admin/candidates` | role=admin — search, CV filter, completion filter, EditCandidateModal |
| `/admin/packages` | role=admin — inline edit, CreatePackageModal, delete guard |
| `/admin/blog` | role=admin — stats row, table with thumbnail/status badge |
| `/admin/blog/new` | role=admin — new post (auto-slug, image upload, publish/draft/schedule) |
| `/admin/blog/[slug]/edit` | role=admin — edit post (pre-populated, View Live, Delete confirm) |
| `/admin/audit-log` | role=admin — search, action filter, date range, color-coded badges |
| `/admin/reviews` | role=admin — all employer reviews, approve/reject/delete |
| `/admin/feedback` | role=admin — stats cards, type/status filters, inline edit, email notification |
| `/admin/settings` | role=admin — tabbed (General/Appearance/Homepage/SEO/Social), revalidate after save |
| `/admin/profile` | role=admin — personal info, change password, account details |

### Next.js API Route
| Route | Description |
|-------|-------------|
| `/api/revalidate` | Cache revalidation — POST with secret header; calls revalidatePath for /, /about, /blog |

---

## 8. Frontend Components

```
components/
  about/
    AboutCTACard.tsx          CTA card on about page
  ads/
    MANAd.tsx                 Renders a single EPOM ad placement via iframe (leaderboard/mobile-banner/rectangle)
    MANLeaderboard.tsx        Responsive wrapper — leaderboard (728×90) on desktop, mobile-banner (320×50) on mobile
  blog/
    BlogClient.tsx            Client component for blog category/search filtering
    BlogFeaturedImage.tsx     Featured image with onError fallback gradient
  candidate/
    SkillsInput.tsx           Tag input (Enter/comma to add, Backspace to remove, 30 max, 29 suggestion chips)
  employers/
    EmployerFAQ.tsx           FAQ section on employer profile
    EmployerReviewsSection.tsx Reviews list on employer profile
  home/
    CategoryGrid.tsx          26 categories, alternating blue/green hover, scale(1.02) on hover
    FeaturedJobsCarousel.tsx  Featured jobs horizontal carousel
    HeroSearch.tsx            Unified search bar (keywords+location+type in one pill container)
    NewsletterSignup.tsx      Newsletter form (dark prop for dark backgrounds)
    StatsCounter.tsx          Animated counter — white text on blue gradient; alternates blue/green per stat
  jobs/
    AIMatchScore.tsx          Match score display (score header, progress bar, reasons/gaps, 6-dimension breakdown)
    ApplySection.tsx          Apply button / external link
    BookmarkButton.tsx        Save/unsave job toggle
    FilterSidebar.tsx         Job filter sidebar (category/type/location/experience)
    JobCard.tsx               'use client', left border hover #033BB0, LogoFallback color cycling by letter
    JobListWithScores.tsx     Jobs list with batch match scores
    MessageEmployerButton.tsx Deep link to messages (?compose= param)
    ShareButtons.tsx          Share job via link
    SortDropdown.tsx          Sort jobs dropdown
  layout/
    AnnouncementBar.tsx       Dismissable announcement bar (fetches /api/settings, localStorage keyed on text)
    ConditionalLayout.tsx     Hides Navbar/Footer on /auth/* and dashboard routes
    FooterNewsletter.tsx      Inline email-only newsletter form in footer
    Footer.tsx                5-column dark footer, green top border (3px #0FBB0F), logo
    MinimalFooter.tsx         Minimal footer for auth pages
    Navbar.tsx                Sticky, auth-aware, avatar dropdown, mobile hamburger, bell icon, unread badge
  messages/
    MessagesPage.tsx          Shared — thread list + thread view + compose, Enter-to-send, date separators
  ui/
    AnimatedSection.tsx       Intersection observer fade-in animation
    BismillahWatermark.tsx    Bismillah watermark
    CategoryIcon.tsx          26 SVG icons (Heroicons-style)
    DailyQuoteWidget.tsx      Islamic quote widget
    ErrorBoundary.tsx         React error boundary
    FeedbackModal.tsx         3-type selector cards, title/description form, char counter, success state
    IslamicEmptyState.tsx     Empty state with Islamic styling
    IslamicIcons.tsx          Islamic icon set
    IslamicPattern.tsx        Islamic geometric pattern
    JobCardSkeleton.tsx       Loading skeleton for job cards
    SectionHeading.tsx        Section heading component
    Toast.tsx                 Toast notification system (auto-dismiss)
```

---

## 9. Services

### JobMatchService
6-dimension weighted algorithmic scoring engine (no Claude API calls despite early plan).
- **Dimensions:** Skills (×3 weight — explicit skills field ×3, CV text ×1, job title ×2), Experience, Location, Category, Qualification, Completeness
- **Algorithms:** Jaccard token overlap, synonym expansion, role equivalency DB lookup (+0.35 boost for same role group), region-aware location scoring (UAE/UK/US/GCC groups), language bonus up to +0.05, related category partial matches, experience year extraction from text
- **Output:** `score` (0–100), `label` (Excellent/Good/Fair/Poor), `reasons` (flat string array), `missing` (gaps), `dimensions` (JSON object with 6 sub-scores)
- **Cache:** 24h in `job_match_cache` table; invalidated when candidate CV changes (admin upload)

### CVTextExtractor
- PDF extraction via `smalot/pdfparser` library; DOCX via unzip+XML parsing; `basicPdfExtract()` fallback
- Returns cleaned plain text string; merged with explicit skills field in JobMatchService

### JDWriterService
Template-based JD generator (zero cost, no API calls).
- Inputs: role, responsibilities, requirements, category, salary info, remote flag, urgent flag
- 17-category industry map; community bonus paragraph for Imam/NGO/Education categories
- Muslim-friendly "What We Offer" section (flexible prayer times, halal workplace)
- `generate()` returns formatted job description string

### GmailMailerService
Gmail OAuth2 API — direct send, bypasses Laravel Mail/SMTP.
- `getAccessToken()` — refreshes via Google token endpoint using GMAIL_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN
- `send(to, subject, textBody)` — plain text
- `sendHtml(to, subject, htmlBody, replyTo)` — HTML email
- Used for: password reset, legacy password reset on login, package confirmation, job expiry warning, feedback resolution notification

### EmailTemplateService
Static helper class for branded HTML emails.
- `wrap(preheader, bodyHtml)` — blue header with logo, white body, gray footer
- `button(url, text, color)` — styled CTA button (default #033BB0 blue)
- `heading(text)`, `paragraph(text)`, `infoBox(html, bg, border)`, `divider()`

### EmployerPackageService
- `createFromStripe(sessionId, employerId, packageId)` — creates EmployerPackage from Stripe webhook
- `debitCredit(employerId)` — uses oldest non-expired package with credits_remaining > 0
- `hasCredits(employerId)` — checks for valid unexpired credit
- `creditBalance(employerId)` — returns array of active packages with remaining credits

### FlodeskService
- `subscribe(email, firstName, segmentId)` — 2-step: PUT subscriber then POST to segment
- Basic Auth (FLODESK_API_KEY as password)
- Graceful mock when FLODESK_API_KEY is placeholder or empty — logs instead of calling API

### StripeService
- `createCheckoutSession(employer, package, successUrl, cancelUrl)` — returns Stripe checkout URL

### SiteSettingsService
- Redis-cached with 1h TTL (cache key: `site_settings`)
- `all()`, `get(key, default)`, `set(key, value)`, `setMany(array)`, `grouped()`, `publicSettings()`
- 22 settings across groups: general (site name, contact email, phone), appearance (logo), homepage (hero text, stats, announcement), seo (title, description, og image), social (links)

### RevalidationService
- `trigger(paths)` — calls Next.js `/api/revalidate` with REVALIDATION_SECRET
- Called by admin settings controller after saving

---

## 10. Background Jobs

### SendPackageConfirmation
Queued on successful Stripe checkout.
- Sends branded HTML email via GmailMailerService + EmailTemplateService
- Content: order ID, package name, amount, post credits, listing duration, green "Post Your First Job" button

### SendJobExpiryWarning
Queued by `ExpireJobs` scheduled command.
- Sends HTML email 5 days before job listing expires
- Content: job title, expiry date, amber warning infoBox, "Go to Dashboard" button

### Scheduled Commands (registered in routes/console.php)
- `ExpireJobs` — marks expired jobs; dispatches SendJobExpiryWarning 5 days before expiry
- `SendExpiryWarnings` — companion to ExpireJobs

---

## 11. Frontend Lib & Auth

### AuthContext (`context/AuthContext.tsx`)
- Stores `uj_token` and `uj_user` in localStorage
- On mount: reads localStorage, verifies via `GET /api/auth/me`, updates user state
- Exposes: `user`, `token`, `role`, `isLoading`, `isAuthenticated`, `unreadMessages`, `login()`, `logout()`
- `login(token, user)` — writes to localStorage + state
- `logout()` — clears localStorage, sets null, redirects to `/`
- `unreadMessages` polled every 30s in dashboard layouts via `/api/messages/unread-count`

### api.ts (`lib/api.ts`)
Fetch wrapper. All requests go through `NEXT_PUBLIC_API_URL` base.
- `authHeaders()` — reads `uj_token` from localStorage, adds `Authorization: Bearer` + `Accept: application/json`
- On 401: clears localStorage, redirects to `/login`
- Methods: `get(path)`, `post(path, body)`, `put(path, body)`, `delete(path)`, `upload(path, formData)` — upload omits Content-Type (lets browser set multipart boundary)

### Other Lib Files
| File | Purpose |
|------|---------|
| `lib/blogUtils.ts` | `getBlogImageUrl()` — returns null for wp-content URLs, prepends API_URL for /storage/ paths |
| `lib/categoryIcons.ts` | 26 category icon name mappings |
| `lib/formatJobDescription.ts` | Format raw job description text |
| `lib/imageUtils.ts` | Image URL helpers |
| `lib/islamicQuotes.ts` | Islamic quotes array |
| `lib/timeAgo.ts` | Relative time formatting |

---

## 12. Pre-Granted Employer Credits

These credits were inserted directly via `Admin-Features-A` / `S4c` migration scripts with audit log entries. **Must be honoured at launch:**

| Email | Package | Credits |
|-------|---------|---------|
| career@celebratemercy.com | Standard | 2 |
| ash@echotalk.ai | Basic | 1 |
| Adella.berlianti@launchgood.com | Extended | 3 |

---

## 13. Brand & Admin Credentials

### Brand Colors
- Primary blue: `#033BB0`
- Secondary green: `#0FBB0F`
- CSS variables: `--brand-blue`, `--brand-green`, `--brand-green-light`

### Admin Account
- Email: `mydarkbluehue@gmail.com`
- Password: `Admin@2026!`

### Packages (seeded)
| Name | Price | Posts | Type | Duration | Newsletter |
|------|-------|-------|------|----------|------------|
| Basic | $8.40 | 1 | regular | 40 days | No |
| Standard | $38.50 | 1 | featured | 40 days | No |
| Extended | $70.00 | 3 | featured | 60 days | Yes |

---

## 14. Known Issues & Pending Items

- **generateDescription blocked for admin** — `POST /api/employer/jobs/generate-description` requires employer role; admin post-job page cannot use JD generator (noted in Admin-Features-B). Requires either a role bypass or a separate admin JD endpoint.
- **Job alert emails not sent** — AlertController CRUD is live but no job alert sending logic exists. The `last_sent_at` field is unused. Alert creation auto-subscribes to Flodesk but does not dispatch matching job emails.
- **Employer reviews not moderated via admin UI** — `Admin\ReviewController` exists with index/update/destroy; admin reviews page is built but the approval workflow is placeholder-level.
- **UmmahPass SSO disabled** — Button exists on auth pages but is non-functional. Needs: new client ID on ummahpass.io, Cloudflare WAF bypass for `/api/auth/ummahpass/*`, and implementation of UmmahPassController.
- **WP tables in DB** — `wp_*` tables remain in `ummahjobs_umg`. The `wp_import` database connection points to the same DB. Safe to leave; migration complete.
- **Stripe test keys** — live keys must be swapped in .env at S18 go-live.
- **Flodesk production keys** — FLODESK_API_KEY is placeholder; FlodeskService gracefully mocks until real key is set.
- **REVALIDATION_SECRET** — must match between backend .env and frontend .env.local.
- **CV reviewer AI feature** — mentioned in original project scope (Claude Sonnet API) but never built. Post-launch backlog.

---

## 15. Developer Notes & Gotchas

- **AI scoring is algorithmic, not Claude API** — Despite CLAUDE.md listing "AI: Anthropic Claude Sonnet API", the actual JobMatchService is a pure algorithmic engine (Jaccard + role equivalency DB). No Claude API calls are made. The original plan was revised in S12c.1. JDWriterService is also template-based (zero cost).

- **ULID user PKs** — User IDs are ULIDs (string PKs), not integers. `personal_access_tokens` uses `ulidMorphs`. Any raw SQL or Eloquent query joining on `user_id` must handle string comparison.

- **All API requests need `Accept: application/json`** — Without this header, Laravel returns HTML redirects instead of JSON. The `api.ts` client always includes it.

- **Email via GmailMailerService only** — `MAIL_MAILER=log` is set but irrelevant; all email goes through `GmailMailerService` directly (Gmail OAuth2 API). Never route email through Laravel Mail/SMTP.

- **Legacy password flow** — Users with `legacy_password=true` can log in with any password; backend detects this, generates a reset token, sends email via GmailMailerService, and rejects the login. User must set a real password via the reset link.

- **Stripe webhook CSRF exclusion** — `POST /api/webhooks/stripe` is excluded from CSRF middleware. Webhook idempotency via `stripe_orders.stripe_session_id` unique constraint.

- **trustProxies** — `$middleware->trustProxies(at: '*')` is in `bootstrap/app.php`. Required for Nginx reverse proxy to forward correct HTTPS/IP.

- **External employer jobs** — `employer_id` is nullable on jobs. External jobs have `external_employer_name`, `external_employer_website`, `external_employer_email`. Frontend checks `is_external` accessor to show/hide employer profile links and message button.

- **Blog images** — `getBlogImageUrl()` in `lib/blogUtils.ts` returns `null` for WordPress CDN images (wp-content URLs) to prevent broken images from the migration. Use `BlogFeaturedImage.tsx` which handles the null case with a gradient fallback.

- **WP migration command** — `php artisan migrate:wp-jobs` migrates WP job listings. Idempotent via slug check. 19 jobs were skipped as external (no matching employer record).

- **Site settings revalidation** — After saving admin settings, `RevalidationService::trigger()` fires a POST to Next.js `/api/revalidate` with the secret header. This purges the ISR cache for /, /about, /blog so settings changes appear immediately without a full redeploy.

- **config:cache rule** — After any `.env` change on the backend, always run `php artisan config:clear && php artisan config:cache`. Raw `env()` calls return null when config is cached.

- **Nginx not enabled** — The Nginx config exists at `/etc/nginx/sites-available/ummahjobs` but has NOT been symlinked to `sites-enabled`. Do not enable it until S18 DNS cutover.

- **MAN (Muslim Ad Network) EPOM ads — use the static HTML iframe method.** The EPOM JS tag approach (`<ins class="bbbac5e5">` + `<script async>`) causes `nimp:true` and "ad container already removed" errors in Next.js SPAs due to React hydration/lifecycle conflicts with `window.EpomAdServer`. The working implementation uses static HTML files in `public/ads/` (one per size), each containing only the `<ins>` tag and script. These are loaded via `<iframe scrolling="no" frameBorder="0">` in `MANAd.tsx`. `MANLeaderboard.tsx` handles responsive switching between leaderboard (728×90) and mobile-banner (320×50) using `useState<boolean | null>(null)` — **null default is required** to avoid SSR rendering the wrong size. `frame-src 'self'` must be in the CSP (`next.config.ts`) for same-origin iframes to load. See `/var/www/CLAUDE.md` for the full reference implementation.
