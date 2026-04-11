<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_match_cache', function (Blueprint $table) {
            $table->json('dimensions')->nullable()->after('match_reasons');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_match_cache', function (Blueprint $table) {
            $table->dropColumn('dimensions');
        });
    }
};
