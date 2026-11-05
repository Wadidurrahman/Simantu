
<?php

use App\Http\Controllers\PortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\HonorController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TranslokBookingController;
use App\Http\Controllers\TranslokMasterController;
use App\Http\Controllers\TranslokAlokasiController;
use App\Http\Controllers\TranslokDetailController;
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
            Route::get('/master', [TranslokMasterController::class, 'index'])->name('translok.master.index');
            Route::get('/alokasi', [TranslokAlokasiController::class, 'index'])->name('translok.alokasi.index');
            Route::get('/detail', [TranslokDetailController::class, 'index'])->name('translok.detail.index');
            Route::get('/booking', [App\Http\Controllers\TranslokBookingController::class, 'index'])->name('translok.booking.index');
            Route::post('/booking/windows', [App\Http\Controllers\TranslokBookingController::class, 'storeWindow'])->name('translok.booking.window.store');
            Route::delete('/booking/windows/{id}', [App\Http\Controllers\TranslokBookingController::class, 'destroyWindow'])->name('translok.booking.window.destroy');
            Route::post('/booking/slots', [App\Http\Controllers\TranslokBookingController::class, 'storeSlot'])->name('translok.booking.slot.store');
            Route::delete('/booking/slots/{id}', [App\Http\Controllers\TranslokBookingController::class, 'destroySlot'])->name('translok.booking.slot.destroy');
        });

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
