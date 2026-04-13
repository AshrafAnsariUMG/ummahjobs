<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index()
    {
        $posts = BlogPost::orderByDesc('created_at')
            ->get([
                'id', 'title', 'slug', 'category',
                'excerpt', 'featured_image_path',
                'published_at', 'created_at', 'updated_at',
            ]);

        return response()->json(['posts' => $posts]);
    }

    public function show(string $slug)
    {
        $post = BlogPost::where('slug', $slug)->firstOrFail();
        return response()->json(['post' => $post]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'                => 'required|string|max:255',
            'content'              => 'required|string',
            'category'             => 'nullable|string|max:100',
            'excerpt'              => 'nullable|string|max:500',
            'featured_image_path'  => 'nullable|string',
            'published_at'         => 'nullable|date',
            'slug'                 => 'nullable|string|max:255|unique:blog_posts,slug',
        ]);

        $slug = $request->slug;
        if (!$slug) {
            $slug = Str::slug($request->title);
            $base = $slug;
            $i = 1;
            while (BlogPost::where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i++;
            }
        }

        $post = BlogPost::create([
            'author_id'           => $request->user()->id,
            'title'               => $request->title,
            'slug'                => $slug,
            'content'             => $request->content,
            'category'            => $request->category,
            'excerpt'             => $request->excerpt
                ?? Str::limit(strip_tags($request->content), 200),
            'featured_image_path' => $request->featured_image_path,
            'published_at'        => $request->published_at,
        ]);

        return response()->json(['post' => $post, 'slug' => $post->slug], 201);
    }

    public function update(Request $request, string $slug)
    {
        $post = BlogPost::where('slug', $slug)->firstOrFail();

        $request->validate([
            'title'               => 'nullable|string|max:255',
            'content'             => 'nullable|string',
            'category'            => 'nullable|string|max:100',
            'excerpt'             => 'nullable|string|max:500',
            'featured_image_path' => 'nullable|string',
            'published_at'        => 'nullable|date',
            'slug'                => 'nullable|string|max:255|unique:blog_posts,slug,' . $post->id,
        ]);

        $data = $request->only([
            'title', 'content', 'category', 'excerpt',
            'featured_image_path', 'published_at', 'slug',
        ]);

        // Regenerate slug from title if title changed and no slug provided
        if (isset($data['title']) && !$request->slug && $data['title'] !== $post->title) {
            $newSlug = Str::slug($data['title']);
            $base = $newSlug;
            $i = 1;
            while (BlogPost::where('slug', $newSlug)->where('id', '!=', $post->id)->exists()) {
                $newSlug = $base . '-' . $i++;
            }
            $data['slug'] = $newSlug;
        }

        $post->update($data);

        return response()->json(['post' => $post->fresh()]);
    }

    public function destroy(string $slug)
    {
        $post = BlogPost::where('slug', $slug)->firstOrFail();
        $post->delete();

        return response()->json(['message' => 'Post deleted.']);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $path = $request->file('image')->store('blog', 'public');

        return response()->json([
            'path' => $path,
            'url'  => Storage::url($path),
        ]);
    }
}
