<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $fillable = [
        'employer_id', 'employer_package_id', 'category_id', 'title', 'slug',
        'description', 'job_type', 'location', 'country', 'salary_min',
        'salary_max', 'salary_currency', 'salary_type', 'experience_level',
        'career_level', 'apply_type', 'apply_url', 'is_featured', 'is_urgent',
        'status', 'expires_at', 'views_count',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_urgent'   => 'boolean',
            'expires_at'  => 'datetime',
        ];
    }

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }

    public function category()
    {
        return $this->belongsTo(JobCategory::class, 'category_id');
    }

    public function employerPackage()
    {
        return $this->belongsTo(EmployerPackage::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }
}
