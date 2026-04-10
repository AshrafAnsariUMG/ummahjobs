<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Models\EmployerReview;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployerController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $employer = Employer::with('user:id,email')
            ->where('slug', $slug)
            ->where('show_profile', true)
            ->firstOrFail();

        $employer->increment('views_count');

        $jobs = Job::with('category:id,name,slug')
            ->where('employer_id', $employer->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'employer'   => $employer,
            'jobs'       => $jobs,
            'jobs_count' => $jobs->count(),
        ]);
    }

    public function reviews(string $slug): JsonResponse
    {
        $employer = Employer::where('slug', $slug)->firstOrFail();

        $reviews = EmployerReview::with('reviewer:id,display_name')
            ->where('employer_id', $employer->id)
            ->orderByDesc('created_at')
            ->get();

        $avgRating = $reviews->isNotEmpty()
            ? round($reviews->avg('rating'), 1)
            : null;

        return response()->json([
            'reviews'        => $reviews,
            'average_rating' => $avgRating,
            'total_reviews'  => $reviews->count(),
        ]);
    }

    public function storeReview(Request $request, string $slug): JsonResponse
    {
        $employer = Employer::where('slug', $slug)->firstOrFail();

        $request->validate([
            'rating'      => 'required|integer|between:1,5',
            'review_text' => 'nullable|string|max:1000',
        ]);

        $exists = EmployerReview::where('employer_id', $employer->id)
            ->where('reviewer_id', $request->user()->id)
            ->exists();

        if ($exists) {
            return response()->json(
                ['message' => 'You have already reviewed this employer.'],
                422
            );
        }

        $review = EmployerReview::create([
            'employer_id' => $employer->id,
            'reviewer_id' => $request->user()->id,
            'rating'      => $request->rating,
            'review_text' => $request->review_text,
        ]);

        return response()->json($review->load('reviewer:id,display_name'), 201);
    }
}
