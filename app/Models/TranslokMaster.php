<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TranslokMaster extends Model
{
    use HasFactory;

    protected $table = 'translok_masters';

    protected $fillable = [
        'tahun',
        'kd_translok',
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

    protected static function booted(): void
    {
        static::saving(function (self $translok) {
            $volume = (int) $translok->vol_awal;
            $realisasi = (int) ($translok->realisasi_vol ?? 0);
            $rate = (float) $translok->rate;

            if ($volume < 0 || $realisasi < 0 || $realisasi > $volume) {
                throw new \InvalidArgumentException(
                    'Volume dan realisasi Translok tidak valid.'
                );
            }

            $sisaVolume = $volume - $realisasi;

            $translok->jml_anggaran = round($volume * $rate, 2);
            $translok->sisa_vol = $sisaVolume;
            $translok->sisa_anggaran = round($sisaVolume * $rate, 2);
        });
    }
}
