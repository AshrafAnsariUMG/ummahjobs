<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Allow user/candidate/employer FKs to be nullable so deleted users'
     * shared data (applications, messages, feedback, reviews, orders, coupon uses)
     * can be anonymised rather than hard-deleted, preserving counterparties' records.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE job_applications MODIFY candidate_id BIGINT UNSIGNED NULL");
        DB::statement("ALTER TABLE messages MODIFY sender_id VARCHAR(255) NULL");
        DB::statement("ALTER TABLE feedback MODIFY user_id VARCHAR(255) NULL");
        DB::statement("ALTER TABLE employer_reviews MODIFY reviewer_id VARCHAR(255) NULL");
        DB::statement("ALTER TABLE employer_reviews MODIFY employer_id BIGINT UNSIGNED NULL");
        DB::statement("ALTER TABLE stripe_orders MODIFY employer_id BIGINT UNSIGNED NULL");
        DB::statement("ALTER TABLE coupon_uses MODIFY employer_id BIGINT UNSIGNED NULL");
    }

    public function down(): void
    {
        // Re-tightening these would orphan deleted-user rows; intentionally a no-op.
        // If you need a strict down(), delete the orphan rows first then re-apply NOT NULL.
    }
};
