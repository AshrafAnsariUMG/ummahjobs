<?php

namespace App\Http\Controllers\Api\Employer;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('employer');
        return response()->json($user->employer);
    }

    public function update(Request $request): JsonResponse
    {
        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['error' => 'Employer profile not found.'], 403);
        }

        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'category'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string|max:500',
            'map_lat'      => 'nullable|numeric|between:-90,90',
            'map_lng'      => 'nullable|numeric|between:-180,180',
            'socials'      => 'nullable|array',
            'socials.*.network' => 'required|string|max:50',
            'socials.*.url'     => 'required|url|max:500',
            'show_profile' => 'boolean',
        ]);

        $employer->update($validated);

        return response()->json($employer->fresh());
    }
}
