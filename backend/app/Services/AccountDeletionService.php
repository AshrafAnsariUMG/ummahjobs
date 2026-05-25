<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\Employer;
use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AccountDeletionService
{
    public const GRACE_DAYS = 30;
    public const WARN_BEFORE_DAYS = 7;   // send "final warning" email at day 23
    public const CLOSED_LABEL = 'Closed Account';

    /**
     * Mark a user's account for deletion. Revokes their tokens.
     * Caller must have already verified the password.
     */
    public function requestDeletion(User $user, ?string $reason = null): void
    {
        $user->deletion_requested_at = now();
        $user->deletion_warned_at    = null;
        $user->deletion_reason       = $reason ? mb_substr($reason, 0, 500) : null;
        $user->save();

        // Revoke all auth tokens — user must re-auth to restore
        $user->tokens()->delete();

        $this->audit($user->id, $user->id, 'account.deletion_requested', $reason);
    }

    /**
     * Cancel a pending deletion. Returns true if there was one to cancel.
     */
    public function cancelDeletion(User $user): bool
    {
        if (empty($user->deletion_requested_at)) return false;

        $user->deletion_requested_at = null;
        $user->deletion_warned_at    = null;
        $user->deletion_reason       = null;
        $user->save();

        $this->audit($user->id, $user->id, 'account.deletion_cancelled', null);
        return true;
    }

    /**
     * Hard-purge a user and their personal data, anonymising shared data.
     * Runs inside a transaction. Throws on failure.
     */
    public function purge(User $user): void
    {
        DB::transaction(function () use ($user) {
            $userId = $user->id;
            $role   = $user->role;

            if ($role === 'candidate') {
                $this->purgeCandidate($user);
            } elseif ($role === 'employer') {
                $this->purgeEmployer($user);
            }
            // admin role: just delete the user row below; no extra cleanup needed

            // Two-party messages: anonymise sender (null out), leave the body so the other party
            // still sees their conversation. Recipient-side messages are untouched.
            DB::table('messages')->where('sender_id', $userId)->update(['sender_id' => null]);

            // Feedback: anonymise the submitter; admins still need the content to act on it.
            DB::table('feedback')->where('user_id', $userId)->update(['user_id' => null]);

            // Revoke tokens (extra safety in case requestDeletion wasn't called first)
            $user->tokens()->delete();

            // Audit log of the purge BEFORE the user row goes
            $this->audit(null, $userId, 'account.purged', json_encode([
                'email_hash' => hash('sha256', $user->email ?? ''),
                'role'       => $role,
            ]));

            $user->delete();
        });
    }

    private function purgeCandidate(User $user): void
    {
        /** @var Candidate|null $candidate */
        $candidate = $user->candidate;

        if (!$candidate) return;

        // Files on disk
        foreach (['profile_photo_path', 'cv_path', 'cover_photo_path'] as $field) {
            $path = $candidate->{$field} ?? null;
            if ($path) {
                try { Storage::disk('public')->delete($path); }
                catch (\Throwable $e) { Log::warning("Failed to delete {$path}: " . $e->getMessage()); }
            }
        }

        // Job applications: anonymise — keep employer's history, drop PII
        DB::table('job_applications')
            ->where('candidate_id', $candidate->id)
            ->update([
                'candidate_id' => null,
                'cover_letter' => null,
            ]);

        // Reviews this candidate wrote: keep text but unlink author
        DB::table('employer_reviews')
            ->where('reviewer_id', $user->id)
            ->update(['reviewer_id' => null]);

        // Personal preference rows — hard delete
        DB::table('saved_jobs')->where('candidate_id', $candidate->id)->delete();
        DB::table('job_alerts')->where('candidate_id', $candidate->id)->delete();
        DB::table('job_match_cache')->where('candidate_id', $candidate->id)->delete();

        $candidate->delete();
    }

    private function purgeEmployer(User $user): void
    {
        /** @var Employer|null $employer */
        $employer = $user->employer;
        if (!$employer) return;

        $employerId = $employer->id;

        // Detach jobs — orphan them as "Closed Account" so URLs still resolve, history is
        // preserved, but they fall off active listings.
        Job::where('employer_id', $employerId)->update([
            'employer_id'            => null,
            'external_employer_id'   => null,
            'external_employer_name' => self::CLOSED_LABEL,
            'status'                 => 'expired',
        ]);

        // Reviews of this employer: anonymise the employer link (review text stays for posterity
        // but no longer aggregates to a company profile because the profile no longer exists).
        DB::table('employer_reviews')->where('employer_id', $employerId)->update([
            'employer_id' => null,
        ]);

        // Financial rows: keep for accounting, unlink employer
        DB::table('stripe_orders')->where('employer_id', $employerId)->update(['employer_id' => null]);
        DB::table('coupon_uses')->where('employer_id', $employerId)->update(['employer_id' => null]);

        // Owned data — hard delete (paid product, no compliance reason to keep)
        DB::table('employer_packages')->where('employer_id', $employerId)->delete();

        // Files on disk
        foreach (['logo_path', 'cover_photo_path'] as $field) {
            $path = $employer->{$field} ?? null;
            if ($path) {
                try { Storage::disk('public')->delete($path); }
                catch (\Throwable $e) { Log::warning("Failed to delete {$path}: " . $e->getMessage()); }
            }
        }

        $employer->delete();
    }

    private function audit(?string $adminId, ?string $targetUserId, string $action, ?string $notes): void
    {
        DB::table('admin_audit_log')->insert([
            'admin_id'       => $adminId ?? 'system',
            'target_user_id' => $targetUserId,
            'action'         => $action,
            'notes'          => $notes,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }
}
