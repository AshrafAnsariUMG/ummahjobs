<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobAlert extends Model
{
    protected $fillable = [
        'candidate_id', 'keyword', 'category_id', 'location',
        'job_type', 'frequency', 'last_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'last_sent_at' => 'datetime',
        ];
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function category()
    {
        return $this->belongsTo(JobCategory::class, 'category_id');
    }
}
