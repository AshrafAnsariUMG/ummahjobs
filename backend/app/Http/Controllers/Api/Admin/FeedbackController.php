<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Services\EmailTemplateService;
use App\Services\GmailMailerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedbackController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Feedback::with('user')->orderByDesc('created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }

        return response()->json($query->paginate(20));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status'      => 'nullable|in:open,in_progress,resolved',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $feedback  = Feedback::findOrFail($id);
        $oldStatus = $feedback->status;

        $feedback->update([
            'status'      => $request->status ?? $feedback->status,
            'admin_notes' => $request->admin_notes ?? $feedback->admin_notes,
            'admin_id'    => $request->user()->id,
            'resolved_at' => $request->status === 'resolved' ? now() : $feedback->resolved_at,
        ]);

        if ($request->status === 'resolved' && $oldStatus !== 'resolved') {
            $user   = $feedback->user;
            $mailer = new GmailMailerService();
            $mailer->sendHtml(
                $user->email,
                'Your feedback has been resolved — UmmahJobs',
                EmailTemplateService::wrap(
                    'Feedback resolved',
                    EmailTemplateService::heading('Your Feedback Has Been Resolved')
                    . EmailTemplateService::paragraph("Assalamu Alaikum {$user->display_name},")
                    . EmailTemplateService::paragraph("Your feedback \"{$feedback->title}\" has been marked as resolved.")
                    . ($feedback->admin_notes
                        ? EmailTemplateService::infoBox(
                            '<strong>Admin Notes:</strong><br>' . nl2br(e($feedback->admin_notes))
                        )
                        : '')
                    . EmailTemplateService::paragraph(
                        '<span style="font-size:13px;color:#6B7280;">JazakAllah Khayran for helping us improve UmmahJobs!</span>'
                    )
                )
            );
        }

        DB::table('admin_audit_log')->insert([
            'admin_id'       => $request->user()->id,
            'target_user_id' => $feedback->user_id,
            'action'         => 'update_feedback',
            'notes'          => 'Updated feedback #' . $id . ' to ' . ($request->status ?? 'notes updated'),
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json($feedback->fresh('user'));
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total'       => Feedback::count(),
            'open'        => Feedback::where('status', 'open')->count(),
            'in_progress' => Feedback::where('status', 'in_progress')->count(),
            'resolved'    => Feedback::where('status', 'resolved')->count(),
            'bugs'        => Feedback::where('type', 'bug')->count(),
            'features'    => Feedback::where('type', 'feature')->count(),
        ]);
    }
}
