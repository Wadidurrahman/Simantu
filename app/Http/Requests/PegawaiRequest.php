<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PegawaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Sesuaikan jika ada middleware role/permission
    }

    public function rules(): array
    {
        $pegawaiId = $this->route('pegawai') ? $this->route('pegawai')->id : null;

        return [
            'nip' => ['required', 'string', 'max:18', Rule::unique('pegawai', 'nip')->ignore($pegawaiId)],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'jabatan' => ['required', 'string', 'max:100'],
            'nomor_hp' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('pegawai', 'email')->ignore($pegawaiId)],
            'is_active' => ['boolean'],
        ];
    }
}
