<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MigrateWpUsers extends Command
{
    protected $signature = 'migrate:wp-users';
    protected $description = 'Migrate WordPress users to UmmahJobs users table';

    public function handle(): int
    {
        $skipEmails = [
            'test@test.com',
            'test@test1.com',
            'alisha@muslimadnetwork.com',
            'marketing@muslimadnetwork.com',
            'ashraf@muslimadnetwork.com',
        ];

        $skipLogins = ['test', 'test_27540', 'tabishasan'];

        $inserted         = 0;
        $skippedDupe      = 0;
        $skippedTest      = 0;
        $skippedMalformed = 0;
        $userIdMap        = [];

        // Load all capabilities meta into memory for fast lookup
        $capabilities = DB::connection('wp_import')
            ->table('wp_usermeta')
            ->where('meta_key', 'wp_capabilities')
            ->pluck('meta_value', 'user_id');

        DB::connection('wp_import')
            ->table('wp_users')
            ->orderBy('ID')
            ->chunk(200, function ($wpUsers) use (
                $capabilities,
                $skipEmails,
                $skipLogins,
                &$inserted,
                &$skippedDupe,
                &$skippedTest,
                &$skippedMalformed,
                &$userIdMap
            ) {
                $batch = [];

                foreach ($wpUsers as $wpUser) {
                    // Skip by login
                    if (in_array($wpUser->user_login, $skipLogins)) {
                        $skippedTest++;
                        continue;
                    }

                    $email = strtolower(trim($wpUser->user_email));

                    // Skip malformed emails (no @)
                    if (!str_contains($email, '@')) {
                        $skippedMalformed++;
                        continue;
                    }

                    // Skip emails with + (WP import artifacts)
                    if (str_contains($email, '+')) {
                        $skippedMalformed++;
                        continue;
                    }

                    // Skip known test/junk emails
                    if (in_array($email, $skipEmails)) {
                        $skippedTest++;
                        continue;
                    }

                    // Skip if email already exists in UmmahJobs users table
                    if (DB::table('users')->where('email', $email)->exists()) {
                        $skippedDupe++;
                        continue;
                    }

                    // Determine role from WP capabilities
                    $cap = $capabilities[$wpUser->ID] ?? '';
                    if (str_contains($cap, 'wp_job_board_pro_employer')) {
                        $role = 'employer';
                    } elseif (str_contains($cap, 'administrator')) {
                        $role = 'admin';
                    } else {
                        $role = 'candidate';
                    }

                    $ulid = (string) Str::ulid();
                    $userIdMap[(string) $wpUser->ID] = $ulid;

                    $batch[] = [
                        'id'                => $ulid,
                        'email'             => $email,
                        'password'          => $wpUser->user_pass,
                        'display_name'      => $wpUser->display_name ?: $wpUser->user_login,
                        'role'              => $role,
                        'legacy_password'   => true,
                        'is_active'         => true,
                        'email_verified_at' => now(),
                        'created_at'        => $wpUser->user_registered,
                        'updated_at'        => now(),
                    ];
                }

                if (!empty($batch)) {
                    DB::table('users')->insert($batch);
                    $inserted += count($batch);
                }

                $this->line("Chunk done — inserted so far: {$inserted}");
            });

        // Save WP user ID → ULID mapping for later migrations (S4b+)
        file_put_contents(
            storage_path('app/wp_user_id_map.json'),
            json_encode($userIdMap, JSON_PRETTY_PRINT)
        );

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('Migration complete!');
        $this->info("Inserted:            {$inserted}");
        $this->info("Skipped (dupes):     {$skippedDupe}");
        $this->info("Skipped (test):      {$skippedTest}");
        $this->info("Skipped (bad email): {$skippedMalformed}");
        $this->info('ID map saved to:     storage/app/wp_user_id_map.json');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return self::SUCCESS;
    }
}
