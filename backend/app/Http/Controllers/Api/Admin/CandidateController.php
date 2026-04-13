<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use Illuminate\Http\Request;

class CandidateController extends Controller
{
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
}
