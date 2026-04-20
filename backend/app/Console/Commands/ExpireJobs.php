<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Services\RevalidationService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('jobs:expire')]
#[Description('Mark expired job listings as expired')]
class ExpireJobs extends Command
{
    public function handle(): void
    {
        $count = Job::where('status', 'active')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $this->info("Marked {$count} jobs as expired.");

        if ($count > 0) {
            RevalidationService::trigger();
        }
    }
}
