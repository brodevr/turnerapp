<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, decimal, boolean
            $table->string('description')->nullable();
            $table->timestamps();
        });

        DB::table('settings')->insert([
            [
                'key'         => 'deposit_percentage',
                'value'       => '30',
                'type'        => 'decimal',
                'description' => 'Percentage of service price required as deposit',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'key'         => 'payment_expiry_minutes',
                'value'       => '30',
                'type'        => 'integer',
                'description' => 'Minutes before unpaid appointments are auto-cancelled',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'key'         => 'payment_enabled',
                'value'       => '1',
                'type'        => 'boolean',
                'description' => 'Whether deposit payment is required for booking',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
