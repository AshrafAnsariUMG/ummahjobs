# UmmahJobs — Quick Reference

## Project
URL (dev): http://37.27.215.90:3003
URL (live): https://ummahjobs.com (DNS not yet pointed)
Path: /var/www/ummahjobs
Backend port: 8003
Frontend port: 3003
GitHub: https://github.com/AshrafAnsariUMG/ummahjobs

## Server
IP: 37.27.215.90
SSH root: ssh root@37.27.215.90
SSH dev: ssh claude-dev@37.27.215.90

## PM2 Processes
ummahjobs-backend (port 8003) — Laravel API
ummahjobs-frontend (port 3003) — Next.js
ummahjobs-queue — Laravel queue worker
DO NOT TOUCH: istandwithpalestine-*, muslimadnetwork-reporting-*, dev-reporting-dashboard-*

## PM2 Commands
sudo pm2 restart ummahjobs-backend
sudo pm2 restart ummahjobs-frontend
sudo pm2 restart ummahjobs-queue
sudo pm2 list
sudo pm2 save

## Nginx
Main config: /etc/nginx/sites-available/ummahjobs
Status: NOT enabled yet — enable at go-live (S18)
Routes: /api/* and /storage/* → :8003 | /* → :3003
sudo nginx -t && sudo systemctl reload nginx

## Database
DB: ummahjobs_umg
User: ummahjobs
Host: 127.0.0.1:3306

## Stack
Backend: Laravel 11, API only, Sanctum auth
Frontend: Next.js 15, App Router, TypeScript, Tailwind
Auth: Dual — UmmahPass SSO (primary) + email/password (secondary)
Queue: Redis
Payments: Stripe
Newsletter: Flodesk
AI: Anthropic Claude Sonnet API (claude-sonnet-4-6)

## Key Rules
- Never hardcode localhost URLs — always use env vars
- Never run npm run build — root handles all frontend builds
- Always use sudo for pm2, nginx, ufw, systemctl commands
- ->trustProxies(at: '*') must be in withMiddleware() in bootstrap/app.php
- NEXT_PUBLIC_API_URL is the only API URL the frontend should reference
- UmmahPass OAuth endpoint is ummahpass.io (NOT ummahpass.com)
- Cloudflare WAF bypass required for /api/auth/ummahpass/* at go-live

## After Claude Code Finishes (root runs these)
cd /var/www/ummahjobs
git add .
git commit -m "message"
git push origin main
sudo pm2 save

## Frontend Build (root only — never claude-dev)
cd /var/www/ummahjobs/frontend
npm run build
sudo pm2 restart ummahjobs-frontend

## Backend Only Changes
php artisan config:clear && php artisan config:cache
sudo pm2 restart ummahjobs-backend

## Session Progress
- S1 complete: Laravel 11 + Next.js 15 scaffold, PM2, Nginx config staged
- S2 complete: All 20 migrations run, 3 seeders (26 categories, 7 job types, 3 packages), 17 Eloquent models
- S3a complete: Auth backend done — Sanctum, CORS, 7 auth endpoints, password reset flow, legacy_password migration flow. UmmahPass SSO deferred to S3b.
- S3b complete: Auth frontend done — TypeScript types, API client (Accept: application/json), AuthContext (localStorage), login, register (2-step), forgot-password, reset-password (Suspense), dashboard placeholders (candidate, employer, admin), homepage redirect to /login.
- S4a complete: WP dump loaded into ummahjobs_umg (wp_* tables, 2069 rows). 2061 users migrated with legacy_password=true. wp_import connection points to ummahjobs_umg. ID map at backend/storage/app/wp_user_id_map.json.
- S4b complete: 1955 candidates migrated (location/category resolved from wp_terms, languages/socials/cv unserialized). 101 employers migrated (logo direct URL, map_lat/lng extracted, slugs unique). 2 employers skipped (WP users filtered in S4a).
- S4c complete: 11 blog posts imported (categories from wp_term_relationships, featured images reconstructed as full URLs). 3 employer package credits granted (CelebrateMercy×2 Standard, Echotalk×1 Basic, LaunchGood×3 Extended) with audit log entries. Full data migration complete.
- S5 complete: Jobs API (index/show/featured/stats), Employer API (show/reviews/storeReview), Categories, Job Types, Packages — all public endpoints live. Routes cached.
- S6a complete: Navbar (sticky, auth-aware, mobile hamburger, avatar dropdown), Footer (4-col dark), ConditionalLayout (hides nav on auth/dashboard paths), Homepage (hero+search, MAN banner, featured carousel, latest jobs, categories grid, stats counter, newsletter). Brand color #033BB0 throughout. TypeScript clean.
- S6b complete: /jobs (paginated list + filter sidebar with category/type/location/experience), /jobs/[slug] (full detail, apply button, share, bookmark, AI match score stub), /employers/[slug] (profile with cover, open jobs, reviews, map). Toast system + JobCardSkeleton + BookmarkButton + ShareButtons + AIMatchScore + FilterSidebar. Build clean, PM2 restarted.
- S7 complete: Blog API added (GET /api/blog, GET /api/blog/{slug}). Blog listing page (category tabs, search, sidebar), blog post detail (featured image, read time, share, sidebar), packages pricing page (3-col grid, FAQ, recommended badge), about, contact, terms, privacy pages. BlogClient (client component for filtering). About dropdown in Navbar. Blog content CSS. Build clean, PM2 restarted.
- S9 complete: Full employer dashboard built — employer layout (sidebar, role guard, mobile hamburger), dashboard overview (stats, credit balance cards, quick actions, recent listings table), post-job 3-step wizard (basics/details/review with credit check), jobs listing page (tabs active/expired/all, edit modal, delete confirm), packages page (balance, purchase history, buy more with Stripe checkout, success banner), profile editor (all fields, social links add/remove, map coords, file upload UI disabled), applicants/messages placeholders. Backend ProfileController added (show/update). ConditionalLayout updated to hide chrome on /employer/*. Build clean (24 routes), PM2 restarted.
- S8 complete: Stripe checkout (StripeService, createCheckoutSession), webhook handler with idempotency (WebhookController, StripeOrder dedup), EmployerPackageService (createFromStripe/debitCredit/hasCredits/creditBalance), Employer\PackageController (checkout/balance/history), Employer\JobController (store with credit debit, index, update, destroy), SendPackageConfirmation + SendJobExpiryWarning queue jobs, ExpireJobs + SendExpiryWarnings scheduled commands, routes registered, CSRF webhook exclusion. All tests pass. PM2 restarted.
- S10 complete: Candidate profile API (show/update with profile_complete_pct recalc), CV upload (POST /api/candidate/profile/cv), photo upload (POST /api/candidate/profile/photo), saved jobs (GET/POST/DELETE /api/candidate/saved-jobs/{jobId}), job applications (GET/POST /api/candidate/applications, GET /api/candidate/applications/check/{jobId}), Employer\ApplicantController (index with job_id/status filters, updateStatus), analytics method on Employer\JobController (GET /api/employer/jobs/{id}/analytics), RoleMiddleware registered as 'role' alias, upload dirs created (cvs/photos/logos/covers). All routes cached. PM2 restarted.
- S11b complete: Employer applicants page (/employer/jobs/[id]/applicants — status funnel, per-applicant status dropdown with optimistic update, cover letter toggle, share buttons empty state) and analytics page (/employer/analytics — job selector, 4 stat cards with views/applications/conversion rate/days remaining, CSS-only bar chart, performance insight card, upsell card). Analytics sidebar link added. Applicants button added per job row in jobs table. New types: EmployerApplicant, JobAnalytics. Build clean (31 routes), PM2 restarted.
- S11a complete: Full candidate dashboard built — candidate layout (sidebar with photo, role guard, mobile hamburger), dashboard overview (welcome header, profile completion banner, stats 4-card row, recent applications table, saved jobs preview, quick links), profile editor (7 sections: photo upload, basic/professional info, languages tags, social links, CV upload with progress, visibility toggle), saved-jobs page (list with remove, sort), applications page (status pipeline stepper, filter tabs, cover letter toggle), alerts page (create/edit/delete alerts), messages placeholder. Backend: AlertController (CRUD) + routes added. api.ts upload() method added. New types: JobApplication, SavedJob, JobAlert. Build clean (29 routes), PM2 restarted.
- S12 complete: JobMatchService (6-dimension weighted scoring engine: skills/experience/location/category/qualification/completeness with synonym expansion, Jaccard similarity, experience year extraction, qualification level mapping). CVTextExtractor helper (PDF/DOCX text extraction). JobController::matchScore() wired to service with 24h JobMatchCache caching, returns {status, score, reasons, missing, dimensions}. Route GET /api/jobs/{slug}/match-score added (auth:sanctum). AIMatchScore frontend component rebuilt — reads uj_token from localStorage, full redesign with score header/progress bar, green checkmark reasons, amber warning gaps, collapsible dimension breakdown (6 progress bars). TypeScript clean. Routes cached, PM2 restarted.
- S12b complete: CV text wired into skills dimension (CVTextExtractor reads candidate cv_path, keywords merged with profile keywords). Job title weight increased to ×3 in skills scoring. dimensions stored as dedicated JSON column on job_match_cache (migration added). matchScore() response cleaned up: reasons/missing as flat arrays, dimensions as separate field, status always "ready". Batch scoring endpoint added: POST /api/jobs/batch-match-scores (max 20 slugs, returns {slug: {score, label}}, cache-aware). Routes cached, PM2 restarted.
- S12c.1 complete: role_equivalencies table (30 groups seeded — software_engineer, frontend_developer, imam, nurse, doctor, lawyer etc). skills JSON field added to candidates table + Candidate model + profile completion (now /14 fields). smalot/pdfparser installed, CVTextExtractor fully rewritten. JobMatchService fully rewritten — skills ×3 weight, explicit skills field ×3 vs CV ×1 vs title ×2, role equivalency DB lookup with +0.35 boost, region-aware location scoring (UAE/UK/US/GCC region groups), language bonus up to +0.05, related category groups for partial matches, scoreLabel() public. ProfileController update() accepts skills array. Routes cached, PM2 restarted.
- S12c.2 complete: Skills tag input on candidate profile editor (SkillsInput component — Enter/comma to add, Backspace to remove last, 30 skill max, 29 suggestion chips across 3 rows: Tech/Business/Islamic, already-added chips dimmed). Skills section inserted between Professional Info and Languages. skills wired into save request, initialised from profile.skills on load. Candidate type updated with skills field. Dashboard banner shows "Add your skills to get better job matches →" nudge when skills array is empty. Build clean, PM2 restarted.
- S13 complete: JDWriterService (template-based, zero cost) — opening paragraph, role overview, responsibilities/requirements bullet parsing, salary, Muslim-friendly "What We Offer" section, urgent hire, closing; 17-category industry map; community bonus for Imam/NGO/Education categories; remote detection. generateDescription endpoint (POST /api/employer/jobs/generate-description, auth:sanctum). "Generate Description ✨" button in post-job wizard Step 2 with Key Responsibilities textarea, loading spinner, success/error toast. Build clean (30 routes), PM2 restarted.
- S14a complete: MessageController (inbox, thread, send, markRead, unreadCount), all routes registered under auth:sanctum prefix /messages, unread count added to /api/auth/me response. Thread dedup via sorted-pair key, auto-mark-read on thread open, employer company name + logo in inbox, candidate photo in thread. All 5 endpoints tested and verified. Routes cached, PM2 restarted.
- S14b complete: MessagesPage shared component (thread list + thread view + compose, Suspense wrapper for useSearchParams, full-height two-column layout, date separators, Enter-to-send, optimistic unread clearing). MessageThread + Message TypeScript types added. Candidate + employer messages pages wired. Unread badge (30s polling) on Messages nav link in both layouts. Bell icon in Navbar for authenticated users. MessageEmployerButton client component on job detail sidebar (?compose= deep link). Message button on employer applicants page per candidate. Build clean (30 routes), PM2 restarted.
- S15a complete: Admin layout (sidebar with 8 nav links, role guard, mobile hamburger, "Administrator" red badge, purple avatar). Admin dashboard overview (8 stat cards — 4 live from /api/admin/stats, 4 placeholder with "coming soon" tooltip, recent activity table from audit log, 3 quick action buttons). Admin users page (search, role tab filter, status filter, 20/page pagination, per-row actions dropdown: change role modal, activate/deactivate confirm, delete confirm, optimistic updates, mock data fallback banner). Admin\UserController (index/updateRole/updateStatus/destroy with self-action guards). Admin routes added (GET/PUT users, stats, audit-log). Admin password set for mydarkbluehue@gmail.com (Admin@2026!). Build clean (31 routes), PM2 restarted.
- S16a complete: Admin\BlogController (index/show/store/update/destroy/uploadImage — public disk, auto-slug, excerpt fallback, partial update with slug regen on title change). Admin blog routes registered (upload-image before {slug} to avoid collision). Admin blog list page (/admin/blog — stats row, table with thumbnail/status badge/category, delete confirm). New post page (/admin/blog/new — auto-slug debounced, image upload+URL tabs, publish/draft/schedule workflow). Edit post page (/admin/blog/[slug]/edit — pre-populated from API, View Live ↗, Delete Post confirm, Save Draft/Update & Publish sticky bar, slug change redirect). Build clean (36 routes), PM2 restarted.
- S16b complete: Admin\PackageController (index with total_purchases + total_revenue stats per package, update with audit log). Admin\AuditLogController (index with action + days filters, admin display names resolved). Added description column to packages table (migration). /admin/packages (inline edit per card: price/post_count/duration_days/newsletter/description, active toggle switch, amber warning banner in edit mode, revenue summary row). /admin/audit-log (search/action filter dropdown/date range dropdown, color-coded action badges, paginated 20/page, client-side search filter). Build clean (38 routes), PM2 restarted.
- S17 complete: FlodeskService (subscribe with segment support — Basic auth, 2-step: PUT subscriber + POST segment, graceful mock when FLODESK_API_KEY is placeholder/empty). FLODESK_API_KEY + FLODESK_SEGMENT_ID added to .env + config/services.php. NewsletterController (POST /api/newsletter/subscribe, throttle:3,1, returns JazakAllah message). NewsletterSignup component updated — first_name field added, proper error handling (show error, keep form), success replaced with JazakAllah message. Blog post sidebar already used NewsletterSignup — auto-wired. FooterNewsletter client component added — email-only inline form in new 5th footer column "Job Alerts". Candidate AlertController.store() auto-subscribes user to Flodesk on alert creation (fire-and-forget). Build clean (38 routes), PM2 restarted.
- UI-1 complete: Logo image (/public/images/logo.jpeg) in Navbar (h-10) and Footer (h-8, brightness-0 invert for dark bg). #0FBB0F green added as secondary brand color (CSS vars: --brand-green, --brand-green-light). CategoryIcon.tsx component (26 SVG icons, Heroicons-style). CategoryGrid.tsx client component with alternating blue/green hover per card. StatsCounter alternates blue/green per stat. All emoji replaced with SVG: ✨→star SVG (Generate Description button), 🔥→lightning bolt (Urgent badges), ⭐→star SVG (Featured badges), ✓→SVG check (SkillsInput). Halal Verified badge updated to green (#E6F9E6 bg, #0FBB0F text+border) on employer profile + admin employers page. AIMatchScore Excellent badge → #0FBB0F green. Footer green top border (3px solid #0FBB0F). Metadata title updated. Build clean (38 routes), PM2 restarted.
- S15b complete: Admin jobs page (search, status tabs, featured filter, feature/unfeature toggle, mark-expired confirm, delete confirm — all optimistic with toast feedback). Admin employers page (search, verified filter tabs, Halal Verified grant/revoke with audit log, show/hide profile toggle — optimistic + toast). Admin candidates page (read-only: 4 stat cards, search, CV filter, completion filter, mini progress bars color-coded by tier). Backend: Admin\JobController (index/update/destroy with audit log on delete), Admin\EmployerController (index/update with audit log on verify), Admin\CandidateController (index with stats). All 6 admin routes registered. Build clean (34 routes), PM2 restarted.

## Import Notes
- wp_import DB connection points to ummahjobs_umg (same DB — WP tables use wp_ prefix, no conflicts)
- WP dump was pre-loaded into ummahjobs_umg (wp_commentmeta, wp_users, wp_usermeta, wp_posts, etc.)
- ID map for WP→ULID lookup: backend/storage/app/wp_user_id_map.json

## Auth Notes
- All API requests must include Accept: application/json header (without it Laravel redirects instead of returning JSON)
- MAIL_MAILER=log (dev) — change to real SMTP before go-live
- personal_access_tokens uses ulidMorphs (not default morphs) to support ULID user PKs
- User model has boot() auto-ULID generation

## Logs
sudo pm2 logs ummahjobs-backend --lines 50
sudo pm2 logs ummahjobs-frontend --lines 50
tail -50 /var/www/ummahjobs/backend/storage/logs/laravel.log
