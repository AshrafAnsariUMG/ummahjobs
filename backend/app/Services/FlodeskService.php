<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlodeskService
{
    public function subscribe(
        string $email,
        string $firstName = '',
        ?string $segmentId = null
    ): array {
        $apiKey = config('services.flodesk.api_key');
        $segId  = $segmentId ?? config('services.flodesk.segment_id');

        if (empty($apiKey) || str_starts_with($apiKey, 'placeholder')) {
            Log::info('Flodesk not configured. Would subscribe: ' . $email);
            return ['success' => true, 'mock' => true];
        }

        $credentials = base64_encode($apiKey . ':');

        try {
            // Step 1: Create/update subscriber
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $credentials,
                'Content-Type'  => 'application/json',
            ])->put('https://api.flodesk.com/v1/subscribers', [
                'email'      => $email,
                'first_name' => $firstName,
                'status'     => 'active',
            ]);

            if (!$response->successful()) {
                Log::error('Flodesk subscribe failed', [
                    'email'  => $email,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => 'Subscription failed.'];
            }

            // Step 2: Add to segment if provided
            if (!empty($segId)) {
                Http::withHeaders([
                    'Authorization' => 'Basic ' . $credentials,
                    'Content-Type'  => 'application/json',
                ])->post(
                    'https://api.flodesk.com/v1/subscribers/' . urlencode($email) . '/segments',
                    ['segment_ids' => [$segId]]
                );
            }

            return ['success' => true];
        } catch (\Throwable $e) {
            Log::error('Flodesk exception', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => 'Service unavailable.'];
        }
    }
}
