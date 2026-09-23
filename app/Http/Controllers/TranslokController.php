<?php

namespace App\Http\Controllers;

use App\Http\Requests\TranslokRequest;
use App\Models\Translok;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TranslokController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Translok/Index', [
            'transloks' => Translok::latest()->get()
        ]);
    }

    public function store(TranslokRequest $request): RedirectResponse
    {
        Translok::create($request->validated());

        return redirect()->route('translok.index')->with('success', 'Data translok berhasil ditambahkan.');
    }

    public function update(TranslokRequest $request, Translok $translok): RedirectResponse
    {
        $translok->update($request->validated());

        return redirect()->route('translok.index')->with('success', 'Data translok berhasil diperbarui.');
    }

    public function destroy(Translok $translok): RedirectResponse
    {
        $translok->delete();

        return redirect()->route('translok.index')->with('success', 'Data translok berhasil dihapus.');
    }
}
