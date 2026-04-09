<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('sender_id');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('recipient_id');
            $table->foreign('recipient_id')->references('id')->on('users')->onDelete('cascade');
            $table->unsignedBigInteger('job_id')->nullable();
            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('set null');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
