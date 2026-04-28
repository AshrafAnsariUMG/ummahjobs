<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Employer;
use App\Models\User;
use App\Services\EmailTemplateService as ET;
use App\Services\GmailMailerService;
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
            Candidate::create(['user_id' => $user->id]);
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
                $mailer = new GmailMailerService();
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

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user'  => $this->userPayload($user),
            'token' => $token,
            'role'  => $user->role,
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
                $mailer = new GmailMailerService();
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
