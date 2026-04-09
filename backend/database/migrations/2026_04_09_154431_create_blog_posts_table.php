<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('author_id')->nullable();
            $table->foreign('author_id')->references('id')->on('users')->onDelete('set null');
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content');
            $table->text('excerpt')->nullable();
            $table->string('category')->nullable();
            $table->string('featured_image_path')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
