<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            JobCategorySeeder::class,
            JobTypeSeeder::class,
            PackageSeeder::class,
        ]);
    }
}
