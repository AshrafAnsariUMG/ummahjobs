<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Services\RevalidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EmployerController extends Controller
{
    public function index(Request $request)
    {
        $query = Employer::with('user:id,email,is_active')
            ->orderByDesc('created_at');

        if ($request->search) {
            $query->where('company_name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('is_verified') && $request->is_verified !== '') {
            $query->where('is_verified', filter_var($request->is_verified, FILTER_VALIDATE_BOOLEAN));
        }

        $employers = $query->paginate(20);

        return response()->json([
            'data' => $employers->items(),
            'meta' => [
                'current_page' => $employers->currentPage(),
                'last_page'    => $employers->lastPage(),
                'per_page'     => $employers->perPage(),
                'total'        => $employers->total(),
            ],
        ]);
    }

    public function search(Request $request)
    {
        $employers = Employer::where('company_name', 'like', '%' . $request->q . '%')
            ->limit(10)
            ->get(['id', 'company_name', 'slug', 'logo_path']);

        return response()->json(['employers' => $employers]);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'is_verified'  => 'sometimes|boolean',
            'show_profile' => 'sometimes|boolean',
        ]);

        $employer = Employer::findOrFail($id);
        $employer->update($request->only(['is_verified', 'show_profile']));

        if ($request->has('is_verified')) {
            DB::table('admin_audit_log')->insert([
                'admin_id'       => $request->user()->id,
                'action'         => $request->is_verified ? 'verify_employer' : 'unverify_employer',
                'target_user_id' => $employer->user_id,
                'notes'          => $employer->company_name,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        RevalidationService::trigger(['/employers/why-post']);

        return response()->json($employer->load('user:id,email,is_active'));
    }

    public function updateProfile(Request $request, string $id)
    {
        $employer = Employer::findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'category'     => 'nullable|string|max:255',
            'description'  => 'nullable|string|max:5000',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string|max:500',
            'socials'      => 'nullable|array',
            'map_lat'      => 'nullable|numeric|between:-90,90',
            'map_lng'      => 'nullable|numeric|between:-180,180',
            'is_verified'  => 'sometimes|boolean',
            'show_profile' => 'sometimes|boolean',
        ]);

        $employer->update($validated);

        DB::table('admin_audit_log')->insert([
            'admin_id'       => $request->user()->id,
            'action'         => 'edit_employer_profile',
            'target_user_id' => $employer->user_id,
            'notes'          => $employer->company_name,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        RevalidationService::trigger(['/employers/why-post']);

        return response()->json($employer->fresh()->load('user:id,email,is_active'));
    }

    public function uploadEmployerLogo(Request $request, string $id)
    {
        $employer = Employer::findOrFail($id);

        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,webp,svg|max:2048',
        ]);

        if ($employer->logo_path && str_starts_with($employer->logo_path, 'logos/')) {
            Storage::disk('public')->delete($employer->logo_path);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $url  = Storage::disk('public')->url($path);

        $employer->update(['logo_path' => $path]);

        return response()->json(['logo_path' => $path, 'logo_url' => $url]);
    }

    public function uploadEmployerCover(Request $request, string $id)
    {
        $employer = Employer::findOrFail($id);

        $request->validate([
            'cover' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($employer->cover_photo_path && str_starts_with($employer->cover_photo_path, 'covers/')) {
            Storage::disk('public')->delete($employer->cover_photo_path);
        }

        $path = $request->file('cover')->store('covers', 'public');
        $url  = Storage::disk('public')->url($path);

        $employer->update(['cover_photo_path' => $path]);

        return response()->json(['cover_photo_path' => $path, 'cover_url' => $url]);
    }
}
