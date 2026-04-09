<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->decimal('price', 8, 2);
            $table->unsignedInteger('post_count');
            $table->enum('post_type', ['regular', 'featured'])->default('regular');
            $table->unsignedInteger('duration_days');
            $table->boolean('includes_newsletter')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
