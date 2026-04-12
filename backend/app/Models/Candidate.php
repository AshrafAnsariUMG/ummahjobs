<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $fillable = [
        'user_id', 'title', 'location', 'phone', 'gender', 'age_range',
        'experience_years', 'qualification', 'languages', 'skills', 'job_category',
        'salary_type', 'socials', 'cv_path', 'profile_photo_path',
        'show_profile', 'profile_complete_pct', 'views_count',
    ];

    protected function casts(): array
    {
        return [
            'languages'           => 'array',
            'skills'              => 'array',
            'socials'             => 'array',
            'show_profile'        => 'boolean',
            'profile_complete_pct'=> 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class);
    }

    public function alerts()
    {
        return $this->hasMany(JobAlert::class);
    }
}
