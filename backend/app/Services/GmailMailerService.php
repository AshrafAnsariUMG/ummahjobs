<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GmailMailerService
{
    private string $clientId;
    private string $clientSecret;
    private string $refreshToken;
    private string $fromAddress;
    private string $fromName;

    public function __construct()
    {
        $this->clientId     = config('services.gmail.client_id');
        $this->clientSecret = config('services.gmail.client_secret');
        $this->refreshToken = config('services.gmail.refresh_token');
        $this->fromAddress  = config('services.gmail.from_address');
        $this->fromName     = config('services.gmail.from_name', 'UmmahJobs');
    }

    private function getAccessToken(): string
    {
        $response = Http::post('https://oauth2.googleapis.com/token', [
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $this->refreshToken,
            'grant_type'    => 'refresh_token',
        ]);

        if (!$response->successful()) {
            Log::error('Gmail token refresh failed', ['body' => $response->body()]);
            throw new \Exception('Failed to refresh Gmail token');
        }

        return $response->json('access_token');
    }

    public function send(
        string $to,
        string $subject,
        string $body,
        bool $isHtml = false,
        ?string $replyTo = null
    ): bool {
        try {
            $accessToken = $this->getAccessToken();

            $contentType = $isHtml ? 'text/html' : 'text/plain';

            $rawMessage =
                "From: {$this->fromName} <{$this->fromAddress}>\r\n"
                . "To: {$to}\r\n"
                . ($replyTo ? "Reply-To: {$replyTo}\r\n" : '')
                . "Subject: {$subject}\r\n"
                . "MIME-Version: 1.0\r\n"
                . "Content-Type: {$contentType}; charset=UTF-8\r\n"
                . "\r\n"
                . $body;

            $encoded = rtrim(strtr(base64_encode($rawMessage), '+/', '-_'), '=');

            $response = Http::withToken($accessToken)
                ->post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', [
                    'raw' => $encoded,
                ]);

            if (!$response->successful()) {
                Log::error('Gmail send failed', [
                    'to'      => $to,
                    'subject' => $subject,
                    'status'  => $response->status(),
                    'body'    => $response->body(),
                ]);
                return false;
            }

            return true;

        } catch (\Throwable $e) {
            Log::error('GmailMailerService exception', [
                'to'    => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function sendHtml(string $to, string $subject, string $htmlBody, ?string $replyTo = null): bool
    {
        return $this->send($to, $subject, $htmlBody, true, $replyTo);
    }
}
