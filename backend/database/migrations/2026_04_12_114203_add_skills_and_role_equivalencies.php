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
        Schema::table('candidates', function (Blueprint $table) {
            $table->json('skills')->nullable()->after('languages');
        });

        Schema::create('role_equivalencies', function (Blueprint $table) {
            $table->id();
            $table->string('group_name');
            $table->json('terms');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn('skills');
        });

        Schema::dropIfExists('role_equivalencies');
    }
};
