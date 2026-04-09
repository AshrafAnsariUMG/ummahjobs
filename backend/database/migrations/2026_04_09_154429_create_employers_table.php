<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('company_name');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->json('socials')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('cover_photo_path')->nullable();
            $table->decimal('map_lat', 10, 7)->nullable();
            $table->decimal('map_lng', 10, 7)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('show_profile')->default(true);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employers');
    }
};
