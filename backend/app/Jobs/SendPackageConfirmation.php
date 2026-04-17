<?php

namespace App\Jobs;

use App\Models\Package;
use App\Models\User;
use App\Services\EmailTemplateService as ET;
use App\Services\GmailMailerService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPackageConfirmation implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $userId,
        public readonly int $packageId
    ) {}

    public function handle(): void
    {
        $user    = User::find($this->userId);
        $package = Package::find($this->packageId);

        if (!$user || !$package) {
            return;
        }

        $dashboardUrl = env('FRONTEND_URL') . '/employer/post-job';
        $mailer = new GmailMailerService();
        $packageDetails = '
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="padding:6px 0;font-size:14px;color:#374151;border-bottom:1px solid #BFDBFE;"><strong>Package</strong></td><td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;border-bottom:1px solid #BFDBFE;">' . htmlspecialchars($package->name) . '</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#374151;border-bottom:1px solid #BFDBFE;"><strong>Job Credits</strong></td><td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;border-bottom:1px solid #BFDBFE;">' . $package->post_count . ' post(s)</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#374151;"><strong>Listing Duration</strong></td><td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;">' . $package->duration_days . ' days per listing</td></tr>
            </table>';
        $body = ET::heading('Your package is active!')
            . ET::paragraph("Assalamu Alaikum {$user->display_name},")
            . ET::paragraph("Your purchase was successful! Here's a summary of your package:")
            . ET::infoBox($packageDetails)
            . ET::paragraph("Your credits are ready to use. Click below to post your first job:")
            . ET::button($dashboardUrl, 'Post a Job Now', '#0FBB0F')
            . ET::paragraph("JazakAllah Khayran,<br>The UmmahJobs Team");
        $html = ET::wrap('Your UmmahJobs package is active!', $body);
        $mailer->sendHtml($user->email, 'Your UmmahJobs package is active!', $html);
    }
}
