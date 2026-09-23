<?php

namespace App\Http\Controllers;

use App\Http\Requests\HonorRequest;
use App\Models\Honor;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class HonorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Honor/Index', [
            'honors' => Honor::latest()->get()
        ]);
    }

    public function store(HonorRequest $request): RedirectResponse
    {
        Honor::create($request->validated());

        return redirect()->route('honor.index')->with('success', 'Data honor berhasil ditambahkan.');
    }

    public function update(HonorRequest $request, Honor $honor): RedirectResponse
    {
        $honor->update($request->validated());

        return redirect()->route('honor.index')->with('success', 'Data honor berhasil diperbarui.');
    }

    public function destroy(Honor $honor): RedirectResponse
    {
        $honor->delete();

        return redirect()->route('honor.index')->with('success', 'Data honor berhasil dihapus.');
    }
}
