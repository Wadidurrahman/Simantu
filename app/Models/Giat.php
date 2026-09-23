<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Giat extends Model
{
    use HasFactory;

    protected $table = 'giat';

    protected $fillable = [
        'nama_giat',
        'tanggal_mulai',
        'tanggal_selesai',
        'status_giat',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];
}
