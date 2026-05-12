<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MattermostService
{
    private string $baseUrl;
    private string $token;
    private string $channelId;

    public function __construct()
    {
        $this->baseUrl   = config('services.mattermost.base_url');
        $this->token     = config('services.mattermost.bot_token');
        $this->channelId = config('services.mattermost.channel_id');
    }

    public function post(string $message): bool
    {
        if (!$this->baseUrl || !$this->token || !$this->channelId) {
            return false;
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->token,
                    'Content-Type'  => 'application/json',
                ])
                ->post($this->baseUrl . '/api/v4/posts', [
                    'channel_id' => $this->channelId,
                    'message'    => $message,
                ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('Mattermost notification failed: ' . $e->getMessage());
            return false;
        }
    }
}
