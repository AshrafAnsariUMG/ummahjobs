<?php

namespace App\Http\Controllers\Api\Employer;

use App\Models\Job;
use App\Models\JobApplication;
use App\Services\EmployerPackageService;
use App\Services\JDWriterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JobController
{
    public function generateDescription(Request $request): JsonResponse
    {
        $request->validate([
            'title'            => 'required|string|max:255',
            'job_type'         => 'nullable|string',
            'location'         => 'nullable|string',
            'experience_level' => 'nullable|string',
            'career_level'     => 'nullable|string',
            'category'         => 'nullable|string',
            'responsibilities' => 'required|string|max:3000',
            'requirements'     => 'nullable|string|max:3000',
            'salary_min'       => 'nullable|integer',
            'salary_max'       => 'nullable|integer',
            'salary_currency'  => 'nullable|string',
            'salary_type'      => 'nullable|string',
            'is_urgent'        => 'nullable|boolean',
        ]);

        $service     = new JDWriterService();
        $description = $service->generate($request->all());

        return response()->json(['description' => $description]);
    }

    public function store(Request $request): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $service = new EmployerPackageService();
        if (!$service->hasCredits($employer->id)) {
            return response()->json([
                'error'    => 'no_credits',
                'message'  => 'You have no active package credits. Please purchase a package to post a job.',
                'redirect' => '/employer/packages',
            ], 402);
        }

        $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'category_id'      => 'nullable|exists:job_categories,id',
            'job_type'         => 'nullable|string',
            'location'         => 'nullable|string',
            'country'          => 'nullable|string',
            'salary_min'       => 'nullable|integer|min:0',
            'salary_max'       => 'nullable|integer|min:0|gte:salary_min',
            'salary_currency'  => 'nullable|string',
            'salary_type'      => 'nullable|string',
            'experience_level' => 'nullable|string',
            'career_level'     => 'nullable|string',
            'apply_type'       => 'required|in:external,platform',
            'apply_url'        => 'required_if:apply_type,external|nullable|url',
            'is_urgent'        => 'boolean',
        ]);

        $package = $service->debitCredit($employer->id);

        // Generate unique slug
        $slug     = Str::slug($request->title);
        $baseSlug = $slug;
        $count    = 0;
        while (Job::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . ++$count;
        }

        $packageDef = $package->package;
        $isFeatured = $packageDef && $packageDef->post_type === 'featured';

        $job = Job::create([
            'employer_id'          => $employer->id,
            'employer_package_id'  => $package->id,
            'category_id'          => $request->category_id,
            'title'                => $request->title,
            'slug'                 => $slug,
            'description'          => $request->description,
            'job_type'             => $request->job_type,
            'location'             => $request->location,
            'country'              => $request->country,
            'salary_min'           => $request->salary_min,
            'salary_max'           => $request->salary_max,
            'salary_currency'      => $request->salary_currency ?? 'USD',
            'salary_type'          => $request->salary_type,
            'experience_level'     => $request->experience_level,
            'career_level'         => $request->career_level,
            'apply_type'           => $request->apply_type,
            'apply_url'            => $request->apply_url,
            'is_featured'          => $isFeatured,
            'is_urgent'            => $request->is_urgent ?? false,
            'status'               => 'active',
            'expires_at'           => now()->addDays($package->duration_days),
        ]);

        return response()->json(['job' => $job, 'slug' => $job->slug], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        // Mark any active jobs that have passed their expiry
        Job::where('employer_id', $employer->id)
            ->where('status', 'active')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $status = $request->status ?? 'all';
        $query  = Job::where('employer_id', $employer->id)->with('category');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(10)
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $job = Job::where('id', $id)
            ->where('employer_id', $employer->id)
            ->first();

        if (!$job) {
            return response()->json(['error' => 'Job not found.'], 404);
        }

        $request->validate([
            'title'            => 'sometimes|string|max:255',
            'description'      => 'sometimes|string',
            'category_id'      => 'nullable|exists:job_categories,id',
            'job_type'         => 'nullable|string',
            'location'         => 'nullable|string',
            'country'          => 'nullable|string',
            'salary_min'       => 'nullable|integer|min:0',
            'salary_max'       => 'nullable|integer|min:0',
            'salary_currency'  => 'nullable|string',
            'salary_type'      => 'nullable|string',
            'experience_level' => 'nullable|string',
            'career_level'     => 'nullable|string',
            'apply_type'       => 'sometimes|in:external,platform',
            'apply_url'        => 'nullable|url',
            'is_urgent'        => 'boolean',
        ]);

        $job->update($request->only([
            'title', 'description', 'category_id', 'job_type', 'location',
            'country', 'salary_min', 'salary_max', 'salary_currency',
            'salary_type', 'experience_level', 'career_level', 'apply_type',
            'apply_url', 'is_urgent',
        ]));

        return response()->json($job->fresh('category'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $job = Job::where('id', $id)
            ->where('employer_id', $employer->id)
            ->first();

        if (!$job) {
            return response()->json(['error' => 'Job not found.'], 404);
        }

        $job->delete();

        return response()->json(['message' => 'Job deleted.']);
    }

    public function analytics(Request $request, int $id): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $job = Job::where('id', $id)
            ->where('employer_id', $employer->id)
            ->first();

        if (!$job) {
            return response()->json(['error' => 'Job not found.'], 404);
        }

        $applicationCount = JobApplication::where('job_id', $job->id)->count();
        $byStatus = JobApplication::where('job_id', $job->id)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'job_id'             => $job->id,
            'title'              => $job->title,
            'views'              => $job->views_count ?? 0,
            'applications_total' => $applicationCount,
            'applications_by_status' => $byStatus,
            'expires_at'         => $job->expires_at,
            'status'             => $job->status,
        ]);
    }
}
