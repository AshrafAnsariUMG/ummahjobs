<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployerPackage extends Model
{
    protected $fillable = [
        'employer_id', 'package_id', 'stripe_order_id', 'credits_remaining',
        'duration_days', 'granted_by_admin', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'granted_by_admin' => 'boolean',
            'expires_at'       => 'datetime',
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

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
