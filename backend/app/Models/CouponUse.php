<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponUse extends Model
{
    protected $fillable = [
        'coupon_id',
        'employer_id',
        'package_id',
        'original_price',
        'discount_amount',
        'final_price',
        'stripe_session_id',
    ];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
