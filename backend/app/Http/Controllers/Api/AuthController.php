<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Employer;
use App\Models\User;
use App\Services\EmailTemplateService as ET;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|min:8|confirmed',
            'role'         => 'required|in:candidate,employer',
            'company_name' => 'required_if:role,employer',
        ]);

        $user = User::create([
            'id'             => (string) Str::ulid(),
            'display_name'   => $request->name,
            'email'          => $request->email,
            'password'       => bcrypt($request->password),
            'role'           => $request->role,
            'legacy_password'=> false,
        ]);

        if ($request->role === 'candidate') {
            Candidate::firstOrCreate(['user_id' => $user->id]);
        } elseif ($request->role === 'employer') {
            $slug = Str::slug($request->company_name);
            if (Employer::where('slug', $slug)->exists()) {
                $slug .= '-' . rand(1000, 9999);
            }
            Employer::create([
                'user_id'      => $user->id,
                'company_name' => $request->company_name,
                'slug'         => $slug,
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user'  => $this->userPayload($user),
            'token' => $token,
            'role'  => $user->role,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(
                ['message' => 'No account found with this email address.'],
                401
            );
        }

        if ($user->legacy_password) {
            $token = Password::broker()->createToken($user);
            $url = config('app.frontend_url') . '/reset-password?token='
                . urlencode($token) . '&email='
                . urlencode($user->email);
            try {
                $mailer = new MailService();
                $resetButton = ET::button($url, 'Set New Password');
                $body = ET::heading("We've upgraded our platform")
                    . ET::paragraph("Assalamu Alaikum,")
                    . ET::paragraph("We've made some improvements to UmmahJobs and you'll need to set a new password to continue.")
                    . ET::paragraph("Click the button below to set your new password:")
                    . $resetButton
                    . ET::infoBox(
                        '<p style="margin:0;font-size:13px;color:#1E40AF;">This link expires in <strong>60 minutes</strong>. If you did not request this, you can safely ignore this email.</p>'
                    )
                    . ET::paragraph("JazakAllah Khayran,<br>The UmmahJobs Team");
                $html = ET::wrap("We've upgraded UmmahJobs — please set a new password", $body);
                $mailer->sendHtml($user->email, 'Reset your UmmahJobs password', $html);
            } catch (\Exception $e) {
                Log::error('Failed to send legacy password reset email: ' . $e->getMessage());
            }

            return response()->json([
                'error'   => 'legacy_password',
                'message' => "We've upgraded our platform. We've sent a password reset link to your email — it only takes a moment to set a new password and you're good to go.",
            ], 403);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Account suspended.'], 403);
        }

        // Account is pending deletion: don't mint a token; let the user explicitly restore.
        if ($user->deletion_requested_at) {
            $purgeDate = $user->deletion_requested_at
                ->copy()
                ->addDays(\App\Services\AccountDeletionService::GRACE_DAYS);
            return response()->json([
                'error'             => 'pending_deletion',
                'message'           => 'Your account is scheduled for deletion. Confirm your password again on the restore screen to cancel.',
                'purge_at'          => $purgeDate->toIso8601String(),
                'requested_at'      => $user->deletion_requested_at->toIso8601String(),
                'restore_email'     => $user->email,
            ], 403);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user'  => $this->userPayload($user),
            'token' => $token,
            'role'  => $user->role,
        ]);
    }

    /**
     * Schedule the authenticated user's account for deletion. Requires password re-auth
     * and a "DELETE" confirmation string to prevent accidental wipes.
     */
    public function requestDeletion(Request $request)
    {
        $request->validate([
            'password'      => 'required',
            'confirmation'  => 'required|in:DELETE',
            'reason'        => 'nullable|string|max:500',
        ]);

        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 422);
        }

        if ($user->deletion_requested_at) {
            return response()->json(['message' => 'Deletion already pending.'], 422);
        }

        $service = new \App\Services\AccountDeletionService();
        $service->requestDeletion($user, $request->reason);

        // Confirmation email — fire & forget
        try {
            $purgeDate = $user->deletion_requested_at->copy()
                ->addDays(\App\Services\AccountDeletionService::GRACE_DAYS);
            $frontendUrl = rtrim(config('services.app.frontend_url', 'http://localhost:3003'), '/');
            $restoreUrl  = $frontendUrl . '/login';
            $body = ET::heading('Your account is scheduled for deletion')
                . ET::paragraph("Assalamu Alaikum,")
                . ET::paragraph("We've received your request to delete your UmmahJobs account. Your account is now scheduled for permanent deletion on <strong>" . $purgeDate->format('j F Y') . "</strong>.")
                . ET::paragraph("Changed your mind? You can restore your account any time before that date by signing back in:")
                . ET::button($restoreUrl, 'Restore my account')
                . ET::infoBox('<p style="margin:0;font-size:13px;color:#1E40AF;">After ' . $purgeDate->format('j F Y') . ', your profile, files, and personal data will be permanently removed. This cannot be undone.</p>')
                . ET::paragraph("JazakAllah Khayran,<br>The UmmahJobs Team");
            $html = ET::wrap("Your UmmahJobs account is scheduled for deletion", $body);
            (new \App\Services\GmailMailerService())->sendHtml($user->email, 'Your UmmahJobs account is scheduled for deletion', $html);
        } catch (\Throwable $e) {
            Log::warning('Account deletion request email failed: ' . $e->getMessage());
        }

        // Mattermost — fire & forget
        try {
            $name = $user->display_name ?: $user->email;
            $role = $user->role ?: 'pending';
            $reason = $request->reason ? "\n**Reason:** " . $request->reason : '';
            $msg = "### :wastebasket: Account deletion requested\n"
                . "**User:** {$name} ({$user->email})\n"
                . "**Role:** {$role}\n"
                . "**Will be purged:** " . $user->deletion_requested_at->copy()->addDays(\App\Services\AccountDeletionService::GRACE_DAYS)->format('j M Y')
                . $reason;
            (new \App\Services\MattermostService())->post($msg);
        } catch (\Throwable $e) {
            // ignore
        }

        return response()->json([
            'message'  => 'Account scheduled for deletion. You can restore it by signing in within ' . \App\Services\AccountDeletionService::GRACE_DAYS . ' days.',
            'purge_at' => $user->deletion_requested_at->copy()->addDays(\App\Services\AccountDeletionService::GRACE_DAYS)->toIso8601String(),
        ]);
    }

    /**
     * Restore an account that's pending deletion. Treats like login — requires email + password.
     */
    public function restoreAccount(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !$user->deletion_requested_at) {
            return response()->json(['message' => 'No pending deletion found for this account.'], 404);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Account suspended.'], 403);
        }

        (new \App\Services\AccountDeletionService())->cancelDeletion($user);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user'    => $this->userPayload($user),
            'token'   => $token,
            'role'    => $user->role,
            'message' => 'Account restored. Welcome back!',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $profile = null;

        if ($user->role === 'candidate') {
            $profile = $user->candidate;
        } elseif ($user->role === 'employer') {
            $profile = $user->employer;
        }

        $unreadMessages = \App\Models\Message::where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'user'            => $user,
            'profile'         => $profile,
            'unread_messages' => $unreadMessages,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Password::broker()->createToken($user);
            $url = config('app.frontend_url') . '/reset-password?token='
                . urlencode($token) . '&email='
                . urlencode($user->email);
            try {
                $mailer = new MailService();
                $resetButton = ET::button($url, 'Reset My Password');
                $body = ET::heading('Reset your password')
                    . ET::paragraph("Assalamu Alaikum,")
                    . ET::paragraph("We received a request to reset the password for your UmmahJobs account. Click the button below to set a new password:")
                    . $resetButton
                    . ET::infoBox(
                        '<p style="margin:0;font-size:13px;color:#1E40AF;">This link expires in <strong>60 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.</p>'
                    )
                    . ET::paragraph("JazakAllah Khayran,<br>The UmmahJobs Team");
                $html = ET::wrap('Reset your UmmahJobs password', $body);
                $mailer->sendHtml($user->email, 'Reset your UmmahJobs password', $html);
            } catch (\Exception $e) {
                Log::error('Failed to send password reset email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'If that email exists, a reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = bcrypt($password);
                $user->legacy_password = false;
                $user->save();
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password reset successfully. Please log in with your new password.',
            ]);
        }

        return response()->json(['message' => 'Invalid or expired reset token.'], 422);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! $user->legacy_password) {
            if (! Hash::check($request->current_password, $user->password)) {
                return response()->json(
                    ['message' => 'Current password is incorrect.'],
                    422
                );
            }
        }

        $user->password = bcrypt($request->password);
        $user->legacy_password = false;
        $user->save();
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password changed successfully. Please log in again.',
        ]);
    }

    /**
     * Used by UmmahPass SSO new users who landed without a role chosen yet.
     * Sets role + creates the matching Candidate/Employer row. Idempotent for
     * users who already have a role — returns 422 so the frontend can route them away.
     */
    public function completeProfile(Request $request)
    {
        $request->validate([
            'role'         => 'required|in:candidate,employer',
            'company_name' => 'required_if:role,employer|nullable|string|max:255',
        ]);

        /** @var User $user */
        $user = $request->user();

        if (!empty($user->role)) {
            return response()->json(
                ['message' => 'Profile is already set up.'],
                422
            );
        }

        $user->role = $request->role;
        $user->save();

        if ($request->role === 'candidate') {
            Candidate::firstOrCreate(['user_id' => $user->id]);
        } else {
            $slug = Str::slug($request->company_name);
            if (Employer::where('slug', $slug)->exists()) {
                $slug .= '-' . rand(1000, 9999);
            }
            Employer::create([
                'user_id'      => $user->id,
                'company_name' => $request->company_name,
                'slug'         => $slug,
            ]);
        }

        return response()->json([
            'user' => $this->userPayload($user),
            'role' => $user->role,
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'           => $user->id,
            'email'        => $user->email,
            'display_name' => $user->display_name,
            'role'         => $user->role,
        ];
    }
}
