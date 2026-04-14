<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreditsController extends Controller
{
    public function grant(Request $request)
    {
        $request->validate([
            'employer_id' => 'required|exists:employers,id',
            'package_id'  => 'required|exists:packages,id',
            'credits'     => 'required|integer|min:1|max:50',
            'note'        => 'nullable|string|max:500',
        ]);

        $employer = Employer::findOrFail($request->employer_id);
        $package  = Package::findOrFail($request->package_id);

        DB::table('employer_packages')->insert([
            'employer_id'       => $request->employer_id,
            'package_id'        => $request->package_id,
            'stripe_order_id'   => null,
            'credits_remaining' => $request->credits,
            'duration_days'     => $package->duration_days,
            'granted_by_admin'  => true,
            'expires_at'        => null,
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        DB::table('admin_audit_log')->insert([
            'admin_id'       => $request->user()->id,
            'target_user_id' => $employer->user_id,
            'action'         => 'grant_credits',
            'notes'          => ($request->note ?? 'Admin credit grant')
                                . ' — '
                                . $request->credits . ' × '
                                . $package->name . ' credits',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json([
            'message'  => 'Credits granted successfully.',
            'credits'  => $request->credits,
            'package'  => $package->name,
            'employer' => $employer->company_name,
        ], 201);
    }

    public function history()
    {
        $rows = DB::table('employer_packages as ep')
            ->join('employers as e', 'ep.employer_id', '=', 'e.id')
            ->join('packages as p', 'ep.package_id', '=', 'p.id')
            ->where('ep.granted_by_admin', true)
            ->select(
                'ep.*',
                'e.company_name',
                'p.name as package_name'
            )
            ->orderByDesc('ep.created_at')
            ->paginate(20);

        return response()->json($rows);
    }
}
