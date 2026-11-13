<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'jenis_kelamin',
        'id_jabatan',
        'nip',
        'no_hp',
        'golongan',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    protected $appends = [
        'effective_role',
    ];

    public function getEffectiveRoleAttribute(): string
    {
        return match ($this->role) {
            'super_admin' => 'admin',
            'ketua_tim' => 'ketua',
            'pimpinan' => 'pimpinan',
            'operator' => 'operator',
            'mitra' => 'mitra',
            default => 'pegawai',
        };
    }

    public function isAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isPimpinan(): bool
    {
        return $this->role === 'pimpinan';
    }

    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    public function isKetua(): bool
    {
        return $this->role === 'ketua_tim';
    }

    public function isPegawai(): bool
    {
        return $this->role === 'pegawai';
    }

    public function isMitra(): bool
    {
        return $this->role === 'mitra';
    }

    public function isAktif(): bool
    {
        return $this->status === 'aktif';
    }

    public function canManageKegiatan(): bool
    {
        return $this->isAdmin()
            || $this->isOperator()
            || $this->isKetua();
    }

    public function timDipimpin(): HasMany
    {
        return $this->hasMany(
            Tim::class,
            'ketua_id',
            'id'
        );
    }

    public function timDiikuti(): BelongsToMany
    {
        return $this->belongsToMany(
            Tim::class,
            'tb_anggota_tim',
            'pegawai_id',
            'tim_id'
        )->withPivot('id')->withTimestamps();
    }
}
