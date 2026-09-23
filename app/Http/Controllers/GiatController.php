<?php

namespace App\Http\Controllers;

use App\Http\Requests\GiatRequest;
use App\Models\Giat;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class GiatController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Giat/Index', [
            'giats' => Giat::latest()->get()
        ]);
    }

    public function store(GiatRequest $request): RedirectResponse
    {
        Giat::create($request->validated());

        return redirect()->route('giat.index')->with('success', 'Data giat berhasil ditambahkan.');
    }

    public function update(GiatRequest $request, Giat $giat): RedirectResponse
    {
        $giat->update($request->validated());

        return redirect()->route('giat.index')->with('success', 'Data giat berhasil diperbarui.');
    }

    public function destroy(Giat $giat): RedirectResponse
    {
        $giat->delete();

        return redirect()->route('giat.index')->with('success', 'Data giat berhasil dihapus.');
    }
}
