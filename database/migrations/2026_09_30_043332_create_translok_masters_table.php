<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translok_masters', function (Blueprint $table) {
            $table->id();
            $table->year('tahun');

            // Relasi ke tabel kegiatans (Uraian kegiatan tidak lagi diketik manual, tapi ambil dari ID ini)
            $table->foreignId('kegiatan_id')->constrained('kegiatans')->onDelete('restrict');


            $table->integer('vol_awal')->default(0);      // Dulu: vol_a
            $table->string('satuan', 50)->nullable();     // Dulu: sat
            $table->decimal('rate', 15, 2)->default(0);

            // Kolom Kalkulasi
            $table->decimal('jml_anggaran', 15, 2)->default(0); // Dulu: jml_a
            $table->integer('realisasi_vol')->default(0);       // Dulu: r_v
            $table->integer('sisa_vol')->default(0);            // Dulu: sisa_v
            $table->decimal('sisa_anggaran', 15, 2)->default(0); // Dulu: sisa_a

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translok_masters');
    }
};
