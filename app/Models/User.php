<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'organik';
    protected $primaryKey = 'nip_baru';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'nip_lama',
        'nip_baru',
        'nama',
        'jabatan',
        'gol',
        'jk',
        'username',
        'password',
        'level',
    ];

    protected $hidden = [
        'password',
    ];
}
