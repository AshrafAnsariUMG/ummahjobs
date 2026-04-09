<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedJob extends Model
{
    public $timestamps = false;

    protected $fillable = ['candidate_id', 'job_id', 'saved_at'];

    protected function casts(): array
    {
        return [
            'saved_at' => 'datetime',
        ];
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
