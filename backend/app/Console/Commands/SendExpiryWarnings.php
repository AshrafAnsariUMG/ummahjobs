<?php

namespace App\Console\Commands;

use App\Jobs\SendJobExpiryWarning;
use App\Models\Job;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('jobs:send-expiry-warnings')]
#[Description('Send expiry warning emails for jobs expiring in 5 days')]
class SendExpiryWarnings extends Command
{
    public function handle(): void
    {
        $jobs = Job::with('employer')
            ->where('status', 'active')
            ->whereDate('expires_at', now()->addDays(5)->toDateString())
            ->get();

        foreach ($jobs as $job) {
            dispatch(new SendJobExpiryWarning($job->id));
        }

        $this->info("Dispatched warnings for {$jobs->count()} jobs.");
    }
}
