<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kegiatan extends Model
{
    protected $table = 'tb_kegiatan';

    protected $fillable = [
        'tahun',
        'tim_id',
        'kd_tim',
        'kd_giat',
        'ur_giat',
        'satuan',
        'hr_satuan',
        'tanggal_mulai',
        'tanggal_selesai',
        'status',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tahun' => 'string',
            'hr_satuan' => 'decimal:2',
            'tanggal_mulai' => 'date:Y-m-d',
            'tanggal_selesai' => 'date:Y-m-d',
            'is_active' => 'boolean',
        ];
    }

    public function tim(): BelongsTo
    {
        return $this->belongsTo(Tim::class, 'tim_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeTahun(Builder $query, int $tahun): Builder
    {
        return $query->where('tahun', (string) $tahun);
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
