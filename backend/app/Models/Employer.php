<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employer extends Model
{
    protected $fillable = [
        'user_id', 'company_name', 'slug', 'category', 'description',
        'email', 'phone', 'address', 'socials', 'logo_path',
        'cover_photo_path', 'map_lat', 'map_lng', 'is_verified',
        'show_profile', 'views_count',
    ];

    protected function casts(): array
    {
        return [
            'socials'     => 'array',
            'is_verified' => 'boolean',
            'show_profile'=> 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function packages()
    {
        return $this->hasMany(EmployerPackage::class);
    }

    public function reviews()
    {
        return $this->hasMany(EmployerReview::class);
    }
}
