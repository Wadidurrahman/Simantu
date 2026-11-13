<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_honor', function (Blueprint $table) {
            $table->id();
            $table->string('kode_honor')->nullable();
            $table->string('uraian')->nullable();
            $table->decimal('satuan_biaya', 15, 2)->default(0);
            $table->string('satuan')->nullable();
            $table->integer('tahun')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_honor');
    }
};