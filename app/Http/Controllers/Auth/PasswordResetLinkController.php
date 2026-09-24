<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User; // Tambahkan import Model User
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request via NIP.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Ubah validasi menjadi NIP, pastikan ada di database (nip_baru)
        $request->validate([
            'nip' => 'required|string|exists:users,nip_baru',
        ], [
            'nip.exists' => 'NIP tidak ditemukan di dalam sistem.',
        ]);

        // 2. Cari user berdasarkan NIP
        $user = User::where('nip_baru', $request->nip)->first();

        // 3. Pastikan user tersebut memiliki email di sistem
        if (! $user || ! $user->email) {
            throw ValidationException::withMessages([
                'nip' => ['Akun ini tidak memiliki email yang valid untuk pemulihan kata sandi.'],
            ]);
        }

        // 4. Kirim link reset menggunakan email yang ditemukan
        $status = Password::sendResetLink(
            ['email' => $user->email]
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', 'Tautan pemulihan kata sandi telah dikirim ke Email resmi BPS Anda.');
        }

        throw ValidationException::withMessages([
            'nip' => [trans($status)],
        ]);
    }
}
