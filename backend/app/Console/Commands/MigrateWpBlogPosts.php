<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateWpBlogPosts extends Command
{
    protected $signature = 'migrate:wp-blog-posts';
    protected $description = 'Migrate WordPress blog posts to blog_posts table';

    public function handle(): int
    {
        $inserted    = 0;
        $skippedDupe = 0;

        // Find an admin user to set as author
        $admin   = DB::table('users')->where('role', 'admin')->first();
        $adminId = $admin?->id;

        // Get the WP uploads base URL
        $siteUrl = DB::connection('wp_import')
            ->table('wp_options')
            ->where('option_name', 'siteurl')
            ->value('option_value') ?: 'https://ummahjobs.com';
        $uploadsBase = rtrim($siteUrl, '/') . '/wp-content/uploads/';

        // Load all published posts
        $wpPosts = DB::connection('wp_import')
            ->table('wp_posts')
            ->where('post_type', 'post')
            ->where('post_status', 'publish')
            ->get();

        $this->info("Found {$wpPosts->count()} blog posts to migrate...");

        // Pre-load all term relationships and categories for these posts
        $postIds = $wpPosts->pluck('ID')->toArray();

        $categoryMap = DB::connection('wp_import')
            ->table('wp_term_relationships as tr')
            ->join('wp_term_taxonomy as tt', 'tr.term_taxonomy_id', '=', 'tt.term_taxonomy_id')
            ->join('wp_terms as t', 'tt.term_id', '=', 't.term_id')
            ->whereIn('tr.object_id', $postIds)
            ->where('tt.taxonomy', 'category')
            ->where('t.name', '!=', 'Uncategorized')
            ->select('tr.object_id', 't.name')
            ->get()
            ->groupBy('object_id');

        // Pre-load all thumbnail IDs for these posts
        $thumbnailIds = DB::connection('wp_import')
            ->table('wp_postmeta')
            ->whereIn('post_id', $postIds)
            ->where('meta_key', '_thumbnail_id')
            ->pluck('meta_value', 'post_id');

        // Pre-load attached file paths for all thumbnails
        $attachedFiles = collect();
        if ($thumbnailIds->isNotEmpty()) {
            $attachedFiles = DB::connection('wp_import')
                ->table('wp_postmeta')
                ->whereIn('post_id', $thumbnailIds->values())
                ->where('meta_key', '_wp_attached_file')
                ->pluck('meta_value', 'post_id')
                ->mapWithKeys(fn ($path, $attachId) => [$attachId => $path]);
        }

        foreach ($wpPosts as $wpPost) {
            // Skip if slug already exists
            if (DB::table('blog_posts')->where('slug', $wpPost->post_name)->exists()) {
                $skippedDupe++;
                continue;
            }

            // --- Featured image ---
            $featuredImageUrl = null;
            $thumbnailId = $thumbnailIds[$wpPost->ID] ?? null;
            if ($thumbnailId) {
                $attachedFile = $attachedFiles[$thumbnailId] ?? null;
                if ($attachedFile) {
                    $featuredImageUrl = $uploadsBase . $attachedFile;
                }
            }

            // --- Category (first non-Uncategorized, fall back to Uncategorized) ---
            $category = null;
            $termRows = $categoryMap[$wpPost->ID] ?? collect();
            if ($termRows->isNotEmpty()) {
                $category = $termRows->first()->name;
            } else {
                // Fall back: check including Uncategorized
                $fallback = DB::connection('wp_import')
                    ->table('wp_term_relationships as tr')
                    ->join('wp_term_taxonomy as tt', 'tr.term_taxonomy_id', '=', 'tt.term_taxonomy_id')
                    ->join('wp_terms as t', 'tt.term_id', '=', 't.term_id')
                    ->where('tr.object_id', $wpPost->ID)
                    ->where('tt.taxonomy', 'category')
                    ->value('t.name');
                $category = $fallback;
            }

            // --- Excerpt ---
            if (!empty(trim($wpPost->post_excerpt))) {
                $excerpt = trim($wpPost->post_excerpt);
            } else {
                $plain   = strip_tags($wpPost->post_content);
                $plain   = preg_replace('/\s+/', ' ', trim($plain));
                $excerpt = mb_strlen($plain) > 200
                    ? mb_substr($plain, 0, 200) . '...'
                    : $plain;
            }

            DB::table('blog_posts')->insert([
                'author_id'           => $adminId,
                'title'               => $wpPost->post_title,
                'slug'                => $wpPost->post_name,
                'content'             => $wpPost->post_content,
                'excerpt'             => $excerpt ?: null,
                'category'            => $category,
                'featured_image_path' => $featuredImageUrl,
                'published_at'        => $wpPost->post_date,
                'created_at'          => $wpPost->post_date,
                'updated_at'          => $wpPost->post_modified,
            ]);

            $inserted++;
            $this->line("  ✓ {$wpPost->post_title}");
        }

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('Blog posts migration complete!');
        $this->info("Inserted:        {$inserted}");
        $this->info("Skipped (dupes): {$skippedDupe}");
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return self::SUCCESS;
    }
}
