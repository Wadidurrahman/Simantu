
<?php

use App\Http\Controllers\PortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\HonorController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TranslokMasterController;
use App\Http\Controllers\TranslokAlokasiController;
use App\Http\Controllers\TranslokDetailController;
use App\Http\Controllers\KegiatanPetugasController;
use App\Http\Controllers\BastController;
use App\Http\Controllers\RekapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PortalController::class, 'index'])->name('portal');

Route::middleware('auth')->group(function () {
    Route::put('/force-password-update', [ProfileController::class, 'forceUpdatePassword'])->name('password.force.update');

    Route::middleware(['verified', 'force.password'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/laporan/rekap', [RekapController::class, 'rekapHonor'])->name('laporan.rekap');
        Route::get('/laporan/anggaran', [RekapController::class, 'monitoringAnggaran'])->name('laporan.anggaran');

        Route::post('/kegiatan-petugas', [KegiatanPetugasController::class, 'store'])->name('kegiatan-petugas.store');
        Route::post('/kegiatan-petugas/copy', [KegiatanPetugasController::class, 'copyPenugasan'])->name('kegiatan-petugas.copy');

        Route::get('/bast/{id_a}/cetak', [BastController::class, 'cetak'])->name('bast.cetak');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('/kegiatan/realisasi', fn () => Inertia::render('Kegiatan/Realisasi'))->name('kegiatan.realisasi');
        Route::resource('kegiatan', KegiatanController::class)->except(['create', 'show', 'edit']);

        Route::prefix('translok')->group(function () {
            Route::get('/master', [TranslokMasterController::class, 'index'])->name('translok.master.index');
            Route::post('/master', [TranslokMasterController::class, 'store'])->name('translok.master.store');
            Route::put('/master/{id}', [TranslokMasterController::class, 'update'])->name('master.update');
            Route::delete('/master/{id}', [TranslokMasterController::class, 'destroy'])->name('master.destroy');

            Route::get('/alokasi', [TranslokAlokasiController::class, 'index'])->name('translok.alokasi.index');
            Route::post('/alokasi', [TranslokAlokasiController::class, 'store'])->name('translok.alokasi.store');
            Route::put('/alokasi/{id}', [TranslokAlokasiController::class, 'update'])->name('translok.alokasi.update');
            Route::delete('/alokasi/{id}', [TranslokAlokasiController::class, 'destroy'])->name('translok.alokasi.destroy');

            Route::get('/detail', [TranslokDetailController::class, 'index'])->name('translok.detail.index');
            Route::post('/detail/availability', [TranslokDetailController::class, 'availability'])->name('translok.detail.availability');
            Route::post('/detail', [TranslokDetailController::class, 'store'])->name('translok.detail.store');
            Route::delete('/detail/{id}', [TranslokDetailController::class, 'destroy'])->name('translok.detail.destroy');
        });

        Route::resource('pegawai', PegawaiController::class)->except(['create', 'show', 'edit']);
        Route::resource('honor', HonorController::class)->except(['create', 'show', 'edit']);

        Route::get('/mitra', fn () => 'Halaman Master Mitra')->name('mitra.index');
        Route::get('/mitra/tugas', fn () => 'Halaman Tugas Saya')->name('mitra.tugas');
        Route::get('/mitra/honor', fn () => 'Halaman Honorarium Saya')->name('mitra.honor');

        Route::get('/wilayah', fn () => 'Halaman Master Wilayah')->name('wilayah.index');
    });
});

require __DIR__.'/auth.php';
