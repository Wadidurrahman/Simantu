<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TranslokRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tujuan' => ['required', 'string', 'max:255'],
            'kecamatan' => ['required', 'string', 'max:100'],
            'besaran_translok' => ['required', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string'],
        ];
    }
}
