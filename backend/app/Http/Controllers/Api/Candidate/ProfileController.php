<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Models\JobMatchCache;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController
{
    private const COMPLETION_FIELDS = [
        'title', 'location', 'phone', 'gender', 'age_range',
        'experience_years', 'qualification', 'job_category',
        'salary_type', 'cv_path', 'profile_photo_path',
        'languages', 'socials', 'skills',
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
            'experience_years' => 'nullable|string|max:50',
            'qualification'    => 'nullable|string|max:255',
            'languages'        => 'nullable|array',
            'languages.*'      => 'string|max:100',
            'skills'           => 'nullable|array',
            'skills.*'         => 'string|max:100',
            'job_category'     => 'nullable|string|max:255',
            'salary_type'      => 'nullable|string|max:50',
            'socials'          => 'nullable|array',
            'show_profile'     => 'boolean',
        ]);

        $candidate->update($validated);
        $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);

        // Invalidate match cache so updated profile reflects immediately on next score request
        JobMatchCache::where('candidate_id', $candidate->id)->delete();

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

    public function uploadCover(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        $request->validate([
            'cover' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($candidate->cover_photo_path && str_starts_with($candidate->cover_photo_path, 'covers/')) {
            Storage::disk('public')->delete($candidate->cover_photo_path);
        }

        $path = $request->file('cover')->store('covers', 'public');
        $candidate->cover_photo_path = $path;
        $candidate->save();

        return response()->json([
            'cover_path' => $path,
            'message'    => 'Cover photo updated.',
        ]);
    }

    public function updateAccount(Request $request): JsonResponse
    {
        $request->validate([
            'display_name'     => 'sometimes|string|max:255',
            'email'            => 'sometimes|email|max:255',
            'current_password' => 'required_with:email|string',
        ]);

        $user = $request->user();

        if ($request->has('email') && $request->email !== $user->email) {
            try {
                $passwordValid = Hash::check($request->current_password, $user->password ?? '');
            } catch (\RuntimeException $e) {
                $passwordValid = false;
            }

            if (!$passwordValid) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                    'errors'  => ['current_password' => ['Password is incorrect.']],
                ], 422);
            }

            $exists = User::where('email', $request->email)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This email is already in use.',
                    'errors'  => ['email' => ['Email already taken.']],
                ], 422);
            }

            $user->email = $request->email;
        }

        if ($request->filled('display_name')) {
            $user->display_name = $request->display_name;
        }

        $user->save();

        return response()->json([
            'message' => 'Account updated successfully.',
            'user'    => $user,
        ]);
    }

    public function removePhoto(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        if ($candidate->profile_photo_path) {
            $path = str_replace('/storage/', '', $candidate->profile_photo_path);
            Storage::disk('public')->delete($path);
            $candidate->profile_photo_path = null;
            $candidate->save();
            $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);
        }

        return response()->json(['message' => 'Photo removed.']);
    }

    public function removeCv(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        if ($candidate->cv_path) {
            $path = str_replace('/storage/', '', $candidate->cv_path);
            Storage::disk('public')->delete($path);
            $candidate->cv_path = null;
            $candidate->save();
            $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);
        }

        return response()->json(['message' => 'CV removed.']);
    }

    public function removeCover(Request $request): JsonResponse
    {
        $candidate = $request->user()->candidate;
        if (!$candidate) {
            return response()->json(['error' => 'Candidate profile not found.'], 403);
        }

        if ($candidate->cover_photo_path) {
            if (str_starts_with($candidate->cover_photo_path, 'covers/')) {
                Storage::disk('public')->delete($candidate->cover_photo_path);
            }
            $candidate->cover_photo_path = null;
            $candidate->save();
        }

        return response()->json(['message' => 'Cover photo removed.']);
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
