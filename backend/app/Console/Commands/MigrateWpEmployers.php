<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MigrateWpEmployers extends Command
{
    protected $signature = 'migrate:wp-employers';
    protected $description = 'Migrate WordPress employer profiles to employers table';

    public function handle(): int
    {
        $idMap = json_decode(
            file_get_contents(storage_path('app/wp_user_id_map.json')),
            true
        );

        $inserted     = 0;
        $skippedNoMap = 0;
        $skippedDupe  = 0;

        // Load all employer posts
        $employerPosts = DB::connection('wp_import')
            ->table('wp_posts')
            ->where('post_type', 'employer')
            ->where('post_status', 'publish')
            ->select('ID', 'post_author', 'post_title')
            ->get();

        $this->info("Found {$employerPosts->count()} employer posts. Loading meta...");

        $postIds = $employerPosts->pluck('ID')->toArray();

        // Load all postmeta in one query
        $allMeta = DB::connection('wp_import')
            ->table('wp_postmeta')
            ->whereIn('post_id', $postIds)
            ->get()
            ->groupBy('post_id');

        // Pre-load term names
        $termNames = DB::connection('wp_import')
            ->table('wp_terms')
            ->pluck('name', 'term_id');

        foreach ($employerPosts as $post) {
            $meta = $allMeta[$post->ID] ?? collect();

            // Prefer _employer_user_id from postmeta, fall back to post_author
            $wpUserId = (string) ($this->getMeta($meta, '_employer_user_id') ?: $post->post_author);

            if (!isset($idMap[$wpUserId])) {
                $skippedNoMap++;
                continue;
            }

            $newUlid = $idMap[$wpUserId];

            // Skip if employer already exists for this user
            if (DB::table('employers')->where('user_id', $newUlid)->exists()) {
                $skippedDupe++;
                continue;
            }

            // --- Company name ---
            $companyName = $this->getMeta($meta, '_employer_title')
                ?: $post->post_title
                ?: $this->getMeta($meta, '_employer_display_name')
                ?: 'Unknown Company';

            // --- Slug with uniqueness check ---
            $baseSlug = Str::slug($companyName) ?: 'employer';
            $slug     = $baseSlug;
            if (DB::table('employers')->where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . rand(1000, 9999);
            }

            // --- Category (first term name) ---
            $category    = null;
            $rawCategory = $this->getMeta($meta, '_employer_category');
            if ($rawCategory) {
                $unserialized = $this->safeUnserialize($rawCategory);
                if (is_array($unserialized) && !empty($unserialized)) {
                    $firstTermId = reset($unserialized);
                    $category    = is_numeric($firstTermId)
                        ? ($termNames[(int) $firstTermId] ?? null)
                        : (string) $firstTermId;
                } elseif (is_string($unserialized) && $unserialized !== '') {
                    $category = $unserialized;
                }
            }

            // --- Socials ---
            $socials    = null;
            $rawSocials = $this->getMeta($meta, '_employer_socials');
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

            // --- Logo path (already a URL in this WP install) ---
            $logoPath = $this->getMeta($meta, '_employer_featured_image_img') ?: null;

            // --- Cover photo ---
            $coverPhotoPath = $this->getMeta($meta, '_employer_cover_photo_img') ?: null;

            // --- Map location ---
            $mapLat = null;
            $mapLng = null;
            $rawMap = $this->getMeta($meta, '_employer_map_location');
            if ($rawMap) {
                $unserialized = $this->safeUnserialize($rawMap);
                if (is_array($unserialized)) {
                    $lat = $unserialized['latitude'] ?? '';
                    $lng = $unserialized['longitude'] ?? '';
                    $mapLat = ($lat !== '' && $lat !== null) ? (float) $lat : null;
                    $mapLng = ($lng !== '' && $lng !== null) ? (float) $lng : null;
                }
            }

            DB::table('employers')->insert([
                'user_id'         => $newUlid,
                'company_name'    => $companyName,
                'slug'            => $slug,
                'category'        => $category,
                'description'     => $this->getMeta($meta, '_employer_description'),
                'email'           => $this->getMeta($meta, '_employer_email'),
                'phone'           => $this->getMeta($meta, '_employer_phone'),
                'address'         => $this->getMeta($meta, '_employer_address'),
                'socials'         => $socials,
                'logo_path'       => $logoPath,
                'cover_photo_path'=> $coverPhotoPath,
                'map_lat'         => $mapLat,
                'map_lng'         => $mapLng,
                'is_verified'     => false,
                'show_profile'    => $this->getMeta($meta, '_employer_show_profile') === 'show',
                'views_count'     => 0,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            $inserted++;
        }

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('Employers migration complete!');
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
