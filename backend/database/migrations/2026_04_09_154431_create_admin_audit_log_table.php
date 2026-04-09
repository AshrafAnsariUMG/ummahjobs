<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_audit_log', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('admin_id');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('target_user_id')->nullable();
            $table->foreign('target_user_id')->references('id')->on('users')->onDelete('set null');
            $table->string('action');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_log');
    }
};
