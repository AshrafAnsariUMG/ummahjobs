<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Package;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request)
    {
        $request->validate([
            'code'       => 'required|string',
            'package_id' => 'required|integer',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json(['valid' => false, 'message' => 'Invalid coupon code.'], 422);
        }

        $employer = $request->user()->employer;
        if (!$employer) {
            return response()->json(['valid' => false, 'message' => 'Employer profile not found.'], 403);
        }

        $package = Package::find($request->package_id);
        if (!$package) {
            return response()->json(['valid' => false, 'message' => 'Package not found.'], 422);
        }

        $validation = $coupon->isValid($package->id, $employer->id);

        if (!$validation['valid']) {
            return response()->json(['valid' => false, 'message' => $validation['message']], 422);
        }

        $discount   = $coupon->calculateDiscount((float) $package->price);
        $finalPrice = round((float) $package->price - $discount, 2);

        $message = $coupon->discount_type === 'percentage'
            ? $coupon->discount_value . '% off applied!'
            : '$' . $discount . ' off applied!';

        return response()->json([
            'valid'          => true,
            'coupon_id'      => $coupon->id,
            'code'           => $coupon->code,
            'discount_type'  => $coupon->discount_type,
            'discount_value' => $coupon->discount_value,
            'original_price' => (float) $package->price,
            'discount_amount'=> $discount,
            'final_price'    => $finalPrice,
            'message'        => $message,
        ]);
    }
}
