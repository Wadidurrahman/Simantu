<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->unique(
                ['tahun', 'kd_tim', 'kd_giat'],
                'kegiatans_tahun_tim_giat_unique'
            );

            $table->index(
                ['tahun', 'kd_tim'],
                'kegiatans_tahun_tim_index'
            );

            $table->index(
                'is_active',
                'kegiatans_is_active_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->dropUnique('kegiatans_tahun_tim_giat_unique');
            $table->dropIndex('kegiatans_tahun_tim_index');
            $table->dropIndex('kegiatans_is_active_index');
        });
    }
};
