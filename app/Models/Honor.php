<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Honor extends Model
{
    use HasFactory;

    protected $table = 'master_honor'; // Sesuaikan dengan nama tabel di bpsn6815_wilkerstat.sql

    protected $fillable = [
        'nama_kegiatan',
        'golongan',
        'besaran_honor',
        'tahun_anggaran',
    ];

    protected $casts = [
        'besaran_honor' => 'decimal:2',
    ];
}
