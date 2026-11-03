<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('translok_booking_windows')) {
            Schema::create('translok_booking_windows', function (Blueprint $table) {
                $table->id();
                $table->date('date_start');
                $table->date('date_end');
                $table->time('time_start');
                $table->time('time_end');
                $table->dateTime('deadline');
                $table->string('description', 255);
                $table->boolean('active')->default(true);
                $table->timestamps();

                $table->index(['date_start', 'date_end', 'active']);
            });
        }
    }

    public function down(): void
    {
    }
};
