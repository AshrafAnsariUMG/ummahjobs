<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::orderBy('price')->get();

        $packages = $packages->map(function ($pkg) {
            $pkg->total_purchases = DB::table('employer_packages')
                ->where('package_id', $pkg->id)
                ->where('granted_by_admin', false)
                ->count();

            $pkg->total_revenue = DB::table('stripe_orders')
                ->where('package_id', $pkg->id)
                ->where('status', 'completed')
                ->sum('amount');

            return $pkg;
        });

        return response()->json(['packages' => $packages]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'                => 'required|string|max:100|unique:packages,name',
            'price'               => 'required|numeric|min:0',
            'post_count'          => 'required|integer|min:1',
            'duration_days'       => 'required|integer|min:1',
            'post_type'           => 'required|in:regular,featured',
            'includes_newsletter' => 'boolean',
            'is_active'           => 'boolean',
            'description'         => 'nullable|string|max:500',
        ]);

        $package = Package::create([
            'name'                => $request->name,
            'price'               => $request->price,
            'post_count'          => $request->post_count,
            'duration_days'       => $request->duration_days,
            'post_type'           => $request->post_type,
            'includes_newsletter' => $request->includes_newsletter ?? false,
            'is_active'           => $request->is_active ?? true,
            'description'         => $request->description,
        ]);

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'create_package',
            'notes'      => 'Created package: ' . $package->name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['package' => $package], 201);
    }

    public function destroy(Request $request, string $id)
    {
        $package = Package::findOrFail($id);

        $activeCredits = DB::table('employer_packages')
            ->where('package_id', $id)
            ->where('credits_remaining', '>', 0)
            ->count();

        if ($activeCredits > 0) {
            return response()->json([
                'message'        => 'Cannot delete this package. ' . $activeCredits . ' employer(s) still have active credits. Deactivate it instead.',
                'active_credits' => $activeCredits,
            ], 422);
        }

        $name = $package->name;
        $package->delete();

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'delete_package',
            'notes'      => 'Deleted package: ' . $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Package deleted.']);
    }

    public function update(Request $request, string $id)
    {
        $package = Package::findOrFail($id);

        $request->validate([
            'name'                => 'nullable|string|max:100',
            'price'               => 'nullable|numeric|min:0',
            'post_count'          => 'nullable|integer|min:1',
            'duration_days'       => 'nullable|integer|min:1',
            'post_type'           => 'nullable|in:regular,featured',
            'includes_newsletter' => 'nullable|boolean',
            'is_active'           => 'nullable|boolean',
            'description'         => 'nullable|string|max:500',
        ]);

        $package->update($request->only([
            'name', 'price', 'post_count', 'duration_days',
            'post_type', 'includes_newsletter', 'is_active', 'description',
        ]));

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'update_package',
            'notes'      => 'Updated package: ' . $package->name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['package' => $package->fresh()]);
    }
}
