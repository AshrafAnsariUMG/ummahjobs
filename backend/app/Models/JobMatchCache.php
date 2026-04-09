<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobMatchCache extends Model
{
    public $timestamps = false;

    protected $table = 'job_match_cache';

    protected $fillable = [
        'job_id', 'candidate_id', 'match_score', 'match_reasons', 'cached_at',
    ];

    protected function casts(): array
    {
        return [
            'match_reasons' => 'array',
            'cached_at'     => 'datetime',
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
