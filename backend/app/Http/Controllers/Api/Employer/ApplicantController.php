<?php

namespace App\Http\Controllers\Api\Employer;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantController
{
    public function index(Request $request): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $request->validate([
            'job_id' => 'nullable|integer',
            'status' => 'nullable|string|in:applied,viewed,shortlisted,offer',
        ]);

        // Ensure the job belongs to this employer if job_id is specified
        $jobIds = Job::where('employer_id', $employer->id)->pluck('id');

        $query = JobApplication::whereIn('job_id', $jobIds)
            ->with([
                'job:id,title,slug',
                'candidate' => function ($q) {
                    $q->with('user:id,display_name,email');
                },
            ]);

        if ($request->job_id) {
            $jobIdInt = (int) $request->job_id;
            if (!$jobIds->contains($jobIdInt)) {
                return response()->json(['error' => 'Job not found.'], 404);
            }
            $query->where('job_id', $jobIdInt);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $apps = $query->orderByDesc('applied_at')->paginate(20);

        return response()->json($apps);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $request->validate([
            'status' => 'required|in:applied,viewed,shortlisted,offer',
        ]);

        $jobIds = Job::where('employer_id', $employer->id)->pluck('id');
        $app    = JobApplication::whereIn('job_id', $jobIds)->find($id);

        if (!$app) {
            return response()->json(['error' => 'Application not found.'], 404);
        }

        $app->update(['status' => $request->status, 'updated_at' => now()]);

        return response()->json(['message' => 'Status updated.', 'application' => $app->fresh()]);
    }
}
