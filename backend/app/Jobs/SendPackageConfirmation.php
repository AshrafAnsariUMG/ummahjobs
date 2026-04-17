<?php

namespace App\Jobs;

use App\Models\Package;
use App\Models\User;
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

        $mailer = new GmailMailerService();
        $mailer->send(
            $user->email,
            'Your UmmahJobs package is active!',
            "Assalamu Alaikum {$user->display_name},\n\n"
            . "Your purchase was successful!\n\n"
            . "Package: {$package->name}\n"
            . "Credits: {$package->post_count} job post(s)\n"
            . "Duration: {$package->duration_days} days per listing\n\n"
            . "You can now post jobs from your dashboard:\n"
            . env('FRONTEND_URL') . "/employer/post-job\n\n"
            . "JazakAllah Khayran,\n"
            . "The UmmahJobs Team"
        );
    }
}
