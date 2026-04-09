<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StripeOrder extends Model
{
    protected $fillable = [
        'employer_id', 'package_id', 'stripe_session_id',
        'amount', 'status', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
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
