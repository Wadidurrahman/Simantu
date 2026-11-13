<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class KegiatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, [
            'super_admin',
            'operator',
        ], true);
    }

    public function rules(): array
    {
        $pegawai = $this->route('pegawai');
        $id = $pegawai instanceof User ? $pegawai->getKey() : null;
        $membuat = $this->isMethod('post');

        return [
            'nip' => [
                'required',
                'string',
                'regex:/^[0-9]{18}$/',
                Rule::unique('users', 'nip')->ignore($id),
            ],
            'nama_lengkap' => [
                'required',
                'string',
                'max:255',
            ],
            'username' => [
                'nullable',
                'string',
                'min:3',
                'max:255',
                'regex:/^[a-zA-Z0-9._-]+$/',
                Rule::unique('users', 'username')->ignore($id),
            ],
            'jabatan' => [
                'required',
                'string',
                'max:255',
                Rule::exists('jabatan', 'nama_jabatan')
                    ->where('status', 'aktif'),
            ],
            'nomor_hp' => [
                'nullable',
                'string',
                'max:20',
            ],
            'email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($id),
            ],
            'password' => [
                $membuat ? 'required' : 'nullable',
                'string',
                Password::min(12)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nip.required' => 'NIP wajib diisi.',
            'nip.regex' => 'NIP harus terdiri dari 18 digit angka.',
            'nip.unique' => 'NIP sudah digunakan pengguna lain.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'username.unique' => 'Username sudah digunakan.',
            'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, garis bawah, dan tanda hubung.',
            'jabatan.required' => 'Jabatan wajib dipilih.',
            'jabatan.exists' => 'Jabatan tidak ditemukan atau tidak aktif.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan pengguna lain.',
            'password.required' => 'Password awal wajib diisi.',
        ];
    }
}
