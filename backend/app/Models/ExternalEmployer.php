<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ExternalEmployer extends Model
{
    protected $fillable = [
        'name',
        'website',
        'email',
        'logo_path',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::url($this->logo_path) : null;
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
