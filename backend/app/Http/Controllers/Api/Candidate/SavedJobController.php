<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Models\Job;
use App\Models\SavedJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedJobController
{
    public function index(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $saved = SavedJob::where('candidate_id', $candidate->id)
            ->with(['job' => function ($q) {
                $q->with(['employer:id,company_name,slug,logo_path', 'category:id,name']);
            }])
            ->orderByDesc('saved_at')
            ->paginate(15);

        return response()->json($saved);
    }

    public function store(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $request->validate([
            'job_id' => 'required|exists:jobs,id',
        ]);

        $already = SavedJob::where('candidate_id', $candidate->id)
            ->where('job_id', $request->job_id)
            ->exists();

        if ($already) {
            return response()->json(['message' => 'Job already saved.'], 200);
        }

        $saved = SavedJob::create([
            'candidate_id' => $candidate->id,
            'job_id'       => $request->job_id,
            'saved_at'     => now(),
        ]);

        return response()->json(['message' => 'Job saved.', 'saved_job' => $saved], 201);
    }

    public function destroy(Request $request, int $jobId): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $deleted = SavedJob::where('candidate_id', $candidate->id)
            ->where('job_id', $jobId)
            ->delete();

        if (!$deleted) {
            return response()->json(['error' => 'Saved job not found.'], 404);
        }

        return response()->json(['message' => 'Job removed from saved list.']);
    }
}
