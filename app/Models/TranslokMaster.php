<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TranslokMaster extends Model
{
    protected $table = 'translok_master';

    protected $primaryKey = 'id_translok';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $guarded = [];
}
