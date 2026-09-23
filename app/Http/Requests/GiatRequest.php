<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GiatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_giat' => ['required', 'string', 'max:255'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'status_giat' => ['required', 'string', 'in:Aktif,Selesai,Tertunda'],
        ];
    }
}
