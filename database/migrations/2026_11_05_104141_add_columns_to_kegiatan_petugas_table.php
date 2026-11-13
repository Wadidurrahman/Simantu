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
        Schema::table('kegiatan_petugas', function (Blueprint $table) {
            $table->string('id_a')->unique()->after('id'); // ID Unik
            $table->integer('tahun')->after('id_a');
            $table->string('kd_bulan', 2)->after('tahun');
            $table->string('id_sobat')->after('kd_bulan');
            $table->string('nama')->after('id_sobat');
            $table->string('kd_tim')->after('nama');
            $table->string('nm_tim')->after('kd_tim');
            $table->string('kd_giat')->after('nm_tim');
            $table->string('ur_giat')->after('kd_giat');
            $table->string('satuan')->after('ur_giat');
            $table->decimal('hr_satuan', 15, 2)->after('satuan');
            $table->decimal('vol', 10, 2)->after('hr_satuan');
            $table->decimal('jml_hr', 15, 2)->after('vol'); 
            $table->string('user')->nullable()->after('jml_hr');
            
            $table->string('no_spt')->nullable()->after('user');
            $table->date('tgl_spt')->nullable()->after('no_spt');
            $table->string('no_bast')->nullable()->after('tgl_spt');
            $table->date('tgl_bast')->nullable()->after('no_bast');
            $table->tinyInteger('flag_bast')->default(0)->after('tgl_bast');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kegiatan_petugas', function (Blueprint $table) {
            $table->dropColumn([
                'id_a', 'tahun', 'kd_bulan', 'id_sobat', 'nama', 
                'kd_tim', 'nm_tim', 'kd_giat', 'ur_giat', 'satuan', 
                'hr_satuan', 'vol', 'jml_hr', 'user',
                'no_spt', 'tgl_spt', 'no_bast', 'tgl_bast', 'flag_bast'
            ]);
        });
    }
};