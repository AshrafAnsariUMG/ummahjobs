<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('packages')->count() === 0) {
            DB::table('packages')->insert([
                [
                    'name'                => 'Basic',
                    'price'               => 8.40,
                    'post_count'          => 1,
                    'post_type'           => 'regular',
                    'duration_days'       => 40,
                    'includes_newsletter' => false,
                    'is_active'           => true,
                    'created_at'          => now(),
                    'updated_at'          => now(),
                ],
                [
                    'name'                => 'Standard',
                    'price'               => 38.50,
                    'post_count'          => 1,
                    'post_type'           => 'featured',
                    'duration_days'       => 40,
                    'includes_newsletter' => false,
                    'is_active'           => true,
                    'created_at'          => now(),
                    'updated_at'          => now(),
                ],
                [
                    'name'                => 'Extended',
                    'price'               => 70.00,
                    'post_count'          => 3,
                    'post_type'           => 'featured',
                    'duration_days'       => 60,
                    'includes_newsletter' => true,
                    'is_active'           => true,
                    'created_at'          => now(),
                    'updated_at'          => now(),
                ],
            ]);
        }
    }
}
