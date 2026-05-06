<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExternalEmployer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExternalEmployerController extends Controller
{
    public function index(Request $request)
    {
        $employers = ExternalEmployer::when(
            $request->q,
            fn($query) => $query->where('name', 'like', '%' . $request->q . '%')
        )->orderBy('name')->limit(20)->get();

        return response()->json(['employers' => $employers]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'website' => 'nullable|url|max:255',
            'email'   => 'nullable|email|max:255',
        ]);

        $existing = ExternalEmployer::whereRaw(
            'LOWER(name) = ?',
            [strtolower($request->name)]
        )->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $employer = ExternalEmployer::create([
            'name'    => $request->name,
            'website' => $request->website,
            'email'   => $request->email,
        ]);

        return response()->json($employer, 201);
    }

    public function uploadLogo(Request $request, string $id)
    {
        $employer = ExternalEmployer::findOrFail($id);

        $request->validate([
            'logo' => 'required|image|max:2048',
        ]);

        if ($employer->logo_path) {
            Storage::disk('public')->delete($employer->logo_path);
        }

        $path = $request->file('logo')->store('logos', 'public');
        $employer->update(['logo_path' => $path]);

        return response()->json($employer->fresh());
    }
}
