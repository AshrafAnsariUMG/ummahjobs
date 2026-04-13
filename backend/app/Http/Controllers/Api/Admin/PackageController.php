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
