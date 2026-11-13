<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TranslokMaster extends Model
{
    use HasFactory;

    protected $table = 'tb_translok_master';

    protected $fillable = [
        'tahun',
        'tim_id',
        'kegiatan_id',
        'kd_translok',
        'uraian',
        'vol_a',
        'satuan',
        'rate',
        'status',
        'legacy_id',
        'created_by',
    ];

    protected $casts = [
        'tahun' => 'string',
        'tim_id' => 'integer',
        'kegiatan_id' => 'integer',
        'vol_a' => 'integer',
        'rate' => 'decimal:2',
        'created_by' => 'integer',
    ];

    protected $appends = ['pagu_anggaran'];

    /**
     * Virtual attribute untuk pagu_anggaran (vol_a * rate)
     */
    protected function paguAnggaran(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) =>
                isset($attributes['vol_a'], $attributes['rate'])
                    ? (float) $attributes['vol_a'] * (float) $attributes['rate']
                    : 0,
        );
    }

    public function tim(): BelongsTo
    {
        return $this->belongsTo(Tim::class, 'tim_id');
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function alokasi(): HasMany
    {
        return $this->hasMany(
            TranslokAlokasi::class,
            'translok_master_id'
        );
    }

    public function scopeTahun(Builder $query, int $tahun): Builder
    {
        return $query->where('tahun', (string) $tahun);
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeBelumDitutup(Builder $query): Builder
    {
        return $query->whereIn('status', [
            'draft',
            'aktif',
        ]);
    }
}
