<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;

class PackageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Package::where('is_active', true)
                ->orderBy('price')
                ->get()
        );
    }
}
