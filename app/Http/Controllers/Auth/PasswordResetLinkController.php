<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'login' => 'required|string',
        ], [
            'login.required' => 'Masukkan NIP atau Email Anda.',
        ]);

        $input = $request->login;

        // 1. Cek apakah yang diketik adalah Email (Mitra) atau NIP (Pegawai)
        if (filter_var($input, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $input)->first();
        } else {
            $user = User::where('nip_baru', $input)
                        ->orWhere('nip_lama', $input)
                        ->first();
        }

        // 2. Jika user tidak ditemukan
        if (! $user) {
            throw ValidationException::withMessages([
                'login' => ['NIP atau Email tidak ditemukan di dalam sistem.'],
            ]);
        }

        // 3. Jika user (Pegawai) ditemukan tapi emailnya kosong
        if (! $user->email) {
            throw ValidationException::withMessages([
                'login' => ['Akun Anda tidak memiliki email yang terdaftar. Hubungi Admin.'],
            ]);
        }

        // 4. Kirim link reset menggunakan email yang ditemukan
        $status = Password::sendResetLink(
            ['email' => $user->email]
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', 'Tautan pemulihan kata sandi telah dikirim ke email Anda.');
        }

        throw ValidationException::withMessages([
            'login' => [trans($status)],
        ]);
    }
}
