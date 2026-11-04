<?php

namespace App\Policies;

use App\Models\User;
use App\Models\KegiatanPetugas;
use Illuminate\Auth\Access\HandlesAuthorization;

class RealisasiKegiatanPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return $user->role === 'pimpinan';
    }

    public function view(User $user, KegiatanPetugas $kegiatanPetugas)
    {
        if ($user->role === 'pimpinan') {
            return true;
        }

        if (in_array($user->role, ['ketua', 'ketua_tim']) && $kegiatanPetugas->tim->ketua_id === $user->id) {
            return true;
        }

        return false;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['admin', 'ketua', 'ketua_tim', 'pimpinan']);
    }

    public function update(User $user, KegiatanPetugas $kegiatanPetugas)
    {
        if ($user->role === 'pimpinan') {
            return true;
        }

        return in_array($user->role, ['ketua', 'ketua_tim']) && $kegiatanPetugas->tim->ketua_id === $user->id;
    }
}
