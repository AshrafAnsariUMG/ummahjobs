<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employer_id');
            $table->foreign('employer_id')->references('id')->on('employers')->onDelete('cascade');
            $table->unsignedBigInteger('employer_package_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('job_categories')->onDelete('set null');
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description');
            $table->string('job_type')->nullable();
            $table->string('location')->nullable();
            $table->string('country')->nullable();
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->string('salary_currency')->default('USD');
            $table->string('salary_type')->nullable();
            $table->string('experience_level')->nullable();
            $table->string('career_level')->nullable();
            $table->enum('apply_type', ['external', 'platform'])->default('external');
            $table->string('apply_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_urgent')->default(false);
            $table->enum('status', ['active', 'expired', 'draft'])->default('draft');
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
