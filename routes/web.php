<?php

use App\Http\Controllers\PortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\HonorController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TranslokController;
use App\Http\Controllers\TranslokMasterController;
use App\Http\Controllers\TranslokAlokasiController;
use App\Http\Controllers\TranslokBookingWindowController;
use App\Http\Controllers\TranslokDetailController;
use App\Http\Controllers\TranslokBookingSlotController;
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
        Route::resource('kegiatan', KegiatanController::class)->except(['create', 'show', 'edit']);

        Route::prefix('translok')->group(function () {
            Route::prefix('master')->name('translok.master.')->controller(TranslokMasterController::class)->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');
                Route::put('/{id}', 'update')->name('update');
                Route::delete('/{id}', 'destroy')->name('destroy');
            });

            Route::get('/alokasi', [TranslokAlokasiController::class, 'index'])->name('translok.alokasi');
            Route::post('/alokasi', [TranslokAlokasiController::class, 'store'])->name('translok.alokasi.store');
            Route::put('/alokasi/{id}', [TranslokAlokasiController::class, 'update'])->name('translok.alokasi.update');
            Route::delete('/alokasi/{id}', [TranslokAlokasiController::class, 'destroy'])->name('translok.alokasi.destroy');

            Route::get('/off', [TranslokBookingWindowController::class, 'index'])->name('translok.off');
            Route::post('/off/windows', [TranslokBookingWindowController::class, 'store'])->name('translok.off.window.store');
            Route::put('/off/windows/{id}', [TranslokBookingWindowController::class, 'update'])->name('translok.off.window.update');
            Route::delete('/off/windows/{id}', [TranslokBookingWindowController::class, 'destroy'])->name('translok.off.window.destroy');

            Route::get('/detail', [TranslokDetailController::class, 'index'])->name('translok.detail');
            Route::get('/detail/availability', [TranslokDetailController::class, 'availability'])->name('translok.detail.availability');
            Route::post('/detail', [TranslokDetailController::class, 'store'])->name('translok.detail.store');
            Route::delete('/detail/{id}', [TranslokDetailController::class, 'destroy'])->name('translok.detail.destroy');

            // Diperbaiki dari /translok/pilih-jadwal menjadi /pilih-jadwal
            Route::get('/pilih-jadwal', [TranslokBookingSlotController::class, 'index'])->name('translok.slot.index');
            Route::post('/pilih-jadwal', [TranslokBookingSlotController::class, 'store'])->name('translok.slot.store');
            Route::delete('/pilih-jadwal/{id}', [TranslokBookingSlotController::class, 'destroy'])->name('translok.slot.destroy');
        });

        Route::resource('translok', TranslokController::class)->except(['create', 'show', 'edit']);

        Route::resource('pegawai', PegawaiController::class)->except(['create', 'show', 'edit']);
        Route::resource('honor', HonorController::class)->except(['create', 'show', 'edit']);

        Route::get('/mitra', fn () => 'Halaman Master Mitra')->name('mitra.index');
        Route::get('/mitra/tugas', fn () => 'Halaman Tugas Saya')->name('mitra.tugas');
        Route::get('/mitra/honor', fn () => 'Halaman Honorarium Saya')->name('mitra.honor');

        Route::get('/wilayah', fn () => 'Halaman Master Wilayah')->name('wilayah.index');

        Route::get('/laporan/rekap', fn () => 'Halaman Rekapitulasi Laporan')->name('laporan.rekap');
        Route::get('/laporan/anggaran', fn () => 'Halaman Monitoring Anggaran')->name('laporan.anggaran');
    });
});

require __DIR__.'/auth.php';
