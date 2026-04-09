<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->enum('role', ['candidate', 'employer', 'admin'])->default('candidate');
            $table->boolean('legacy_password')->default(true);
            $table->string('display_name');
            $table->string('ummahpass_id')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
