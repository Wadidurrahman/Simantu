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

        // 3. Master Translok
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

        // Giat
        Route::get('/giat/realisasi', function() { return 'Halaman Realisasi Kinerja'; })->name('giat.realisasi');

        // Translok
        Route::get('/translok/alokasi', function() { return 'Halaman Alokasi Translok'; })->name('translok.alokasi');
        Route::get('/translok/detail', function() { return 'Halaman Detail Translok'; })->name('translok.detail');
        Route::get('/translok/off', function() { return 'Halaman Tanggal Off Translok'; })->name('translok.off');

        // Master Mitra (Untuk Admin)
        Route::get('/mitra', function() { return 'Halaman Master Mitra'; })->name('mitra.index');

        // Tugas & Honor
        Route::get('/mitra/tugas', function() { return 'Halaman Tugas Saya'; })->name('mitra.tugas');
        Route::get('/mitra/honor', function() { return 'Halaman Honorarium Saya'; })->name('mitra.honor');

        // Master Wilayah
        Route::get('/wilayah', function() { return 'Halaman Master Wilayah'; })->name('wilayah.index');

        // Laporan
        Route::get('/laporan/rekap', function() { return 'Halaman Rekapitulasi Laporan'; })->name('laporan.rekap');
        Route::get('/laporan/anggaran', function() { return 'Halaman Monitoring Anggaran'; })->name('laporan.anggaran');

    });
});

require __DIR__.'/auth.php';
