<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Translok extends Model
{
    use HasFactory;

    protected $table = 'master_translok';

    protected $fillable = [
        'tujuan',
        'kecamatan',
        'besaran_translok',
        'keterangan',
    ];

    protected $casts = [
        'besaran_translok' => 'decimal:2',
    ];
}
