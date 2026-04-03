<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // payment_status is separate from appointment status
            $table->string('payment_status')->default('not_required')->after('status');
            $table->string('mp_preference_id')->nullable()->after('payment_status');
            $table->string('mp_payment_id')->nullable()->after('mp_preference_id');
            $table->decimal('deposit_amount', 10, 2)->nullable()->after('mp_payment_id');
            $table->decimal('deposit_percentage', 5, 2)->nullable()->after('deposit_amount');
            $table->timestamp('payment_expires_at')->nullable()->after('deposit_percentage');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'mp_preference_id',
                'mp_payment_id',
                'deposit_amount',
                'deposit_percentage',
                'payment_expires_at',
            ]);
        });
    }
};
