<?php

namespace App\Http\Controllers\Api\Candidate;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController
{
    private const COMPLETION_FIELDS = [
        'title', 'location', 'phone', 'gender', 'age_range',
        'experience_years', 'qualification', 'job_category',
        'salary_type', 'cv_path', 'profile_photo_path',
        'languages', 'socials',
    ];

    public function show(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 404);
        }

        return response()->json($candidate->load('user:id,display_name,email'));
    }

    public function update(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $validated = $request->validate([
            'title'            => 'nullable|string|max:255',
            'location'         => 'nullable|string|max:255',
            'phone'            => 'nullable|string|max:50',
            'gender'           => 'nullable|string|in:male,female,prefer_not_to_say',
            'age_range'        => 'nullable|string|max:20',
            'experience_years' => 'nullable|integer|min:0|max:50',
            'qualification'    => 'nullable|string|max:255',
            'languages'        => 'nullable|array',
            'languages.*'      => 'string|max:100',
            'job_category'     => 'nullable|string|max:255',
            'salary_type'      => 'nullable|string|max:50',
            'socials'          => 'nullable|array',
            'show_profile'     => 'boolean',
        ]);

        $candidate->update($validated);
        $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);

        return response()->json($candidate->fresh());
    }

    public function uploadCV(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $request->validate([
            'cv' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($candidate->cv_path) {
            $old = str_replace('/storage/', '', $candidate->cv_path);
            Storage::disk('public')->delete($old);
        }

        $path = $request->file('cv')->store('cvs', 'public');
        $url  = Storage::disk('public')->url($path);

        $candidate->update(['cv_path' => $url]);
        $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);

        return response()->json(['cv_path' => $url]);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($candidate->profile_photo_path) {
            $old = str_replace('/storage/', '', $candidate->profile_photo_path);
            Storage::disk('public')->delete($old);
        }

        $path = $request->file('photo')->store('photos', 'public');
        $url  = Storage::disk('public')->url($path);

        $candidate->update(['profile_photo_path' => $url]);
        $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);

        return response()->json(['profile_photo_path' => $url]);
    }

    private function calcCompletion($candidate): float
    {
        $total  = count(self::COMPLETION_FIELDS);
        $filled = 0;

        foreach (self::COMPLETION_FIELDS as $field) {
            $val = $candidate->$field;
            if ($val !== null && $val !== '' && $val !== [] && $val !== '0') {
                $filled++;
            }
        }

        return round(($filled / $total) * 100, 2);
    }
}
