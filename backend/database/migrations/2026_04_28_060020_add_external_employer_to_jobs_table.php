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
            $table->string('external_employer_name')->nullable()->after('employer_id');
            $table->string('external_employer_website')->nullable()->after('external_employer_name');
            $table->string('external_employer_email')->nullable()->after('external_employer_website');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn(['external_employer_name', 'external_employer_website', 'external_employer_email']);
        });
    }
};
