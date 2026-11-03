<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Translok extends Model
{
    use HasFactory;

    protected $table = 'translok_masters';

    protected $fillable = [
        'tahun',
        'kegiatan_id',
        'vol_awal',
        'satuan',
        'rate',
        'jml_anggaran',
        'realisasi_vol',
        'sisa_vol',
        'sisa_anggaran',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'kegiatan_id' => 'integer',
        'vol_awal' => 'integer',
        'rate' => 'decimal:2',
        'jml_anggaran' => 'decimal:2',
        'realisasi_vol' => 'integer',
        'sisa_vol' => 'integer',
        'sisa_anggaran' => 'decimal:2',
    ];

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }
}
