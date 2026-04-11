<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Models\JobAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController
{
    public function index(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $alerts = JobAlert::where('candidate_id', $candidate->id)
            ->with('category:id,name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($alerts);
    }

    public function store(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $validated = $request->validate([
            'keyword'     => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:job_categories,id',
            'location'    => 'nullable|string|max:255',
            'job_type'    => 'nullable|string|max:100',
            'frequency'   => 'nullable|in:daily,weekly',
        ]);

        $alert = JobAlert::create(array_merge($validated, [
            'candidate_id' => $candidate->id,
            'frequency'    => $validated['frequency'] ?? 'daily',
        ]));

        return response()->json($alert->load('category:id,name'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $alert = JobAlert::where('candidate_id', $candidate->id)->find($id);
        if (!$alert) {
            return response()->json(['error' => 'Alert not found.'], 404);
        }

        $validated = $request->validate([
            'keyword'     => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:job_categories,id',
            'location'    => 'nullable|string|max:255',
            'job_type'    => 'nullable|string|max:100',
            'frequency'   => 'nullable|in:daily,weekly',
        ]);

        $alert->update($validated);

        return response()->json($alert->fresh()->load('category:id,name'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $alert = JobAlert::where('candidate_id', $candidate->id)->find($id);
        if (!$alert) {
            return response()->json(['error' => 'Alert not found.'], 404);
        }

        $alert->delete();

        return response()->json(['message' => 'Alert deleted.']);
    }
}
