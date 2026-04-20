<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\RevalidationService;
use App\Services\SiteSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingsController extends Controller
{
    public function __construct(private SiteSettingsService $settings) {}

    /**
     * GET /api/admin/settings
     * Returns all settings grouped by group (with full metadata).
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'grouped' => $this->settings->grouped(),
        ]);
    }

    /**
     * POST /api/admin/settings
     * Update one or many settings.
     * Body: { key: value, ... }
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            '*' => 'nullable|string|max:5000',
        ]);

        $this->settings->setMany($data);

        RevalidationService::trigger(['/', '/about', '/blog', '/employers/why-post']);

        return response()->json(['message' => 'Settings saved.']);
    }

    /**
     * POST /api/admin/settings/logo
     * Upload logo and save its public URL as logo_path.
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $path = $request->file('logo')->store('logos', 'public');
        $url  = Storage::disk('public')->url($path);

        $this->settings->set('logo_path', $url);

        RevalidationService::trigger(['/', '/about', '/blog', '/employers/why-post']);

        return response()->json(['url' => $url]);
    }

    /**
     * GET /api/settings  (public — no auth required)
     * Returns a safe subset of settings for the frontend.
     */
    public function publicSettings(): JsonResponse
    {
        return response()->json($this->settings->publicSettings());
    }
}
