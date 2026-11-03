<?php

namespace App\Http\Controllers;

use App\Http\Requests\TranslokRequest;
use App\Models\Kegiatan;
use App\Models\Translok;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TranslokController extends Controller
{
    public function index(Request $request): Response
    {
        abort_if($request->user()->role === 'mitra', 403);

        $tahun = $request->integer('tahun', now()->year);

        abort_unless($tahun >= 2000 && $tahun <= 2100, 422);

        $transloks = Translok::query()
            ->with('kegiatan:id,tahun,kd_tim,kd_giat,ur_giat')
            ->where('tahun', $tahun)
            ->orderBy('kegiatan_id')
            ->get();

        $masterKegiatan = Kegiatan::query()
            ->where('tahun', $tahun)
            ->orderBy('kd_tim')
            ->orderBy('kd_giat')
            ->get(['id', 'tahun', 'kd_tim', 'kd_giat', 'ur_giat']);

        return Inertia::render('Translok/Index', [
            'transloks' => $transloks,
            'masterKegiatan' => $masterKegiatan,
            'tahun' => $tahun,
            'canManage' => in_array($request->user()->role, ['admin', 'ketua'], true),
        ]);
    }

    public function store(TranslokRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $volume = (int) $data['vol_awal'];
            $rate = (float) $data['rate'];

            Translok::create([
                'tahun' => $data['tahun'],
                'kegiatan_id' => $data['kegiatan_id'],
                'vol_awal' => $volume,
                'satuan' => $data['satuan'],
                'rate' => $rate,
                'jml_anggaran' => round($volume * $rate, 2),
                'realisasi_vol' => 0,
                'sisa_vol' => $volume,
                'sisa_anggaran' => round($volume * $rate, 2),
            ]);
        });

        return back()->with('success', 'Master Translok berhasil ditambahkan.');
    }

    public function update(TranslokRequest $request, Translok $translok): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $translok) {
            $translok = Translok::query()
                ->lockForUpdate()
                ->findOrFail($translok->id);

            $volume = (int) $data['vol_awal'];
            $rate = (float) $data['rate'];
            $realisasi = (int) $translok->realisasi_vol;

            if ($volume < $realisasi) {
                throw ValidationException::withMessages([
                    'vol_awal' => 'Volume awal tidak boleh lebih kecil dari realisasi.',
                ]);
            }

            if (
                $realisasi > 0 &&
                (int) $translok->kegiatan_id !== (int) $data['kegiatan_id']
            ) {
                throw ValidationException::withMessages([
                    'kegiatan_id' => 'Kegiatan dengan realisasi tidak boleh dipindahkan.',
                ]);
            }

            $sisa = $volume - $realisasi;

            $translok->update([
                'tahun' => $data['tahun'],
                'kegiatan_id' => $data['kegiatan_id'],
                'vol_awal' => $volume,
                'satuan' => $data['satuan'],
                'rate' => $rate,
                'jml_anggaran' => round($volume * $rate, 2),
                'sisa_vol' => $sisa,
                'sisa_anggaran' => round($sisa * $rate, 2),
            ]);
        });

        return back()->with('success', 'Master Translok berhasil diperbarui.');
    }

    public function destroy(Request $request, Translok $translok): RedirectResponse
    {
        abort_unless(in_array($request->user()->role, ['admin', 'ketua'], true), 403);

        DB::transaction(function () use ($translok) {
            $translok = Translok::query()
                ->lockForUpdate()
                ->findOrFail($translok->id);

            if ((int) $translok->realisasi_vol > 0) {
                throw ValidationException::withMessages([
                    'translok' => 'Master Translok dengan realisasi tidak dapat dihapus.',
                ]);
            }

            $translok->delete();
        });

        return back()->with('success', 'Master Translok berhasil dihapus.');
    }
}
