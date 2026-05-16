<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL enum columns can't be made nullable via Blueprint's change()
        // because doctrine/dbal doesn't understand enum. Use raw SQL.
        DB::statement("ALTER TABLE users MODIFY role ENUM('candidate','employer','admin') NULL");
    }

    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'candidate' WHERE role IS NULL");
        DB::statement("ALTER TABLE users MODIFY role ENUM('candidate','employer','admin') NOT NULL DEFAULT 'candidate'");
    }
};
