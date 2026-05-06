<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $coupons = Coupon::withCount('uses')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $coupons->items(),
            'meta' => [
                'current_page' => $coupons->currentPage(),
                'last_page'    => $coupons->lastPage(),
                'total'        => $coupons->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->merge(['code' => strtoupper($request->code)]);

        $validated = $request->validate([
            'code'               => 'required|string|max:50|unique:coupons,code',
            'discount_type'      => 'required|in:percentage,fixed',
            'discount_value'     => [
                'required', 'numeric', 'min:0',
                function ($attr, $val, $fail) use ($request) {
                    if ($request->discount_type === 'percentage' && $val > 100) {
                        $fail('Percentage discount cannot exceed 100.');
                    }
                },
            ],
            'package_ids'        => 'nullable|array',
            'package_ids.*'      => 'integer|exists:packages,id',
            'total_usage_limit'  => 'nullable|integer|min:1',
            'per_employer_limit' => 'required|integer|min:1',
            'expires_at'         => 'nullable|date|after:today',
            'is_active'          => 'boolean',
        ]);

        $coupon = Coupon::create($validated);

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'create_coupon',
            'notes'      => 'Created coupon: ' . $coupon->code,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json($coupon, 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Coupon::withCount('uses')->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $coupon = Coupon::findOrFail($id);

        if ($request->has('code')) {
            $request->merge(['code' => strtoupper($request->code)]);
        }

        $validated = $request->validate([
            'code'               => ['sometimes', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($coupon->id)],
            'discount_type'      => 'sometimes|in:percentage,fixed',
            'discount_value'     => [
                'sometimes', 'numeric', 'min:0',
                function ($attr, $val, $fail) use ($request, $coupon) {
                    $type = $request->discount_type ?? $coupon->discount_type;
                    if ($type === 'percentage' && $val > 100) {
                        $fail('Percentage discount cannot exceed 100.');
                    }
                },
            ],
            'package_ids'        => 'nullable|array',
            'package_ids.*'      => 'integer|exists:packages,id',
            'total_usage_limit'  => 'nullable|integer|min:1',
            'per_employer_limit' => 'sometimes|integer|min:1',
            'expires_at'         => 'nullable|date',
            'is_active'          => 'boolean',
        ]);

        $coupon->update($validated);

        return response()->json($coupon->fresh());
    }

    public function destroy(Request $request, string $id)
    {
        $coupon = Coupon::findOrFail($id);
        $code   = $coupon->code;
        $coupon->delete();

        DB::table('admin_audit_log')->insert([
            'admin_id'   => $request->user()->id,
            'action'     => 'delete_coupon',
            'notes'      => 'Deleted coupon: ' . $code,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Coupon deleted.']);
    }
}
