<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RekapController extends Controller
{
    public function rekapHonor(Request $request): Response
    {
        $tahun = (int) session('tahun', now()->year);
        $bulan = $request->input('bulan', 'all');

        $query = DB::table('kegiatan_petugas')
            ->where('tahun', $tahun);

        if ($bulan !== 'all') {
            $query->where('kd_bulan', $bulan);
        }

        $rekap = $query->select(
                'id_sobat',
                'nama',
                DB::ophages('SUM(vol) as total_vol'),
                DB::raw('SUM(jml_hr) as total_honor'),
                DB::raw('COUNT(DISTINCT kd_giat) as jumlah_kegiatan')
            )
            ->groupBy('id_sobat', 'nama')
            ->orderBy('nama')
            ->get();

        return Inertia::render('Laporan/RekapHonor', [
            'rekap' => $rekap,
            'tahun' => $tahun,
            'bulan' => $bulan,
        ]);
    }

    public function monitoringAnggaran(Request $request): Response
    {
        $tahun = (int) session('tahun', now()->year);

        $paguHonor = 500000000; 
        $realisasiHonor = DB::table('kegiatan_petugas')
            ->where('tahun', $tahun)
            ->sum('jml_hr');

        $paguTranslok = 150000000; 
        $realisasiTranslok = DB::table('translok_masters')
            ->where('tahun', $tahun)
            ->sum(DB::raw('jml_anggaran - sisa_anggaran'));

        $anggaran = [
            [
                'label' => 'Honorarium Mitra / Petugas',
                'pagu' => $paguHonor,
                'realisasi' => $realisasiHonor,
                'sisa' => $paguHonor - $realisasiHonor,
                'persentase' => $paguHonor > 0 ? round(($realisasiHonor / $paguHonor) * 100, 2) : 0,
            ],
            [
                'label' => 'Perjalanan Dinas (Translok)',
                'pagu' => $paguTranslok,
                'realisasi' => $realisasiTranslok,
                'sisa' => $paguTranslok - $realisasiTranslok,
                'persentase' => $paguTranslok > 0 ? round(($realisasiTranslok / $paguTranslok) * 100, 2) : 0,
            ],
        ];

        return Inertia::render('Laporan/MonitoringAnggaran', [
            'anggaran' => $anggaran,
            'tahun' => $tahun,
        ]);
    }
}