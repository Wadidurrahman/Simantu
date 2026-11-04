<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TranslokBookingWindow extends Model
{
    use HasFactory;

    protected $table = 'translok_booking_windows';

    protected $fillable = [
        'tim_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'jam_mulai',
        'jam_selesai',
    ];

    public function tim()
    {
        return $this->belongsTo(Tim::class);
    }
}
