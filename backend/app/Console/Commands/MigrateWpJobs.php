<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MigrateWpJobs extends Command
{
    protected $signature   = 'migrate:wp-jobs';
    protected $description = 'Migrate WordPress job listings to UmmahJobs jobs table';

    // WP taxonomy job_listing_type slug → our job_type value
    private array $jobTypeMap = [
        'full-time'           => 'Full Time',
        'full-time-2'         => 'Full Time',
        'full-time-remote'    => 'Remote',
        'full-time-contract'  => 'Contract',
        'part-time'           => 'Part Time',
        'part-time-2'         => 'Part Time',
        'part-time-remote'    => 'Part Time',
        'part-time-contract'  => 'Contract',
        'remote'              => 'Remote',
        'on-site'             => 'Full Time',
        'hybrid'              => 'Full Time',
        'freelance'           => 'Freelance',
        'internship'          => 'Internship',
        'internship-remote'   => 'Internship',
        'temporary'           => 'Temporary',
        'volunteer'           => 'Volunteer',
        'contract'            => 'Contract',
    ];

    // WP category slug → our category slug
    private array $categorySlugMap = [
        'accounting-finance'              => 'accounting-finance',
        'accounting'                      => 'accounting-finance',
        'banking-finance'                 => 'banking-finance',
        'administrative'                  => 'administrative',
        'customer'                        => 'customer-service',
        'customer-service'                => 'customer-service',
        'design'                          => 'design',
        'development'                     => 'it-software-development',
        'software-engeneering'            => 'it-software-development',
        'web-development'                 => 'it-software-development',
        'app-development'                 => 'it-software-development',
        'it-operations-helpdesk'          => 'it-software-development',
        'product-manager'                 => 'it-software-development',
        'education-instruction'           => 'education-instruction',
        'engineering'                     => 'engineering',
        'automotive-jobs'                 => 'engineering',
        'food-beverage'                   => 'food-beverage',
        'health-and-care'                 => 'health-care',
        'hospitality-tourism'             => 'hospitality-tourism',
        'human-resource'                  => 'human-resources',
        'human-resources'                 => 'human-resources',
        'imam'                            => 'imam-islamic-studies',
        'legal'                           => 'legal',
        'management'                      => 'management',
        'executive'                       => 'management',
        'event-management'                => 'management',
        'marketing'                       => 'marketing',
        'media-communications'            => 'media-communications',
        'video-editor'                    => 'media-communications',
        'medical-information'             => 'medical-nursing',
        'nursing'                         => 'medical-nursing',
        'medical-technician'              => 'medical-nursing',
        'nonprofit-ngo'                   => 'nonprofit-ngo',
        'community-social-work'           => 'nonprofit-ngo',
        'personal-care-home-health'       => 'personal-care-home-health',
        'project-management'              => 'project-management',
        'research'                        => 'scientific-research',
        'scientific-research-development' => 'scientific-research',
        'retail'                          => 'retail',
        'sales'                           => 'sales',
        'security-public-safety'          => 'security-public-safety',
    ];

    public function handle(): int
    {
        $this->info('Loading reference data…');

        // WP user ID → new ULID map
        $idMap = json_decode(
            file_get_contents(storage_path('app/wp_user_id_map.json')),
            true
        );

        // Employers keyed by user_id
        $employers = DB::table('employers')->get()->keyBy('user_id');

        // Our job categories keyed by slug
        $categories = DB::table('job_categories')->get()->keyBy('slug');

        // All published WP job posts
        $wpJobs = DB::connection('wp_import')
            ->table('wp_posts')
            ->where('post_type', 'job_listing')
            ->where('post_status', 'publish')
            ->orderBy('ID')
            ->get();

        $this->info("Found {$wpJobs->count()} published WP job listings.");

        // Bulk-load all postmeta
        $postIds = $wpJobs->pluck('ID')->toArray();
        $allMeta = DB::connection('wp_import')
            ->table('wp_postmeta')
            ->whereIn('post_id', $postIds)
            ->get()
            ->groupBy('post_id');

        // Bulk-load all taxonomy terms for these jobs
        $allTerms = DB::connection('wp_import')
            ->table('wp_term_relationships as tr')
            ->join('wp_term_taxonomy as tt', 'tr.term_taxonomy_id', '=', 'tt.term_taxonomy_id')
            ->join('wp_terms as t', 'tt.term_id', '=', 't.term_id')
            ->whereIn('tr.object_id', $postIds)
            ->whereIn('tt.taxonomy', ['job_listing_type', 'job_listing_category'])
            ->select('tr.object_id', 't.name', 't.slug', 'tt.taxonomy')
            ->get()
            ->groupBy('object_id');

        $inserted          = 0;
        $skippedDupe       = 0;
        $skippedNoEmployer = 0;

        foreach ($wpJobs as $wpJob) {
            $meta  = $allMeta[$wpJob->ID]  ?? collect();
            $terms = $allTerms[$wpJob->ID] ?? collect();

            // ── Skip duplicate slugs ──
            $slug = $wpJob->post_name ?: Str::slug($wpJob->post_title);
            if (DB::table('jobs')->where('slug', $slug)->exists()) {
                $this->line("  SKIP (dupe): {$wpJob->post_title}");
                $skippedDupe++;
                continue;
            }

            // ── Resolve employer ──
            $employer = $this->resolveEmployer($wpJob, $meta, $idMap, $employers);

            if (!$employer) {
                $this->warn("  SKIP (no employer): {$wpJob->post_title}");
                $skippedNoEmployer++;
                continue;
            }

            // ── Job type from job_listing_type taxonomy ──
            $typeTerm = $terms->firstWhere('taxonomy', 'job_listing_type');
            $jobType  = $typeTerm
                ? ($this->jobTypeMap[strtolower($typeTerm->slug)] ?? 'Full Time')
                : 'Full Time';

            // ── Category from job_listing_category taxonomy ──
            $categoryId = null;
            $catTerm    = $terms->firstWhere('taxonomy', 'job_listing_category');
            if ($catTerm) {
                $ourSlug = $this->categorySlugMap[$catTerm->slug] ?? null;
                if ($ourSlug && isset($categories[$ourSlug])) {
                    $categoryId = $categories[$ourSlug]->id;
                } elseif (isset($categories[$catTerm->slug])) {
                    $categoryId = $categories[$catTerm->slug]->id;
                } else {
                    // Partial name fallback
                    $wpName = strtolower(html_entity_decode($catTerm->name));
                    foreach ($categories as $cat) {
                        $ourName = strtolower($cat->name);
                        if (str_contains($ourName, $wpName) || str_contains($wpName, $ourName)) {
                            $categoryId = $cat->id;
                            break;
                        }
                    }
                }
            }

            // ── Fields from meta ──
            $location = $this->getMeta($meta, '_job_address')
                     ?: $this->getMeta($meta, '_job_location');

            $salaryMin  = $this->getMeta($meta, '_job_salary')
                ? ((int)$this->getMeta($meta, '_job_salary') ?: null)
                : null;
            $salaryMax  = $this->getMeta($meta, '_job_max_salary')
                ? ((int)$this->getMeta($meta, '_job_max_salary') ?: null)
                : null;
            $salaryType = $this->normaliseSalaryType($this->getMeta($meta, '_job_salary_type'));

            $isFeatured = $this->getMeta($meta, '_job_featured') === 'on';
            $isUrgent   = $this->getMeta($meta, '_job_urgent')   === 'on';

            // Apply type / URL
            $applyTypeMeta = $this->getMeta($meta, '_job_apply_type');
            $applyUrl      = $this->getMeta($meta, '_job_apply_url');
            if ($applyTypeMeta === 'external' && $applyUrl) {
                $applyType = 'external';
            } else {
                $applyType = 'platform';
                $applyUrl  = null;
            }

            // Views count
            $viewsCount = (int)($this->getMeta($meta, '_viewed_count')
                            ?: $this->getMeta($meta, '_job_views_count')
                            ?: 0);

            // Expiry / status
            [$status, $expiresAt] = $this->resolveExpiry(
                $this->getMeta($meta, '_job_application_deadline_date')
                ?: $this->getMeta($meta, '_job_expiry_date')
            );

            // Unique slug (should already be unique after dupe check, but be safe)
            $baseSlug = $slug;
            $i = 1;
            while (DB::table('jobs')->where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $i++;
            }

            // Strip WP block comments from description
            $description = trim(preg_replace('/<!--.*?-->/s', '', $wpJob->post_content ?? ''));

            DB::table('jobs')->insert([
                'employer_id'         => $employer->id,
                'employer_package_id' => null,
                'category_id'         => $categoryId,
                'title'               => html_entity_decode($wpJob->post_title),
                'slug'                => $slug,
                'description'         => $description,
                'job_type'            => $jobType,
                'location'            => $location,
                'country'             => null,
                'salary_min'          => $salaryMin,
                'salary_max'          => $salaryMax,
                'salary_currency'     => 'USD',
                'salary_type'         => $salaryType,
                'experience_level'    => null,
                'career_level'        => null,
                'apply_type'          => $applyType,
                'apply_url'           => $applyUrl,
                'is_featured'         => $isFeatured,
                'is_urgent'           => $isUrgent,
                'status'              => $status,
                'expires_at'          => $expiresAt,
                'views_count'         => $viewsCount,
                'created_at'          => $wpJob->post_date,
                'updated_at'          => $wpJob->post_modified,
            ]);

            $inserted++;
            $statusLabel = strtoupper($status);
            $this->line("  OK [{$statusLabel}]: {$wpJob->post_title} → {$employer->company_name}");
        }

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('Jobs migration complete!');
        $this->info("Inserted:              {$inserted}");
        $this->info("Skipped (dupes):       {$skippedDupe}");
        $this->info("Skipped (no employer): {$skippedNoEmployer}");
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return Command::SUCCESS;
    }

    // ── Employer resolution ──────────────────────────────────────────────────

    private function resolveEmployer(
        object $wpJob,
        $meta,
        array $idMap,
        $employers
    ): ?object {
        // 1. _job_employer_posted_by → WP employer post → match by company name
        $empPostId = $this->getMeta($meta, '_job_employer_posted_by');
        if ($empPostId) {
            $empPost = DB::connection('wp_import')
                ->table('wp_posts')
                ->where('ID', (int)$empPostId)
                ->first();
            if ($empPost && $empPost->post_title) {
                $employer = DB::table('employers')
                    ->where('company_name', $empPost->post_title)
                    ->first();
                if (!$employer) {
                    $employer = DB::table('employers')
                        ->where('company_name', 'like', '%' . $empPost->post_title . '%')
                        ->first();
                }
                if ($employer) return $employer;
            }
        }

        // 2. post_author → ID map → employer by user_id
        $newUlid = $idMap[(string)$wpJob->post_author] ?? null;
        if ($newUlid) {
            $employer = $employers[$newUlid] ?? null;
            if ($employer) return $employer;
        }

        // 3. Fall back to admin user's employer record
        $adminUser = DB::table('users')->where('role', 'admin')->first();
        if ($adminUser) {
            $employer = DB::table('employers')
                ->where('user_id', $adminUser->id)
                ->first();
            if ($employer) return $employer;
        }

        return null;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function getMeta($metaCollection, string $key): ?string
    {
        $item = $metaCollection->firstWhere('meta_key', $key);
        return $item ? ($item->meta_value ?: null) : null;
    }

    private function normaliseSalaryType(?string $raw): string
    {
        if (!$raw) return 'yearly';
        $raw = strtolower(trim($raw));
        return match (true) {
            str_contains($raw, 'hour')  => 'hourly',
            str_contains($raw, 'day')   => 'daily',
            str_contains($raw, 'week')  => 'weekly',
            str_contains($raw, 'month') => 'monthly',
            default                     => 'yearly',
        };
    }

    private function resolveExpiry(?string $expiresAt): array
    {
        if (!$expiresAt) {
            return ['active', null];
        }
        try {
            $expDate = Carbon::parse($expiresAt);
            if ($expDate->isPast()) {
                return ['expired', null];
            }
            return ['active', $expDate->toDateTimeString()];
        } catch (\Throwable) {
            return ['active', null];
        }
    }
}
