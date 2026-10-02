<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {

        $user = $request->user();
        $year = now()->year;
        $month = now()->month;

        if ($user->role === 'mitra') {
            return Inertia::render('Dashboard', [
                'kpi' => [
                    'kegiatan_aktif' => 0,
                    'kegiatan_baru_bulan_ini' => 0,
                    'translok_berjalan' => 0,
                    'translok_pending' => 0,
                    'realisasi_honor' => 0,
                    'mitra_terlibat' => 0,
                ],
                'kegiatanTerkini' => [],
                'serapanAnggaran' => [],
            ]);
        }

        return Inertia::render('Dashboard', [
            'kpi' => $this->getKpiMetrics($year, $month),
            'kegiatanTerkini' => $this->getRecentActivities(5),
            'serapanAnggaran' => $this->getBudgetAbsorption($year),
        ]);
    }

    private function getKpiMetrics(int $year, int $month): array
    {
        $kegiatanAktif = DB::table('kegiatan')->count();
        $translokBerjalan = DB::table('translok_master')->count();

        $mitraBps = DB::table('mitra2025')->count();
        $pegawaiOrganik = DB::table('organik')->count();
        $totalMitra = $mitraBps + $pegawaiOrganik;

        $realisasiHonorDb = DB::table('petugas')
            ->where('tahun', $year)
            ->sum('jml_hr');

        $paguTahunanHonor = 500000000;
        $persenHonor = $paguTahunanHonor > 0 ? (int) round(($realisasiHonorDb / $paguTahunanHonor) * 100) : 0;

        return [
            'kegiatan_aktif' => $kegiatanAktif,
            'kegiatan_baru_bulan_ini' => 0,
            'translok_berjalan' => $translokBerjalan,
            'translok_pending' => 0,
            'realisasi_honor' => min($persenHonor, 100),
            'mitra_terlibat' => $totalMitra,
        ];
    }

    private function getRecentActivities(int $limit): array
    {
        return DB::table('kegiatan')
            ->limit($limit)
            ->get()
            ->map(fn ($giat) => [
                'id' => $giat->kd_giat ?? uniqid(),
                'nama' => $giat->ur_giat,
                'tenggat' => 'Desember ' . now()->year,
                'status' => 'Berjalan',
                'status_color' => 'emerald'
            ])
            ->toArray();
    }

    private function getBudgetAbsorption(int $year): array
    {
        $realisasiHonorDb = DB::table('petugas')
            ->where('tahun', $year)
            ->sum('jml_hr');

        $paguTahunanHonor = 500000000;
        $persenHonor = $paguTahunanHonor > 0 ? (int) round(($realisasiHonorDb / $paguTahunanHonor) * 100) : 0;

        return [
            [
                'id' => 1,
                'label' => 'Honorarium Mitra (Petugas)',
                'persentase' => min($persenHonor, 100),
                'color' => 'blue'
            ],
            [
                'id' => 2,
                'label' => 'Perjalanan Dinas (Translok)',
                'persentase' => 42,
                'color' => 'amber'
            ],
            [
                'id' => 3,
                'label' => 'Kegiatan Rapat / FGD',
                'persentase' => 88,
                'color' => 'emerald'
            ],
        ];
    }
}
