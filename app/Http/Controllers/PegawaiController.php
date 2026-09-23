<?php

namespace App\Http\Controllers;

use App\Http\Requests\PegawaiRequest;
use App\Models\Pegawai;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PegawaiController extends Controller
{
    public function index(): Response
    {
        $pegawai = Pegawai::latest()->get();

        // Render ke file resources/js/Pages/Pegawai/Index.jsx
        return Inertia::render('Pegawai/Index', [
            'pegawai' => $pegawai
        ]);
    }

    public function store(PegawaiRequest $request): RedirectResponse
    {
        Pegawai::create($request->validated());

        return redirect()->route('pegawai.index')->with('success', 'Data pegawai berhasil ditambahkan.');
    }

    public function update(PegawaiRequest $request, Pegawai $pegawai): RedirectResponse
    {
        $pegawai->update($request->validated());

        return redirect()->route('pegawai.index')->with('success', 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(Pegawai $pegawai): RedirectResponse
    {
        $pegawai->delete();

        return redirect()->route('pegawai.index')->with('success', 'Data pegawai berhasil dihapus.');
    }
}
