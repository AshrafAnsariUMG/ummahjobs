<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployerReview extends Model
{
    protected $fillable = [
        'employer_id', 'reviewer_id', 'rating', 'review_text',
    ];

    public function employer()
    {
        return $this->belongsTo(Employer::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
