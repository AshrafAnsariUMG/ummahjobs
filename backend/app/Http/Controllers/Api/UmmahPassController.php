<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UmmahPassController extends Controller
{
    public function redirect(): JsonResponse
    {
        $state = Str::random(40);
        Cache::put('ummahpass_state_' . $state, true, 300);

        $query = http_build_query([
            'client_id'     => config('services.ummahpass.client_id'),
            'redirect_uri'  => config('services.ummahpass.redirect'),
            'response_type' => 'code',
            'scope'         => 'profile email',
            'state'         => $state,
        ]);

        return response()->json([
            'url' => 'https://ummahpass.io/oauth/authorize?' . $query,
        ]);
    }

    public function callback(Request $request): RedirectResponse
    {
        $frontendUrl = rtrim(config('services.app.frontend_url', 'http://localhost:3003'), '/');

        if (!$request->state || !Cache::pull('ummahpass_state_' . $request->state)) {
            return redirect($frontendUrl . '/login?error=invalid_state');
        }

        $tokenResponse = Http::asForm()->post('https://ummahpass.io/oauth/token', [
            'grant_type'    => 'authorization_code',
            'client_id'     => config('services.ummahpass.client_id'),
            'client_secret' => config('services.ummahpass.client_secret'),
            'redirect_uri'  => config('services.ummahpass.redirect'),
            'code'          => $request->code,
        ]);

        if ($tokenResponse->failed()) {
            Log::error('UmmahPass token exchange failed', [
                'status' => $tokenResponse->status(),
                'body'   => $tokenResponse->body(),
            ]);
            return redirect($frontendUrl . '/login?error=auth_failed');
        }

        $accessToken = $tokenResponse->json('access_token');

        if (!$accessToken) {
            return redirect($frontendUrl . '/login?error=auth_failed');
        }

        $userResponse = Http::withToken($accessToken)
            ->acceptJson()
            ->get('https://ummahpass.io/api/user');

        if ($userResponse->failed()) {
            Log::error('UmmahPass user fetch failed', [
                'status' => $userResponse->status(),
                'body'   => $userResponse->body(),
            ]);
            return redirect($frontendUrl . '/login?error=auth_failed');
        }

        $userData = $userResponse->json();

        if (empty($userData['email'])) {
            return redirect($frontendUrl . '/login?error=no_email');
        }

        // Use firstOrCreate so passwords/roles of existing accounts aren't overwritten.
        $user = User::firstOrCreate(
            ['email' => $userData['email']],
            [
                'id'              => (string) Str::ulid(),
                'display_name'    => $userData['name'] ?? Str::before($userData['email'], '@'),
                'ummahpass_id'    => (string) $userData['id'],
                'password'        => bcrypt(Str::random(40)),
                'role'            => 'candidate',
                'legacy_password' => false,
                'is_active'       => true,
            ]
        );

        // Link UmmahPass to an existing email-only account on first SSO sign-in.
        if (!$user->wasRecentlyCreated && empty($user->ummahpass_id)) {
            $user->ummahpass_id = (string) $userData['id'];
            $user->save();
        }

        // Newly-created users default to candidate role — ensure a candidate row exists.
        if ($user->wasRecentlyCreated && $user->role === 'candidate') {
            Candidate::firstOrCreate(['user_id' => $user->id]);
        }

        $sanctumToken = $user->createToken('ummahpass')->plainTextToken;

        return redirect($frontendUrl . '/auth/callback?token=' . $sanctumToken);
    }
}
