<?php

namespace App\Http\Controllers;

use App\Models\TranslokMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TranslokMasterController extends Controller
{
    public function index(Request $request)
    {
        $tahun = session('tahun', date('Y'));

        $giat = TranslokMaster::where('thn', $tahun)
            ->orderBy('kd_translok')
            ->get();

        return Inertia::render('Translok/Master/Index', [
            'giat' => $giat,
            'tahun' => $tahun
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'translok' => ['required', 'string', 'max:255'],
            'vol_a'    => ['required', 'numeric', 'min:0'],
            'sat'      => ['required', 'string', 'max:50'],
            'rate'     => ['required', 'numeric', 'min:0'],
        ]);

        $tahun = session('tahun', date('Y'));

        DB::transaction(function () use ($validated, $tahun) {
            $maxKd = TranslokMaster::where('thn', $tahun)->lockForUpdate()->max('kd_translok');
            $newKd = str_pad(($maxKd ? (int)$maxKd + 1 : 1), 3, '0', STR_PAD_LEFT);
            $idTranslok = $tahun . $newKd;

            $jml_a = $validated['vol_a'] * $validated['rate'];

            TranslokMaster::create([
                'id_translok' => $idTranslok,
                'thn'         => $tahun,
                'kd_translok' => $newKd,
                'translok'    => $validated['translok'],
                'vol_a'       => $validated['vol_a'],
                'sat'         => $validated['sat'],
                'rate'        => $validated['rate'],
                'jml_a'       => $jml_a,
                'r_v'         => 0,
                'sisa_v'      => $validated['vol_a'],
                'sisa_a'      => $jml_a,
            ]);
        });

        return redirect()->back()->with('success', 'Data Master Translok berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'vol_a' => ['required', 'numeric', 'min:0'],
            'rate'  => ['required', 'numeric', 'min:0'],
        ]);

        $translok = TranslokMaster::findOrFail($id);

        $sisa_v = $validated['vol_a'] - $translok->r_v;

        if ($sisa_v < 0) {
            return back()->withErrors(['vol_a' => 'Volume awal tidak boleh lebih kecil dari volume yang sudah terealisasi.']);
        }

        $jml_a = $validated['vol_a'] * $validated['rate'];
        $sisa_a = $sisa_v * $validated['rate'];

        $translok->update([
            'vol_a'  => $validated['vol_a'],
            'rate'   => $validated['rate'],
            'jml_a'  => $jml_a,
            'sisa_v' => $sisa_v,
            'sisa_a' => $sisa_a,
        ]);

        return redirect()->back()->with('success', 'Data Master Translok berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $translok = TranslokMaster::findOrFail($id);

        if ($translok->r_v > 0) {
            return back()->with('error', 'Data tidak dapat dihapus karena sudah memiliki realisasi.');
        }

        $translok->delete();

        return redirect()->back()->with('success', 'Data Master Translok berhasil dihapus.');
    }
}
