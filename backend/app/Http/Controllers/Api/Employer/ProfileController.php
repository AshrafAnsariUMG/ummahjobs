<?php

namespace App\Http\Controllers\Api\Employer;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
        ]);

        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['message' => 'Employer profile not found.'], 404);
        }

        if ($employer->logo_path && str_starts_with($employer->logo_path, 'logos/')) {
            Storage::disk('public')->delete($employer->logo_path);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $employer->logo_path = $path;
        $employer->save();

        return response()->json([
            'logo_path' => $path,
            'logo_url'  => Storage::url($path),
            'message'   => 'Logo updated successfully.',
        ]);
    }

    public function uploadCover(Request $request): JsonResponse
    {
        $request->validate([
            'cover' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['message' => 'Employer profile not found.'], 404);
        }

        if ($employer->cover_photo_path && str_starts_with($employer->cover_photo_path, 'covers/')) {
            Storage::disk('public')->delete($employer->cover_photo_path);
        }

        $path = $request->file('cover')->store('covers', 'public');
        $employer->cover_photo_path = $path;
        $employer->save();

        \App\Services\RevalidationService::trigger();

        return response()->json([
            'cover_path' => $path,
            'cover_url'  => Storage::url($path),
            'message'    => 'Cover photo updated successfully.',
        ]);
    }
}
