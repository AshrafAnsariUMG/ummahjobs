<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_packages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employer_id');
            $table->foreign('employer_id')->references('id')->on('employers')->onDelete('cascade');
            $table->unsignedBigInteger('package_id');
            $table->foreign('package_id')->references('id')->on('packages')->onDelete('cascade');
            $table->string('stripe_order_id')->nullable()->unique();
            $table->unsignedInteger('credits_remaining')->default(0);
            $table->unsignedInteger('duration_days');
            $table->boolean('granted_by_admin')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_packages');
    }
};
