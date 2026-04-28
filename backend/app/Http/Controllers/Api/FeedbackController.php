<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\User;
use App\Services\EmailTemplateService;
use App\Services\GmailMailerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type'        => 'required|in:bug,feature,general',
            'title'       => 'required|string|max:255',
            'description' => 'required|string|max:2000',
        ]);

        $feedback = Feedback::create([
            'user_id'     => $request->user()->id,
            'type'        => $request->type,
            'title'       => $request->title,
            'description' => $request->description,
            'status'      => 'open',
        ]);

        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            $mailer    = new GmailMailerService();
            $user      = $request->user();
            $typeLabel = match ($request->type) {
                'bug'     => 'Bug Report',
                'feature' => 'Feature Request',
                default   => 'General Feedback',
            };
            $mailer->sendHtml(
                $admin->email,
                "New {$typeLabel}: {$request->title}",
                EmailTemplateService::wrap(
                    'New feedback submitted',
                    EmailTemplateService::heading("New {$typeLabel}")
                    . EmailTemplateService::paragraph(
                        "From: {$user->display_name} ({$user->email}) — Role: {$user->role}"
                    )
                    . EmailTemplateService::infoBox(
                        '<strong>' . e($request->title) . '</strong><br><br>'
                        . nl2br(e($request->description))
                    )
                    . EmailTemplateService::button(
                        config('services.app.frontend_url') . '/admin/feedback',
                        'View in Admin Panel'
                    )
                )
            );
        }

        return response()->json([
            'message'  => "JazakAllah Khayran! Your feedback has been submitted. We'll review it shortly.",
            'feedback' => $feedback,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $feedback = Feedback::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['feedback' => $feedback]);
    }
}
