
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

        Schema::create('translok_booking_slots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('window_id');
            $table->string('id_alokasi', 255);
            $table->string('detail_id', 255)->unique();
            $table->string('nip_lama', 24);
            $table->dateTime('starts_at')->unique();
            $table->timestamps();

            $table->foreign('window_id')
                ->references('id')
                ->on('translok_booking_windows')
                ->restrictOnDelete();

            $table->index(['id_alokasi', 'nip_lama']);
        });

        Schema::create('translok_booking_mutex', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
        });

        DB::table('translok_booking_mutex')->insert(['id' => 1]);
    }

    public function down(): void
    {
        Schema::dropIfExists('translok_booking_slots');
        Schema::dropIfExists('translok_booking_windows');
        Schema::dropIfExists('translok_booking_mutex');
    }
};
