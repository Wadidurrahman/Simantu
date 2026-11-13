<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tim extends Model
{
    protected $table = 'tb_tim';

    protected $fillable = [
        'nama_tim',
        'kd_tim',
        'tahun',
        'ketua_id',
        'role_ketua_sebelumnya',
        'keterangan',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tahun' => 'string',
            'ketua_id' => 'integer',
        ];
    }

    public function ketua(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ketua_id');
    }

    public function anggota(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'tb_anggota_tim',
            'tim_id',
            'pegawai_id'
        )->withPivot('id')->withTimestamps();
    }

    public function kegiatan(): HasMany
    {
        return $this->hasMany(Kegiatan::class, 'tim_id');
    }

    public function scopeTahun(Builder $query, int $tahun): Builder
    {
        return $query->where('tahun', (string) $tahun);
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }
}
