<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    use HasFactory;

    protected $table = 'kegiatans';

    protected $guarded = [
        'id',
    ];

    protected $casts = [
        'tahun' => 'integer',
        'hr_satuan' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function translokMasters()
    {
        return $this->hasMany(TranslokMaster::class, 'kegiatan_id');
    }
}
