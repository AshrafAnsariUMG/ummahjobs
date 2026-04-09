<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stripe_orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('employer_id');
            $table->foreign('employer_id')->references('id')->on('employers')->onDelete('cascade');
            $table->unsignedBigInteger('package_id');
            $table->foreign('package_id')->references('id')->on('packages')->onDelete('cascade');
            $table->string('stripe_session_id')->unique();
            $table->decimal('amount', 8, 2);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stripe_orders');
    }
};
