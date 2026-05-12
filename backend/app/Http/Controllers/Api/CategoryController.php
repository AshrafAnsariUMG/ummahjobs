<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobCategory;
use App\Models\JobType;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $query = JobCategory::orderBy('name');

        if ($request->boolean('all')) {
            return response()->json($query->get(['id', 'name', 'slug', 'icon']));
        }

        $categories = $query
            ->withCount(['jobs' => fn ($q) => $q->where('status', 'active')])
            ->get(['id', 'name', 'slug', 'icon'])
            ->filter(fn ($c) => $c->jobs_count > 0)
            ->values();

        return response()->json($categories);
    }

    public function jobTypes(): JsonResponse
    {
        return response()->json(
            JobType::orderBy('name')->get(['id', 'name', 'slug'])
        );
    }
}
