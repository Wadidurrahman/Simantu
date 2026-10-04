<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function forceUpdatePassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = $request->user();
        $namaTabel = $user->getTable();
        $kolomKunci = $user->getKeyName();
        $nilaiKunci = $user->getKey();

        $affected = DB::table($namaTabel)
            ->where($kolomKunci, $nilaiKunci)
            ->update([
                'password' => Hash::make($request->password),
                'must_change_password' => 0,
            ]);

        if ($affected === 0) {
             dd("GAGAL: Sistem mencoba mengupdate tabel '{$namaTabel}' menggunakan kolom '{$kolomKunci}' = '{$nilaiKunci}', tetapi data tidak ditemukan di tabel tersebut.");
        }

        $updatedUser = \App\Models\User::where('id', $user->id)->first();
        if ($updatedUser) {
            \Illuminate\Support\Facades\Auth::login($updatedUser);
        }
        $request->session()->forget('must_change_password');
        $request->session()->put('must_change_password', 0);
        return \Inertia\Inertia::location(route('dashboard'));
    }
}
