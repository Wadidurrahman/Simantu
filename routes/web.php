<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\HonorController;
use App\Http\Controllers\TranslokController;
use App\Http\Controllers\GiatController;
use App\Http\Controllers\TranslokMasterController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {

    // Rute Pembaruan Keamanan (Force Change Password)
    Route::get('/ganti-password-default', [ProfileController::class, 'forceChangePassword'])->name('password.change');
    Route::post('/ganti-password-default', [ProfileController::class, 'forceUpdatePassword'])->name('password.change.update');

    Route::middleware(['verified', 'force.password'])->group(function () {

        // 1. Dashboard Utama
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // 2. Manajemen Profil
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // 3. Master Translok (WAJIB di atas resource 'translok' untuk mencegah konflik parameter URL)
        Route::prefix('translok/master')->name('translok.master.')->group(function () {
            Route::get('/', [TranslokMasterController::class, 'index'])->name('index');
            Route::post('/', [TranslokMasterController::class, 'store'])->name('store');
            Route::put('/{id}', [TranslokMasterController::class, 'update'])->name('update');
            Route::delete('/{id}', [TranslokMasterController::class, 'destroy'])->name('destroy');
        });

        // 4. Resource Routes (API & CRUD Dasar)
        Route::resource('pegawai', PegawaiController::class)->except(['create', 'show', 'edit']);
        Route::resource('honor', HonorController::class)->except(['create', 'show', 'edit']);
        Route::resource('translok', TranslokController::class)->except(['create', 'show', 'edit']);
        Route::resource('giat', GiatController::class)->except(['create', 'show', 'edit']);
    });
});

require __DIR__.'/auth.php';
