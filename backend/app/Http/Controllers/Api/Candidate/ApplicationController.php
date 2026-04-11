<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController
{
    public function index(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $apps = JobApplication::where('candidate_id', $candidate->id)
            ->with(['job' => function ($q) {
                $q->with(['employer:id,company_name,slug,logo_path', 'category:id,name']);
            }])
            ->orderByDesc('applied_at')
            ->paginate(15);

        return response()->json($apps);
    }

    public function store(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $request->validate([
            'job_id'       => 'required|exists:jobs,id',
            'cover_letter' => 'nullable|string|max:5000',
        ]);

        $job = Job::find($request->job_id);
        if (!$job || $job->status !== 'active') {
            return response()->json(['error' => 'This job is no longer accepting applications.'], 422);
        }

        $already = JobApplication::where('candidate_id', $candidate->id)
            ->where('job_id', $request->job_id)
            ->exists();

        if ($already) {
            return response()->json(['error' => 'You have already applied for this job.'], 409);
        }

        $app = JobApplication::create([
            'candidate_id' => $candidate->id,
            'job_id'       => $request->job_id,
            'cover_letter' => $request->cover_letter,
            'status'       => 'applied',
            'applied_at'   => now(),
        ]);

        return response()->json(['message' => 'Application submitted.', 'application' => $app], 201);
    }

    public function checkApplied(Request $request, int $jobId): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['applied' => false]);
        }

        $application = JobApplication::where('candidate_id', $candidate->id)
            ->where('job_id', $jobId)
            ->first(['id', 'status', 'applied_at']);

        return response()->json([
            'applied'      => $application !== null,
            'application'  => $application,
        ]);
    }
}
