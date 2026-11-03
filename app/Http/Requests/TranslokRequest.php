<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TranslokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'ketua'], true);
    }

    public function rules(): array
    {
        $tahun = (int) $this->input('tahun');
        $translok = $this->route('translok');

        return [
            'tahun' => ['required', 'integer', 'between:2000,2100'],
            'kegiatan_id' => [
                'required',
                'integer',
                Rule::exists('kegiatans', 'id')->where('tahun', $tahun),
                Rule::unique('translok_masters', 'kegiatan_id')
                    ->ignore($translok?->id),
            ],
            'vol_awal' => ['required', 'integer', 'min:1'],
            'satuan' => ['required', 'string', 'max:50'],
            'rate' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
        ];
    }

    public function messages(): array
    {
        return [
            'kegiatan_id.exists' => 'Kegiatan tidak ditemukan pada tahun yang dipilih.',
            'kegiatan_id.unique' => 'Kegiatan tersebut sudah terdaftar dalam Master Translok.',
            'vol_awal.min' => 'Volume awal harus lebih besar dari nol.',
        ];
    }
}
