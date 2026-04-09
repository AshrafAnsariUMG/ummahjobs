<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'author_id', 'title', 'slug', 'content', 'excerpt',
        'category', 'featured_image_path', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
