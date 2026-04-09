<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobTypeSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('job_types')->count() === 0) {
            DB::table('job_types')->insert([
                ['name' => 'Full Time',  'slug' => 'full-time',  'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Part Time',  'slug' => 'part-time',  'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Contract',   'slug' => 'contract',   'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Freelance',  'slug' => 'freelance',  'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Internship', 'slug' => 'internship', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Temporary',  'slug' => 'temporary',  'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Volunteer',  'slug' => 'volunteer',  'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }
}
