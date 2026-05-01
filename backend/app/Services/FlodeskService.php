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

        $payload = [
            'email'      => $email,
            'first_name' => $firstName,
            'status'     => 'active',
        ];

        if (!empty($segId)) {
            $payload['segment_ids'] = [$segId];
        }

        try {
            $response = Http::withBasicAuth($apiKey, '')
                ->post('https://api.flodesk.com/v1/subscribers', $payload);

            if (!$response->successful()) {
                Log::error('Flodesk subscribe failed', [
                    'email'  => $email,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => 'Subscription failed.'];
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
