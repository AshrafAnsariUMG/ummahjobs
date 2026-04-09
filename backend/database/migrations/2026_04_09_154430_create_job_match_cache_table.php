<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_match_cache', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('job_id');
            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('cascade');
            $table->unsignedBigInteger('candidate_id');
            $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('cascade');
            $table->unsignedTinyInteger('match_score');
            $table->json('match_reasons')->nullable();
            $table->timestamp('cached_at')->useCurrent();
            $table->unique(['job_id', 'candidate_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_match_cache');
    }
};
