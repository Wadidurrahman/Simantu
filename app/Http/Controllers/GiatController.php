<?php

namespace App\Http\Controllers;

use App\Http\Requests\GiatRequest;
use App\Models\Kegiatan;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class GiatController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Giat/Index', [
            'giats' => Kegiatan::latest()->get()
        ]);
    }

    public function store(GiatRequest $request): RedirectResponse
    {
        Kegiatan::create($request->validated());

        return redirect()->route('giat.index')->with('success', 'Data giat berhasil ditambahkan.');
    }

    public function update(GiatRequest $request, Kegiatan $giat): RedirectResponse
    {
        $giat->update($request->validated());

        return redirect()->route('giat.index')->with('success', 'Data giat berhasil diperbarui.');
    }

    public function destroy(Kegiatan $giat): RedirectResponse
    {
        $giat->delete();

        return redirect()->route('giat.index')->with('success', 'Data giat berhasil dihapus.');
    }
}
