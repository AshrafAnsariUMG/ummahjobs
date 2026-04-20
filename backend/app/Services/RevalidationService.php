<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RevalidationService
{
    public static function trigger(array $paths = []): void
    {
        $secret      = env('REVALIDATION_SECRET');
        $frontendUrl = config('services.app.frontend_url');

        if (!$secret || !$frontendUrl) {
            return;
        }

        $allPaths = array_unique(array_merge(['/', '/jobs'], $paths));

        try {
            Http::timeout(3)->post(
                $frontendUrl . '/api/revalidate?secret=' . $secret,
                ['paths' => $allPaths]
            );
        } catch (\Throwable $e) {
            Log::warning('Revalidation failed: ' . $e->getMessage());
        }
    }
}
