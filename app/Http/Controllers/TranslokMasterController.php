<?php

namespace App\Http\Controllers;

use App\Models\TranslokMaster;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TranslokMasterController extends Controller
{
    public function index(Request $request)
    {
        $tahun = session('tahun', date('Y'));

        $giat = TranslokMaster::with('kegiatan')
            ->where('tahun', $tahun)
            ->orderBy('kd_translok')
            ->get();

        $masterKegiatan = Kegiatan::where('tahun', $tahun)
            ->where('is_active', true)
            ->orderBy('kd_giat')
            ->get();

        return Inertia::render('Translok/Master/Index', [
            'giat' => $giat,
            'masterKegiatan' => $masterKegiatan,
            'tahun' => $tahun
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kegiatan_id' => ['required', 'exists:kegiatans,id'],
            'vol_awal'    => ['required', 'numeric', 'min:0'],
            'satuan'      => ['required', 'string', 'max:50'],
            'rate'        => ['required', 'numeric', 'min:0'],
        ]);

        $tahun = session('tahun', date('Y'));

        DB::transaction(function () use ($validated, $tahun) {
            $maxKd = TranslokMaster::where('tahun', $tahun)->lockForUpdate()->max('kd_translok');
            $newKd = str_pad(($maxKd ? (int)$maxKd + 1 : 1), 3, '0', STR_PAD_LEFT);

            TranslokMaster::create([
                'tahun'       => $tahun,
                'kegiatan_id' => $validated['kegiatan_id'],
                'kd_translok' => $newKd,
                'vol_awal'    => $validated['vol_awal'],
                'satuan'      => $validated['satuan'],
                'rate'        => $validated['rate'],

            ]);
        });

        return redirect()->back()->with('success', 'Data Master Translok berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'kegiatan_id' => ['required', 'exists:kegiatans,id'],
            'vol_awal'    => ['required', 'numeric', 'min:0'],
            'satuan'      => ['required', 'string', 'max:50'],
            'rate'        => ['required', 'numeric', 'min:0'],
        ]);

        $translok = TranslokMaster::findOrFail($id);


        if ($validated['vol_awal'] < $translok->realisasi_vol) {
            return back()->withErrors(['vol_awal' => 'Volume awal tidak boleh lebih kecil dari volume yang sudah terealisasi.']);
        }
        $translok->update([
            'kegiatan_id' => $validated['kegiatan_id'],
            'vol_awal'    => $validated['vol_awal'],
            'satuan'      => $validated['satuan'],
            'rate'        => $validated['rate'],
        ]);

        return redirect()->back()->with('success', 'Data Master Translok berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $translok = TranslokMaster::findOrFail($id);

        if ($translok->realisasi_vol > 0) {
            return back()->with('error', 'Data tidak dapat dihapus karena sudah memiliki realisasi.');
        }

        $translok->delete();

        return redirect()->back()->with('success', 'Data Master Translok berhasil dihapus.');
    }
}
