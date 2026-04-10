<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobCategory;
use App\Models\JobType;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            JobCategory::orderBy('name')->get(['id', 'name', 'slug', 'icon'])
        );
    }

    public function jobTypes(): JsonResponse
    {
        return response()->json(
            JobType::orderBy('name')->get(['id', 'name', 'slug'])
        );
    }
}
