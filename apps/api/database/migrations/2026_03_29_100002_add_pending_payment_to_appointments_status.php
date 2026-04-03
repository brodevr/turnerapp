<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('pending','confirmed','cancelled','completed','no_show','pending_payment') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Move any pending_payment rows back to pending before removing the value
        DB::statement("UPDATE appointments SET status = 'pending' WHERE status = 'pending_payment'");
        DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending'");
    }
};
