<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KegiatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null
            && ! $this->user()->isMitra();
    }

    public function rules(): array
    {
        $common = [
            'satuan' => [
                'required',
                'string',
                'max:50',
            ],
            'hr_satuan' => [
                'required',
                'numeric',
                'min:0',
                'max:9999999999',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ];

        if (! $this->isMethod('post')) {
            return $common;
        }

        return [
            'tahun' => [
                'required',
                'integer',
                'between:2020,2100',
            ],
            'kd_tim' => [
                'required',
                'string',
                'max:5',
                Rule::exists('tim', 'kd_tim')
                    ->where(
                        fn ($query) => $query->where(
                            'tahun',
                            $this->input('tahun')
                        )
                    ),
            ],
            'ur_giat' => [
                'required',
                'string',
                'max:255',
            ],
            ...$common,
        ];
    }

    public function attributes(): array
    {
        return [
            'tahun' => 'tahun',
            'kd_tim' => 'tim kerja',
            'ur_giat' => 'uraian kegiatan',
            'satuan' => 'satuan',
            'hr_satuan' => 'honor per satuan',
            'is_active' => 'status kegiatan',
        ];
    }

    public function messages(): array
    {
        return [
            'kd_tim.exists' => 'Tim kerja tidak ditemukan pada tahun yang dipilih.',
            'hr_satuan.numeric' => 'Honor per satuan harus berupa angka.',
            'hr_satuan.min' => 'Honor per satuan tidak boleh kurang dari 0.',
        ];
    }
}
