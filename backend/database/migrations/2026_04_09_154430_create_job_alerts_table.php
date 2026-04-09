<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_alerts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('candidate_id');
            $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('cascade');
            $table->string('keyword')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('job_categories')->onDelete('set null');
            $table->string('location')->nullable();
            $table->string('job_type')->nullable();
            $table->enum('frequency', ['daily', 'weekly'])->default('daily');
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_alerts');
    }
};
