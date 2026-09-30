<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kegiatans', function (Blueprint $table) {
            $table->id();
            $table->year('tahun');
            $table->string('kd_tim', 5)->nullable();
            $table->string('nm_tim')->nullable();
            $table->string('kd_giat', 10);
            $table->string('ur_giat');
            $table->string('satuan', 50)->nullable();
            $table->decimal('hr_satuan', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kegiatans');
    }
};
