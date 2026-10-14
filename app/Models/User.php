<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'nip_lama',
        'nip_baru',
        'name',
        'jabatan',
        'gol',
        'jk',
        'username',
        'password',
        'level',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'must_change_password' => 'integer',
        'level' => 'integer',
    ];

    protected $appends = [
        'effective_role',
    ];

    public function getEffectiveRoleAttribute(): string
    {
        $role = strtolower(trim((string) $this->role));

        if ($role === 'mitra') {
            return 'mitra';
        }

        if ($role === 'admin' || (int) $this->level === 1) {
            return 'admin';
        }

        if (
            in_array($role, ['ketua', 'ketua_tim'], true)
            || (int) $this->level === 9
        ) {
            return 'ketua';
        }

        return 'pegawai';
    }

    public function isAdmin(): bool
    {
        return $this->effective_role === 'admin';
    }

    public function isKetua(): bool
    {
        return $this->effective_role === 'ketua';
    }

    public function isMitra(): bool
    {
        return $this->effective_role === 'mitra';
    }

    public function canManageKegiatan(): bool
    {
        return $this->isAdmin() || $this->isKetua();
    }
}
