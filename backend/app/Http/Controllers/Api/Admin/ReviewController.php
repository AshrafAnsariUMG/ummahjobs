<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = DB::table('employer_reviews as r')
            ->join('employers as e', 'r.employer_id', '=', 'e.id')
            ->join('users as u', 'r.reviewer_id', '=', 'u.id')
            ->select(
                'r.id',
                'r.rating',
                'r.review_text',
                'r.created_at',
                'e.company_name',
                'e.slug as employer_slug',
                'u.display_name as reviewer_name',
                'u.email as reviewer_email'
            )
            ->orderByDesc('r.created_at')
            ->paginate(20);

        return response()->json($reviews);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'review_text' => 'nullable|string|max:1000',
            'rating'      => 'required|integer|between:1,5',
        ]);

        DB::table('employer_reviews')->where('id', $id)->update([
            'review_text' => $request->review_text,
            'rating'      => $request->rating,
            'updated_at'  => now(),
        ]);

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'edit_review',
            'notes'      => 'Edited review #' . $id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $review = DB::table('employer_reviews as r')
            ->join('employers as e', 'r.employer_id', '=', 'e.id')
            ->join('users as u', 'r.reviewer_id', '=', 'u.id')
            ->select('r.*', 'e.company_name', 'e.slug as employer_slug',
                     'u.display_name as reviewer_name', 'u.email as reviewer_email')
            ->where('r.id', $id)
            ->first();

        return response()->json($review);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        DB::table('employer_reviews')->where('id', $id)->delete();

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'delete_review',
            'notes'      => 'Deleted review #' . $id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Review deleted.']);
    }
}
