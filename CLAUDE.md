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
