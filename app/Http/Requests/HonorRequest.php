<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HonorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_kegiatan' => ['required', 'string', 'max:255'],
            'golongan' => ['required', 'string', 'max:50'],
            'besaran_honor' => ['required', 'numeric', 'min:0'],
            'tahun_anggaran' => ['required', 'digits:4', 'integer'],
        ];
    }
}
