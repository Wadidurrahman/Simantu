<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TranslokAlokasi extends Model
{
    use HasFactory;

    protected $table = 'tb_translok_alokasi';

    protected $fillable = [
        'translok_master_id',
        'kegiatan_id',
        'pegawai_id',
        'dialokasikan_oleh',
        'tanggal_mulai',
        'tanggal_selesai',
        'volume',
        'status', // draft, disetujui, selesai, dibatalkan
        'catatan',
        'legacy_id',
        'disetujui_oleh',
        'disetujui_pada',
        'created_by',
    ];

    protected $casts = [
        'translok_master_id' => 'integer',
        'kegiatan_id' => 'integer',
        'pegawai_id' => 'integer',
        'dialokasikan_oleh' => 'integer',
        'disetujui_oleh' => 'integer',
        'created_by' => 'integer',
        'volume' => 'integer',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'disetujui_pada' => 'datetime',
    ];

    /**
     * Relasi ke Master Translok
     */
    public function master(): BelongsTo
    {
        return $this->belongsTo(TranslokMaster::class, 'translok_master_id');
    }

    /**
     * Relasi ke Kegiatan
     */
    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }

    /**
     * Relasi ke Pegawai (User)
     */
    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pegawai_id');
    }

    /**
     * Relasi ke User yang mengalokasikan
     */
    public function pengalokasi(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dialokasikan_oleh');
    }

    /**
     * Relasi ke User yang menyetujui
     */
    public function penyetuju(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    /**
     * Relasi ke Detail Perjalanan
     */
    public function detail(): HasMany
    {
        return $this->hasMany(TranslokDetail::class, 'translok_alokasi_id');
    }

    /**
     * Relasi ke Riwayat Perubahan
     */
    public function riwayat(): HasMany
    {
        return $this->hasMany(TranslokRiwayat::class, 'translok_alokasi_id');
    }

    /**
     * Scope untuk mengambil alokasi yang memotong saldo master
     * (Hanya status 'disetujui' dan 'selesai')
     */
    public function scopeMengurangiSaldo(Builder $query): Builder
    {
        return $query->whereIn('status', ['disetujui', 'selesai']);
    }

    /**
     * Scope untuk alokasi yang aktif (belum dibatalkan)
     */
    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', '!=', 'dibatalkan');
    }
}
