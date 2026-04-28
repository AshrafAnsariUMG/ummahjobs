<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmailTemplateService as ET;
use App\Services\GmailMailerService;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function submit(Request $request)
    {
        // Honeypot — bots fill this, humans don't see it
        if ($request->filled('website')) {
            return response()->json(['message' => 'Message sent.']);
        }

        $data = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:150',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:3000',
        ]);

        $to = config('services.gmail.from_address');

        $body = ET::heading('New Contact Form Submission')
            . ET::infoBox(
                '<strong>From:</strong> ' . e($data['name']) . ' &lt;' . e($data['email']) . '&gt;<br>'
                . '<strong>Subject:</strong> ' . e($data['subject']),
                '#F0F4FF',
                '#033BB0'
            )
            . ET::paragraph(nl2br(e($data['message'])))
            . ET::divider()
            . ET::paragraph('<small style="color:#6B7280">Hit Reply to respond directly to the sender.</small>');

        $html = ET::wrap('New contact: ' . $data['subject'], $body);

        try {
            $mailer = new GmailMailerService();
            $mailer->sendHtml($to, 'Contact: ' . $data['subject'], $html, $data['email']);
        } catch (\Throwable) {
            return response()->json(['message' => 'Failed to send. Please try again.'], 500);
        }

        return response()->json(['message' => 'Message sent.']);
    }
}
