<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateWpCandidates extends Command
{
    protected $signature = 'migrate:wp-candidates';
    protected $description = 'Migrate WordPress candidate profiles to candidates table';

    public function handle(): int
    {
        $idMap = json_decode(
            file_get_contents(storage_path('app/wp_user_id_map.json')),
            true
        );

        $inserted       = 0;
        $skippedNoMap   = 0;
        $skippedDupe    = 0;

        // Load all candidate posts
        $candidatePosts = DB::connection('wp_import')
            ->table('wp_posts')
            ->where('post_type', 'candidate')
            ->where('post_status', 'publish')
            ->select('ID', 'post_author')
            ->get();

        $this->info("Found {$candidatePosts->count()} candidate posts. Loading meta...");

        $postIds = $candidatePosts->pluck('ID')->toArray();

        // Load all postmeta for candidate posts in one query
        $allMeta = DB::connection('wp_import')
            ->table('wp_postmeta')
            ->whereIn('post_id', $postIds)
            ->get()
            ->groupBy('post_id');

        // Pre-load all term names we might need
        $termNames = DB::connection('wp_import')
            ->table('wp_terms')
            ->pluck('name', 'term_id');

        $batch = [];

        foreach ($candidatePosts as $post) {
            $meta = $allMeta[$post->ID] ?? collect();

            // Prefer _candidate_user_id from postmeta, fall back to post_author
            $wpUserId = (string) ($this->getMeta($meta, '_candidate_user_id') ?: $post->post_author);

            if (!isset($idMap[$wpUserId])) {
                $skippedNoMap++;
                continue;
            }

            $newUlid = $idMap[$wpUserId];

            // Skip if candidate already exists for this user
            if (DB::table('candidates')->where('user_id', $newUlid)->exists()) {
                $skippedDupe++;
                continue;
            }

            // --- Location ---
            $location = $this->getMeta($meta, '_candidate_location');
            if ($location && is_numeric($location)) {
                $location = $termNames[(int) $location] ?? null;
            }

            // --- Category (first term name only) ---
            $rawCategory = $this->getMeta($meta, '_candidate_category');
            $jobCategory = null;
            if ($rawCategory) {
                $unserialized = $this->safeUnserialize($rawCategory);
                if (is_array($unserialized) && !empty($unserialized)) {
                    $firstTermId = reset($unserialized);
                    $jobCategory = is_numeric($firstTermId)
                        ? ($termNames[(int) $firstTermId] ?? null)
                        : (string) $firstTermId;
                } elseif (is_string($unserialized)) {
                    $jobCategory = $unserialized;
                }
            }

            // --- Languages ---
            $languages = null;
            $rawLangs  = $this->getMeta($meta, '_candidate_languages');
            if ($rawLangs) {
                $unserialized = $this->safeUnserialize($rawLangs);
                if (is_array($unserialized)) {
                    $languages = json_encode(array_values(array_filter($unserialized)));
                } elseif (is_string($unserialized) && $unserialized !== '') {
                    $languages = json_encode([$unserialized]);
                }
            }

            // --- Socials ---
            $socials    = null;
            $rawSocials = $this->getMeta($meta, '_candidate_socials');
            if ($rawSocials) {
                $unserialized = $this->safeUnserialize($rawSocials);
                if (is_array($unserialized)) {
                    $mapped = [];
                    foreach ($unserialized as $item) {
                        if (is_array($item) && !empty($item['network'])) {
                            $mapped[] = [
                                'network' => $item['network'],
                                'url'     => $item['url'] ?? '',
                            ];
                        }
                    }
                    if (!empty($mapped)) {
                        $socials = json_encode($mapped);
                    }
                }
            }

            // --- CV path ---
            $cvPath    = null;
            $rawCv     = $this->getMeta($meta, '_candidate_cv_attachment');
            if ($rawCv) {
                $unserialized = $this->safeUnserialize($rawCv);
                if (is_array($unserialized)) {
                    $cvPath = reset($unserialized) ?: null;
                } elseif (is_string($unserialized) && $unserialized !== '') {
                    $cvPath = $unserialized;
                }
            }

            // --- Profile photo ---
            $profilePhotoPath = $this->getMeta($meta, '_candidate_featured_image_img') ?: null;

            // --- Profile percent (stored as 0.81, convert to 81.00) ---
            $rawPct             = $this->getMeta($meta, '_candidate_profile_percent');
            $profileCompletePct = $rawPct !== null ? round((float) $rawPct * 100, 2) : 0;

            $batch[] = [
                'user_id'             => $newUlid,
                'title'               => $this->getMeta($meta, '_candidate_title'),
                'location'            => $location,
                'phone'               => $this->getMeta($meta, '_candidate_phone'),
                'gender'              => $this->getMeta($meta, '_candidate_gender'),
                'age_range'           => $this->getMeta($meta, '_candidate_age'),
                'experience_years'    => $this->getMeta($meta, '_candidate_experience_time'),
                'qualification'       => $this->getMeta($meta, '_candidate_qualification'),
                'languages'           => $languages,
                'job_category'        => $jobCategory,
                'salary_type'         => $this->getMeta($meta, '_candidate_salary_type'),
                'socials'             => $socials,
                'cv_path'             => $cvPath,
                'profile_photo_path'  => $profilePhotoPath,
                'show_profile'        => $this->getMeta($meta, '_candidate_show_profile') === 'show',
                'profile_complete_pct'=> $profileCompletePct,
                'views_count'         => 0,
                'created_at'          => now(),
                'updated_at'          => now(),
            ];

            if (count($batch) >= 100) {
                DB::table('candidates')->insert($batch);
                $inserted += count($batch);
                $batch = [];
                $this->line("Inserted so far: {$inserted}");
            }
        }

        if (!empty($batch)) {
            DB::table('candidates')->insert($batch);
            $inserted += count($batch);
        }

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('Candidates migration complete!');
        $this->info("Inserted:          {$inserted}");
        $this->info("Skipped (no map):  {$skippedNoMap}");
        $this->info("Skipped (dupes):   {$skippedDupe}");
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return self::SUCCESS;
    }

    private function getMeta(\Illuminate\Support\Collection $meta, string $key): ?string
    {
        $item = $meta->firstWhere('meta_key', $key);
        return $item ? ($item->meta_value === '' ? null : $item->meta_value) : null;
    }

    private function safeUnserialize(?string $value): mixed
    {
        if (!$value) return null;
        if (!str_starts_with($value, 'a:') &&
            !str_starts_with($value, 's:') &&
            !str_starts_with($value, 'O:')) {
            return $value;
        }
        try {
            return @unserialize($value);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
