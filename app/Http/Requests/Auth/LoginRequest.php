<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    private const TAHUN_AWAL = 2020;
    private const MAKSIMAL_PERCOBAAN = 5;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'tahun' => [
                'required',
                'integer',
                'min:' . self::TAHUN_AWAL,
                'max:' . (now('Asia/Jakarta')->year + 1),
            ],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'login.required' => 'Username, NIP, atau email wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'tahun.required' => 'Tahun anggaran wajib dipilih.',
            'tahun.integer' => 'Tahun anggaran tidak valid.',
            'tahun.min' => 'Tahun anggaran belum tersedia.',
            'tahun.max' => 'Tahun anggaran maksimal satu tahun ke depan.',
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $login = trim((string) $this->input('login'));

        $pengguna = User::query()
            ->where('username', $login)
            ->first();

        if (!$pengguna) {
            $pengguna = User::query()
                ->where('nip', $login)
                ->first();
        }

        if (!$pengguna && filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $hasil = User::query()
                ->where('email', $login)
                ->limit(2)
                ->get();

            if ($hasil->count() === 1) {
                $pengguna = $hasil->first();
            }
        }

        $berhasil = $pengguna && Auth::attempt([
            'id' => $pengguna->id,
            'status' => 'aktif',
            'password' => (string) $this->input('password'),
        ], $this->boolean('remember'));

        if (!$berhasil) {
            RateLimiter::hit($this->throttleKey(), 60);

            throw ValidationException::withMessages([
                'login' => 'Username, NIP, email, atau password tidak sesuai.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts(
            $this->throttleKey(),
            self::MAKSIMAL_PERCOBAAN
        )) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
        ]);
    }

    public function throttleKey(): string
    {
        $login = Str::lower(
            trim((string) $this->input('login'))
        );

        return Str::transliterate($login . '|' . $this->ip());
    }
}
