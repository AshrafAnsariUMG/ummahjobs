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
        Schema::table('jobs', function (Blueprint $table) {
            // Column already exists from a partially-run migration; only add the FK
            $table->foreign('external_employer_id')
                ->references('id')
                ->on('external_employers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropForeign(['external_employer_id']);
            $table->dropColumn('external_employer_id');
        });
    }
};
