<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        return response()->json($employer->load('user:id,email,is_active'));
    }
}
