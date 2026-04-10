<?php

namespace App\Jobs;

use App\Models\Job;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

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

        Mail::raw(
            "Assalamu Alaikum {$user->display_name},\n\n"
            . "Your job listing \"{$job->title}\" will expire in 5 days "
            . "({$job->expires_at->format('M d, Y')}).\n\n"
            . "To renew it, visit your dashboard and post it again using your remaining credits.\n\n"
            . env('FRONTEND_URL') . "/employer/dashboard\n\n"
            . "JazakAllah Khayran,\n"
            . "The UmmahJobs Team",
            function ($message) use ($user, $job) {
                $message->to($user->email)
                    ->subject("Your job listing \"{$job->title}\" expires in 5 days");
            }
        );
    }
}
