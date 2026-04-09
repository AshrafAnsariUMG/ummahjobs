<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->string('location')->nullable();
            $table->string('phone')->nullable();
            $table->string('gender')->nullable();
            $table->string('age_range')->nullable();
            $table->string('experience_years')->nullable();
            $table->string('qualification')->nullable();
            $table->json('languages')->nullable();
            $table->string('job_category')->nullable();
            $table->string('salary_type')->nullable();
            $table->json('socials')->nullable();
            $table->string('cv_path')->nullable();
            $table->string('profile_photo_path')->nullable();
            $table->boolean('show_profile')->default(true);
            $table->decimal('profile_complete_pct', 5, 2)->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
