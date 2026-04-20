<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SiteSettingsService
{
    private const CACHE_KEY = 'site_settings_all';
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Return all settings as key => value map (cached).
     */
    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return DB::table('site_settings')
                ->get()
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Return a single setting value (uses cached all()).
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    /**
     * Update one setting and bust the cache.
     */
    public function set(string $key, ?string $value): void
    {
        DB::table('site_settings')->where('key', $key)->update([
            'value'      => $value,
            'updated_at' => now(),
        ]);
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Update multiple settings at once.
     */
    public function setMany(array $data): void
    {
        foreach ($data as $key => $value) {
            DB::table('site_settings')->where('key', $key)->update([
                'value'      => $value,
                'updated_at' => now(),
            ]);
        }
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Return all settings with full metadata, grouped by group.
     */
    public function grouped(): array
    {
        $rows = DB::table('site_settings')->orderBy('group')->orderBy('key')->get();

        $groups = [];
        foreach ($rows as $row) {
            $groups[$row->group][] = (array) $row;
        }

        return $groups;
    }

    /**
     * Return only the settings safe to expose publicly (excludes nothing sensitive,
     * but limits to the keys the frontend actually needs).
     */
    public function publicSettings(): array
    {
        $publicKeys = [
            'site_name',
            'site_email',
            'logo_path',
            'brand_color_primary',
            'brand_color_secondary',
            'announcement_enabled',
            'announcement_text',
            'announcement_url',
            'announcement_color',
            'hero_heading_line1',
            'hero_heading_line2',
            'hero_subheading',
            'hero_font_size_desktop',
            'hero_font_size_mobile',
            'illustration_height',
            'stat_employers',
            'stat_jobs',
            'seo_title',
            'seo_description',
            'seo_og_image',
            'social_twitter',
            'social_linkedin',
            'social_instagram',
            'social_facebook',
        ];

        $all = $this->all();
        return array_intersect_key($all, array_flip($publicKeys));
    }
}
