<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'job_id', 'candidate_id', 'status', 'cover_letter', 'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
