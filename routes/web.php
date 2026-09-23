<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PegawaiController;
use App\Http\Controllers\HonorController;
use App\Http\Controllers\TranslokController;
use App\Http\Controllers\GiatController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('pegawai', PegawaiController::class)->except(['create', 'show', 'edit']);
    Route::resource('honor', 'App\\Http\\Controllers\\HonorController')->except(['create', 'show', 'edit']);
    Route::resource('translok', 'App\\Http\\Controllers\\TranslokController')->except(['create', 'show', 'edit']);
    Route::resource('giat', 'App\\Http\\Controllers\\GiatController')->except(['create', 'show', 'edit']);
});

require __DIR__.'/auth.php';
