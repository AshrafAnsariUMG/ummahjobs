<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GrantMigratedPackageCredits extends Command
{
    protected $signature = 'migrate:grant-credits';
    protected $description = 'Grant package credits to migrated employers who had active paid packages on the old platform';

    public function handle(): int
    {
        $grants = [
            [
                'email'        => 'career@celebratemercy.com',
                'package_name' => 'Standard',
                'credits'      => 2,
                'note'         => 'Migrated credits from old UmmahJobs platform',
            ],
            [
                'email'        => 'ash@echotalk.ai',
                'package_name' => 'Basic',
                'credits'      => 1,
                'note'         => 'Migrated credits from old UmmahJobs platform',
            ],
            [
                'email'        => 'Adella.berlianti@launchgood.com',
                'package_name' => 'Extended',
                'credits'      => 3,
                'note'         => 'Migrated credits — consolidated from 2 packages',
            ],
        ];

        $admin = DB::table('users')->where('role', 'admin')->first();
        if (!$admin) {
            $this->error('No admin user found. Cannot proceed.');
            return self::FAILURE;
        }

        foreach ($grants as $grant) {
            // Find user (case-insensitive)
            $user = DB::table('users')
                ->whereRaw('LOWER(email) = ?', [strtolower($grant['email'])])
                ->first();

            if (!$user) {
                $this->warn("User not found: {$grant['email']} — skipping");
                continue;
            }

            // Find employer
            $employer = DB::table('employers')
                ->where('user_id', $user->id)
                ->first();

            if (!$employer) {
                $this->warn("Employer not found for user {$grant['email']} — skipping");
                continue;
            }

            // Find package
            $package = DB::table('packages')
                ->where('name', $grant['package_name'])
                ->first();

            if (!$package) {
                $this->warn("Package not found: {$grant['package_name']} — skipping");
                continue;
            }

            // Idempotency check
            $exists = DB::table('employer_packages')
                ->where('employer_id', $employer->id)
                ->where('package_id', $package->id)
                ->where('granted_by_admin', true)
                ->exists();

            if ($exists) {
                $this->line("Already granted: {$grant['email']} — skipping");
                continue;
            }

            // Insert employer_package
            DB::table('employer_packages')->insert([
                'employer_id'       => $employer->id,
                'package_id'        => $package->id,
                'stripe_order_id'   => null,
                'credits_remaining' => $grant['credits'],
                'duration_days'     => $package->duration_days,
                'granted_by_admin'  => true,
                'expires_at'        => null,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            // Log to admin audit log
            DB::table('admin_audit_log')->insert([
                'admin_id'       => $admin->id,
                'target_user_id' => $user->id,
                'action'         => 'grant_credits',
                'notes'          => $grant['note'] . ' — '
                                    . $grant['credits'] . ' x '
                                    . $grant['package_name'] . ' credits',
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            $this->info("Granted {$grant['credits']} x {$grant['package_name']} credits to {$grant['email']}");
        }

        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('Package credits granted successfully!');
        $this->info('Run php artisan tinker to verify.');
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return self::SUCCESS;
    }
}
