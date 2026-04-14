<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $settings = [
            // General
            [
                'key'         => 'site_name',
                'value'       => 'UmmahJobs',
                'type'        => 'text',
                'group'       => 'general',
                'label'       => 'Site Name',
                'description' => 'Used in emails, page titles and the browser tab',
            ],
            [
                'key'         => 'site_email',
                'value'       => 'hello@ummahjobs.com',
                'type'        => 'text',
                'group'       => 'general',
                'label'       => 'Contact Email',
                'description' => 'Displayed on the contact page and in footers',
            ],
            [
                'key'         => 'announcement_enabled',
                'value'       => '0',
                'type'        => 'boolean',
                'group'       => 'general',
                'label'       => 'Show Announcement Bar',
                'description' => 'Display a site-wide announcement banner above the navbar',
            ],
            [
                'key'         => 'announcement_text',
                'value'       => '',
                'type'        => 'text',
                'group'       => 'general',
                'label'       => 'Announcement Text',
                'description' => 'Text shown in the announcement bar when enabled',
            ],
            [
                'key'         => 'announcement_url',
                'value'       => '',
                'type'        => 'url',
                'group'       => 'general',
                'label'       => 'Announcement Link URL',
                'description' => 'Optional link for the announcement bar (leave blank for no link)',
            ],
            [
                'key'         => 'announcement_color',
                'value'       => '#033BB0',
                'type'        => 'color',
                'group'       => 'general',
                'label'       => 'Announcement Bar Color',
                'description' => 'Background color of the announcement bar',
            ],

            // Appearance
            [
                'key'         => 'logo_path',
                'value'       => '',
                'type'        => 'image',
                'group'       => 'appearance',
                'label'       => 'Site Logo',
                'description' => 'Upload a logo image (PNG/JPG/SVG, recommended ≤ 300×80px)',
            ],
            [
                'key'         => 'brand_color_primary',
                'value'       => '#033BB0',
                'type'        => 'color',
                'group'       => 'appearance',
                'label'       => 'Primary Brand Color',
                'description' => 'Main blue used for buttons, links and accents',
            ],
            [
                'key'         => 'brand_color_secondary',
                'value'       => '#0FBB0F',
                'type'        => 'color',
                'group'       => 'appearance',
                'label'       => 'Secondary Brand Color',
                'description' => 'Green used for success states, Halal badges and hover accents',
            ],

            // Homepage
            [
                'key'         => 'hero_heading_line1',
                'value'       => 'Find Halal',
                'type'        => 'text',
                'group'       => 'homepage',
                'label'       => 'Hero Heading Line 1',
                'description' => 'First line of the hero heading (rendered in green)',
            ],
            [
                'key'         => 'hero_heading_line2',
                'value'       => 'Opportunity',
                'type'        => 'text',
                'group'       => 'homepage',
                'label'       => 'Hero Heading Line 2',
                'description' => 'Second line of the hero heading (rendered in blue)',
            ],
            [
                'key'         => 'hero_subheading',
                'value'       => 'Browse thousands of jobs at Muslim-owned companies and halal-friendly employers.',
                'type'        => 'textarea',
                'group'       => 'homepage',
                'label'       => 'Hero Subheading',
                'description' => 'Subheading text below the hero heading',
            ],
            [
                'key'         => 'stat_candidates',
                'value'       => '2,000+',
                'type'        => 'text',
                'group'       => 'homepage',
                'label'       => 'Stats — Candidates',
                'description' => 'e.g. "2,000+" — shown in the stats row in the hero search bar',
            ],
            [
                'key'         => 'stat_employers',
                'value'       => '100+',
                'type'        => 'text',
                'group'       => 'homepage',
                'label'       => 'Stats — Employers',
                'description' => 'e.g. "100+" — shown in the stats row in the hero search bar',
            ],
            [
                'key'         => 'stat_jobs',
                'value'       => '247',
                'type'        => 'text',
                'group'       => 'homepage',
                'label'       => 'Stats — New Jobs This Week',
                'description' => 'Number shown on the floating card over the hero illustration',
            ],

            // SEO
            [
                'key'         => 'seo_title',
                'value'       => 'UmmahJobs — Halal Careers for the Muslim Community',
                'type'        => 'text',
                'group'       => 'seo',
                'label'       => 'Default Page Title',
                'description' => 'Used as the <title> tag on the homepage (max 60 chars recommended)',
            ],
            [
                'key'         => 'seo_description',
                'value'       => 'Find jobs at Muslim-owned companies and halal-friendly employers. Browse thousands of opportunities tailored for the Muslim community.',
                'type'        => 'textarea',
                'group'       => 'seo',
                'label'       => 'Default Meta Description',
                'description' => 'Used as the <meta name="description"> on the homepage (max 160 chars)',
            ],
            [
                'key'         => 'seo_og_image',
                'value'       => '',
                'type'        => 'image',
                'group'       => 'seo',
                'label'       => 'Open Graph Image',
                'description' => 'Shown when the site is shared on social media (1200×630px recommended)',
            ],

            // Social
            [
                'key'         => 'social_twitter',
                'value'       => '',
                'type'        => 'url',
                'group'       => 'social',
                'label'       => 'Twitter / X URL',
                'description' => 'Full URL to the Twitter/X profile',
            ],
            [
                'key'         => 'social_linkedin',
                'value'       => '',
                'type'        => 'url',
                'group'       => 'social',
                'label'       => 'LinkedIn URL',
                'description' => 'Full URL to the LinkedIn page',
            ],
            [
                'key'         => 'social_instagram',
                'value'       => '',
                'type'        => 'url',
                'group'       => 'social',
                'label'       => 'Instagram URL',
                'description' => 'Full URL to the Instagram profile',
            ],
            [
                'key'         => 'social_facebook',
                'value'       => '',
                'type'        => 'url',
                'group'       => 'social',
                'label'       => 'Facebook URL',
                'description' => 'Full URL to the Facebook page',
            ],
            // General — maintenance
            [
                'key'         => 'maintenance_mode',
                'value'       => '0',
                'type'        => 'boolean',
                'group'       => 'general',
                'label'       => 'Maintenance Mode',
                'description' => 'When enabled, the site displays a maintenance page to visitors',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, ['created_at' => $now, 'updated_at' => $now])
            );
        }

        $this->command->info('Site settings seeded (' . count($settings) . ' records).');
    }
}
