<?php

namespace App\Jobs;

use App\Models\Job;
use App\Services\EmailTemplateService as ET;
use App\Services\GmailMailerService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendJobExpiryWarning implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $jobId
    ) {}

    public function handle(): void
    {
        $job = Job::with(['employer.user'])->find($this->jobId);

        if (!$job) {
            return;
        }

        $user = $job->employer->user;

        $dashboardUrl = env('FRONTEND_URL') . '/employer/dashboard';
        $mailer = new GmailMailerService();
        $expiryDate = $job->expires_at->format('M d, Y');
        $body = ET::heading('Your job listing expires soon')
            . ET::paragraph("Assalamu Alaikum {$user->display_name},")
            . ET::paragraph("Your job listing is expiring in <strong>5 days</strong> — make sure it stays visible to candidates.")
            . ET::infoBox(
                '<p style="margin:0 0 4px;font-size:14px;color:#92400E;"><strong>' . htmlspecialchars($job->title) . '</strong></p>'
                . '<p style="margin:0;font-size:13px;color:#92400E;">Expires on ' . $expiryDate . '</p>',
                '#FFFBEB',
                '#FCD34D'
            )
            . ET::paragraph("To renew it, visit your dashboard and repost using your remaining credits:")
            . ET::button($dashboardUrl, 'Go to Dashboard')
            . ET::paragraph("JazakAllah Khayran,<br>The UmmahJobs Team");
        $html = ET::wrap("Your job listing \"{$job->title}\" expires in 5 days", $body);
        $mailer->sendHtml($user->email, "Your job listing \"{$job->title}\" expires in 5 days", $html);
    }
}
