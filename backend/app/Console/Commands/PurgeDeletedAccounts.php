<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AccountDeletionService;
use App\Services\EmailTemplateService as ET;
use App\Services\GmailMailerService;
use App\Services\MattermostService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PurgeDeletedAccounts extends Command
{
    protected $signature = 'accounts:purge-deleted';
    protected $description = 'Purge accounts whose grace period has elapsed, and send 7-day warnings.';

    public function handle(): int
    {
        $service = new AccountDeletionService();
        $now     = now();

        // ── 1. Send 7-day warnings ──────────────────────────────────────────
        $warnCutoff = $now->copy()->subDays(AccountDeletionService::GRACE_DAYS - AccountDeletionService::WARN_BEFORE_DAYS);
        $toWarn = User::whereNotNull('deletion_requested_at')
            ->whereNull('deletion_warned_at')
            ->where('deletion_requested_at', '<=', $warnCutoff)
            ->get();

        foreach ($toWarn as $user) {
            $this->sendFinalWarningEmail($user);
            $user->deletion_warned_at = $now;
            $user->save();
            $this->info("Warned: {$user->email}");
        }

        // ── 2. Purge accounts past grace period ─────────────────────────────
        $purgeCutoff = $now->copy()->subDays(AccountDeletionService::GRACE_DAYS);
        $toPurge = User::whereNotNull('deletion_requested_at')
            ->where('deletion_requested_at', '<=', $purgeCutoff)
            ->get();

        $purged = [];
        foreach ($toPurge as $user) {
            $snapshot = [
                'email' => $user->email,
                'name'  => $user->display_name,
                'role'  => $user->role,
            ];
            try {
                $service->purge($user);
                $purged[] = $snapshot;
                $this->info("Purged: {$snapshot['email']}");
            } catch (\Throwable $e) {
                Log::error("Failed to purge user {$snapshot['email']}: " . $e->getMessage());
                $this->error("Failed: {$snapshot['email']} — " . $e->getMessage());
            }
        }

        // Mattermost summary
        if (count($purged) > 0 || count($toWarn) > 0) {
            try {
                $lines = "### :wastebasket: Account purge summary\n"
                    . "**Warnings sent:** " . count($toWarn) . "\n"
                    . "**Accounts purged:** " . count($purged);
                if (count($purged) > 0) {
                    $lines .= "\n\n**Purged users:**\n";
                    foreach ($purged as $p) {
                        $lines .= "- {$p['name']} ({$p['email']}) — {$p['role']}\n";
                    }
                }
                (new MattermostService())->post($lines);
            } catch (\Throwable $e) {
                // ignore
            }
        }

        $this->info(sprintf('Done. %d warned, %d purged.', count($toWarn), count($purged)));
        return self::SUCCESS;
    }

    private function sendFinalWarningEmail(User $user): void
    {
        try {
            $purgeDate = $user->deletion_requested_at->copy()
                ->addDays(AccountDeletionService::GRACE_DAYS);
            $frontendUrl = rtrim(config('services.app.frontend_url', 'http://localhost:3003'), '/');
            $restoreUrl  = $frontendUrl . '/login';
            $body = ET::heading('Final reminder — your account will be deleted soon')
                . ET::paragraph("Assalamu Alaikum,")
                . ET::paragraph("This is a final reminder that your UmmahJobs account is scheduled for permanent deletion on <strong>" . $purgeDate->format('j F Y') . "</strong>.")
                . ET::paragraph("If you want to keep your account, sign in before that date and we'll restore everything:")
                . ET::button($restoreUrl, 'Restore my account')
                . ET::infoBox('<p style="margin:0;font-size:13px;color:#92400E;">After ' . $purgeDate->format('j F Y') . ', your profile, files, applications, and personal data will be permanently removed. This cannot be undone.</p>', '#FEF3C7', '#F59E0B')
                . ET::paragraph("JazakAllah Khayran,<br>The UmmahJobs Team");
            $html = ET::wrap("Final reminder: UmmahJobs account deletion in 7 days", $body);
            (new GmailMailerService())->sendHtml($user->email, 'Final reminder: your UmmahJobs account will be deleted soon', $html);
        } catch (\Throwable $e) {
            Log::warning("Final warning email failed for {$user->email}: " . $e->getMessage());
        }
    }
}
