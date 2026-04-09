<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('job_categories')->count() === 0) {
            DB::table('job_categories')->insert([
                ['name' => 'Accounting & Finance',       'slug' => 'accounting-finance',        'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Administrative',             'slug' => 'administrative',             'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Banking & Finance',          'slug' => 'banking-finance',            'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Customer Service',           'slug' => 'customer-service',           'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Design',                     'slug' => 'design',                     'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Education & Instruction',    'slug' => 'education-instruction',      'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Engineering',                'slug' => 'engineering',                'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Food & Beverage',            'slug' => 'food-beverage',              'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Health & Care',              'slug' => 'health-care',                'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Hospitality & Tourism',      'slug' => 'hospitality-tourism',        'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Human Resources',            'slug' => 'human-resources',            'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Imam & Islamic Studies',     'slug' => 'imam-islamic-studies',       'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'IT & Software Development',  'slug' => 'it-software-development',    'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Legal',                      'slug' => 'legal',                      'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Management',                 'slug' => 'management',                 'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Marketing',                  'slug' => 'marketing',                  'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Media & Communications',     'slug' => 'media-communications',       'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Medical & Nursing',          'slug' => 'medical-nursing',            'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Nonprofit & NGO',            'slug' => 'nonprofit-ngo',              'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Personal Care & Home Health','slug' => 'personal-care-home-health',  'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Project Management',         'slug' => 'project-management',         'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Remote Only',                'slug' => 'remote-only',                'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Retail',                     'slug' => 'retail',                     'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Sales',                      'slug' => 'sales',                      'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Scientific Research',        'slug' => 'scientific-research',        'icon' => null, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Security & Public Safety',   'slug' => 'security-public-safety',     'icon' => null, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }
}
