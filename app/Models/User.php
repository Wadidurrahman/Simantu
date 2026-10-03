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
}
