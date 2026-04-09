<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name', 'price', 'post_count', 'post_type',
        'duration_days', 'includes_newsletter', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'includes_newsletter' => 'boolean',
            'is_active'           => 'boolean',
        ];
    }

    public function employerPackages()
    {
        return $this->hasMany(EmployerPackage::class);
    }
}
