<?php

namespace App\Http\Controllers\Api;

use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController
{
    public function index(): JsonResponse
    {
        $posts = BlogPost::orderByDesc('published_at')
            ->whereNotNull('published_at')
            ->get([
                'id', 'title', 'slug', 'excerpt',
                'category', 'featured_image_path',
                'published_at',
            ]);

        return response()->json($posts);
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::where('slug', $slug)
            ->whereNotNull('published_at')
            ->firstOrFail();

        return response()->json($post);
    }
}
