<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Job;
use App\Models\Employer;
use App\Models\JobCategory;

class ImportWpJobsXml extends Command
{
    protected $signature = 'import:wp-jobs-xml {file : Path to JSON file}';
    protected $description = 'Import WP jobs from prepared JSON file';

    public function handle()
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("File not found: $file");
            return 1;
        }

        $jobs = json_decode(file_get_contents($file), true);
        $this->info("Found " . count($jobs) . " jobs to import");

        $imported = 0;
        $skipped = 0;
        $errors = [];

        foreach ($jobs as $jobData) {
            try {
                // Skip if title empty
                if (empty(trim($jobData['title']))) {
                    $skipped++;
                    continue;
                }

                // Check if job already exists by title
                $exists = Job::where('title', $jobData['title'])->exists();
                if ($exists) {
                    $this->line("  SKIP (exists): {$jobData['title']}");
                    $skipped++;
                    continue;
                }

                $employerId = null;
                $categoryId = null;

                // Resolve employer
                if (!empty($jobData['employer_slug'])) {
                    $employer = Employer::where(
                        'slug', $jobData['employer_slug']
                    )->first();
                    if ($employer) {
                        $employerId = $employer->id;
                    }
                }

                // Resolve category
                if (!empty($jobData['category_slug'])) {
                    $category = JobCategory::where(
                        'slug', $jobData['category_slug']
                    )->first();
                    if ($category) {
                        $categoryId = $category->id;
                    }
                }

                // Generate unique slug
                $slug = Str::slug($jobData['title']);
                $base = $slug;
                $i = 1;
                while (Job::where('slug', $slug)->exists()) {
                    $slug = $base . '-' . $i++;
                }

                // Set expires_at to 60 days from now for active jobs
                $expiresAt = now()->addDays(60);

                Job::create([
                    'employer_id'              => $employerId,
                    'external_employer_name'   => $jobData['external_employer_name'] ?? null,
                    'external_employer_website'=> $jobData['external_employer_website'] ?? null,
                    'category_id'              => $categoryId,
                    'title'                    => trim($jobData['title']),
                    'slug'                     => $slug,
                    'description'              => $jobData['description'] ?? '',
                    'job_type'                 => $jobData['job_type'] ?? 'Full Time',
                    'location'                 => $jobData['location'] ?? null,
                    'country'                  => null,
                    'salary_min'               => null,
                    'salary_max'               => null,
                    'salary_currency'          => 'USD',
                    'salary_type'              => null,
                    'experience_level'         => null,
                    'career_level'             => null,
                    'apply_type'               => 'external',
                    'apply_url'                => $jobData['apply_url'] ?? null,
                    'is_featured'              => false,
                    'is_urgent'                => false,
                    'status'                   => 'active',
                    'expires_at'               => $expiresAt,
                    'views_count'              => 0,
                    'employer_package_id'      => null,
                ]);

                $empDisplay = $jobData['employer_slug']
                    ?? $jobData['external_employer_name']
                    ?? 'External';

                $this->line("  OK: [{$empDisplay}] {$jobData['title']}");
                $imported++;

            } catch (\Throwable $e) {
                $errors[] = $jobData['title'] . ': ' . $e->getMessage();
                $this->error("  ERROR: {$jobData['title']} — {$e->getMessage()}");
            }
        }

        $this->info("\n=== Import Complete ===");
        $this->info("Imported: $imported");
        $this->info("Skipped:  $skipped");
        $this->info("Errors:   " . count($errors));

        if ($errors) {
            foreach ($errors as $err) {
                $this->error("  $err");
            }
        }

        // Trigger revalidation
        try {
            \App\Services\RevalidationService::trigger();
            $this->info("Revalidation triggered.");
        } catch (\Throwable $e) {
            $this->warn("Revalidation failed: " . $e->getMessage());
        }

        return 0;
    }
}
