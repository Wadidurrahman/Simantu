<?php

use App\Http\Controllers\PortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\HonorController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TranslokController;
use App\Http\Controllers\TranslokMasterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PortalController::class, 'index'])->name('portal');

Route::middleware('auth')->group(function () {
    Route::put('/force-password-update', [ProfileController::class, 'forceUpdatePassword'])->name('password.force.update');

    Route::middleware(['verified', 'force.password'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('/kegiatan/realisasi', fn () => Inertia::render('Kegiatan/Realisasi'))->name('kegiatan.realisasi');
        Route::resource('kegiatan', kegiatanController::class)->except(['create', 'show', 'edit']);

        Route::prefix('translok/master')->name('translok.master.')->group(function () {
            Route::get('/', [TranslokMasterController::class, 'index'])->name('index');
            Route::post('/', [TranslokMasterController::class, 'store'])->name('store');
            Route::put('/{id}', [TranslokMasterController::class, 'update'])->name('update');
            Route::delete('/{id}', [TranslokMasterController::class, 'destroy'])->name('destroy');
        });

        Route::resource('pegawai', PegawaiController::class)->except(['create', 'show', 'edit']);
        Route::resource('honor', HonorController::class)->except(['create', 'show', 'edit']);
        Route::resource('translok', TranslokController::class)->except(['create', 'show', 'edit']);

        Route::get('/translok/alokasi', fn () => 'Halaman Alokasi Translok')->name('translok.alokasi');
        Route::get('/translok/detail', fn () => 'Halaman Detail Translok')->name('translok.detail');
        Route::get('/translok/off', fn () => 'Halaman Tanggal Off Translok')->name('translok.off');

        Route::get('/mitra', fn () => 'Halaman Master Mitra')->name('mitra.index');
        Route::get('/mitra/tugas', fn () => 'Halaman Tugas Saya')->name('mitra.tugas');
        Route::get('/mitra/honor', fn () => 'Halaman Honorarium Saya')->name('mitra.honor');

        Route::get('/wilayah', fn () => 'Halaman Master Wilayah')->name('wilayah.index');

        Route::get('/laporan/rekap', fn () => 'Halaman Rekapitulasi Laporan')->name('laporan.rekap');
        Route::get('/laporan/anggaran', fn () => 'Halaman Monitoring Anggaran')->name('laporan.anggaran');
    });
});

require __DIR__.'/auth.php';
