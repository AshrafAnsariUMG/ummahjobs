<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'package_ids',
        'total_usage_limit',
        'per_employer_limit',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'package_ids' => 'array',
            'expires_at'  => 'datetime',
            'is_active'   => 'boolean',
        ];
    }

    public function uses()
    {
        return $this->hasMany(CouponUse::class);
    }

    public function isValid(int $packageId, int $employerId): array
    {
        if (!$this->is_active) {
            return ['valid' => false, 'message' => 'This coupon is inactive.'];
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return ['valid' => false, 'message' => 'This coupon has expired.'];
        }

        if ($this->package_ids && !in_array($packageId, $this->package_ids)) {
            return ['valid' => false, 'message' => 'This coupon is not valid for this package.'];
        }

        if ($this->total_usage_limit) {
            $totalUses = CouponUse::where('coupon_id', $this->id)->count();
            if ($totalUses >= $this->total_usage_limit) {
                return ['valid' => false, 'message' => 'This coupon has reached its usage limit.'];
            }
        }

        $employerUses = CouponUse::where('coupon_id', $this->id)
            ->where('employer_id', $employerId)
            ->count();

        if ($employerUses >= $this->per_employer_limit) {
            return ['valid' => false, 'message' => 'You have already used this coupon.'];
        }

        return ['valid' => true, 'message' => 'Coupon applied!'];
    }

    public function calculateDiscount(float $price): float
    {
        if ($this->discount_type === 'percentage') {
            return round($price * ($this->discount_value / 100), 2);
        }
        return min((float) $this->discount_value, $price);
    }
}
