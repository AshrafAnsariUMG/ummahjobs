<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\JobMatchCache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CandidateController extends Controller
{
    private const COMPLETION_FIELDS = [
        'title', 'location', 'phone', 'gender', 'age_range',
        'experience_years', 'qualification', 'job_category',
        'salary_type', 'cv_path', 'profile_photo_path',
        'languages', 'socials', 'skills',
    ];

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

    public function index(Request $request)
    {
        $query = Candidate::with('user:id,email,is_active,created_at,display_name')
            ->orderByDesc('created_at');

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('display_name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('has_cv') && $request->has_cv !== '') {
            if (filter_var($request->has_cv, FILTER_VALIDATE_BOOLEAN)) {
                $query->whereNotNull('cv_path');
            } else {
                $query->whereNull('cv_path');
            }
        }

        if ($request->min_completion) {
            $query->where('profile_complete_pct', '>=', (int) $request->min_completion);
        }

        $candidates = $query->paginate(20);

        return response()->json([
            'data' => $candidates->items(),
            'meta' => [
                'current_page' => $candidates->currentPage(),
                'last_page'    => $candidates->lastPage(),
                'per_page'     => $candidates->perPage(),
                'total'        => $candidates->total(),
            ],
            'stats' => [
                'total'           => Candidate::count(),
                'with_cv'         => Candidate::whereNotNull('cv_path')->count(),
                'avg_completion'  => round((float) Candidate::avg('profile_complete_pct'), 1),
                'fully_complete'  => Candidate::where('profile_complete_pct', '>=', 80)->count(),
            ],
        ]);
    }

    public function updateProfile(Request $request, string $id)
    {
        $candidate = Candidate::findOrFail($id);

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
            'show_profile'     => 'sometimes|boolean',
        ]);

        $candidate->update($validated);
        $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);

        DB::table('admin_audit_log')->insert([
            'admin_id'       => $request->user()->id,
            'action'         => 'edit_candidate_profile',
            'target_user_id' => $candidate->user_id,
            'notes'          => $candidate->user->email ?? $candidate->id,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json($candidate->fresh()->load('user:id,display_name,email'));
    }

    public function uploadCandidatePhoto(Request $request, string $id)
    {
        $candidate = Candidate::findOrFail($id);

        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($candidate->profile_photo_path && str_starts_with($candidate->profile_photo_path, 'photos/')) {
            Storage::disk('public')->delete($candidate->profile_photo_path);
        }

        $path = $request->file('photo')->store('photos', 'public');
        $url  = Storage::disk('public')->url($path);

        $candidate->update(['profile_photo_path' => $url]);
        $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);

        return response()->json(['profile_photo_path' => $url]);
    }

    public function uploadCandidateCV(Request $request, string $id)
    {
        $candidate = Candidate::findOrFail($id);

        $request->validate([
            'cv' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        if ($candidate->cv_path && str_starts_with($candidate->cv_path, 'cvs/')) {
            Storage::disk('public')->delete($candidate->cv_path);
        }

        $path = $request->file('cv')->store('cvs', 'public');
        $url  = Storage::disk('public')->url($path);

        $candidate->update(['cv_path' => $url]);
        $candidate->update(['profile_complete_pct' => $this->calcCompletion($candidate->fresh())]);

        // Invalidate match cache so updated CV reflects immediately
        JobMatchCache::where('candidate_id', $candidate->id)->delete();

        return response()->json(['cv_path' => $url]);
    }
}
