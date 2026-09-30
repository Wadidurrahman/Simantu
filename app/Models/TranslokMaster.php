<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TranslokMaster extends Model
{
    use HasFactory;

    protected $table = 'translok_masters';
    protected $guarded = ['id'];

    // Relasi: Translok Alokasi ini milik 1 Kegiatan
    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }

    // AUTO-CALCULATION
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($translok) {
            // Hitung Total Anggaran
            $translok->jml_anggaran = $translok->vol_awal * $translok->rate;

            // Hitung Sisa Volume & Anggaran
            $translok->sisa_vol = $translok->vol_awal - $translok->realisasi_vol;
            $translok->sisa_anggaran = $translok->jml_anggaran - ($translok->realisasi_vol * $translok->rate);
        });
    }
}
