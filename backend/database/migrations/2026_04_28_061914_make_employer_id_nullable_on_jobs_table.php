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
        // The column may already have its FK dropped from a partial previous run.
        // Ensure it's the right type (bigint unsigned) + nullable, then re-add FK.
        DB::statement('ALTER TABLE jobs MODIFY employer_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE jobs ADD CONSTRAINT jobs_employer_id_foreign FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE jobs DROP FOREIGN KEY jobs_employer_id_foreign');
        DB::statement('ALTER TABLE jobs MODIFY employer_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE jobs ADD CONSTRAINT jobs_employer_id_foreign FOREIGN KEY (employer_id) REFERENCES employers(id)');
    }
};
