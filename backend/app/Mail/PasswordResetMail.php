<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PasswordResetMail extends Mailable
{
    public function __construct(public readonly string $resetUrl)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset your UmmahJobs password',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'emails.password-reset',
        );
    }
}
