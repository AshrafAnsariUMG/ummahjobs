<?php

namespace App\Services;

use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public function sendHtml(
        string $to,
        string $subject,
        string $htmlBody,
        ?string $replyTo = null
    ): bool {
        try {
            Mail::html(
                $htmlBody,
                function (Message $message) use ($to, $subject, $replyTo) {
                    $message->to($to)
                        ->subject($subject)
                        ->from(
                            config('mail.from.address'),
                            config('mail.from.name')
                        );

                    if ($replyTo) {
                        $message->replyTo($replyTo);
                    }
                }
            );
            return true;
        } catch (\Throwable $e) {
            Log::error('MailService failed: ' . $e->getMessage());
            return false;
        }
    }
}
