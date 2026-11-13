<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $sekarang = now('Asia/Jakarta');
        $tahun = (int) $request->session()->get('tahun_aktif', $sekarang->year);

        if (! $request->session()->has('tahun_aktif') || $tahun < 2020 || $tahun > $sekarang->year + 1) {
            $tahun = $sekarang->year;
            $request->session()->put('tahun_aktif', $tahun);
        }

        if ($request->user()->role === 'mitra') {
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

        $honor = $this->ringkasanHonor($tahun);
        $translok = $this->ringkasanTranslok($tahun);

        return Inertia::render('Dashboard', [
            'kpi' => $this->statistik($tahun, $honor['persentase']),
            'kegiatanTerkini' => $this->kegiatanTerkini($tahun),
            'serapanAnggaran' => [
                [
                    'id' => 1,
                    'label' => 'Honor Dibayar dari yang Disetujui',
                    'persentase' => $honor['persentase'],
                    'color' => 'blue',
                ],
                [
                    'id' => 2,
                    'label' => 'Nilai Pagu Translok Dialokasikan',
                    'persentase' => $translok['persentase'],
                    'color' => 'amber',
                ],
            ],
        ]);
    }

    private function statistik(int $tahun, int $persentaseHonor): array
    {
        $sekarang = now('Asia/Jakarta');
        $tahunString = (string) $tahun;
        $tanggal = $sekarang->toDateString();
        $awalBulan = $sekarang->copy()->startOfMonth()->toDateTimeString();
        $akhirBulan = $sekarang->copy()->endOfMonth()->toDateTimeString();

        return [
            'kegiatan_aktif' => DB::table('tb_kegiatan')
                ->where('tahun', $tahunString)
                ->where('status', 'berjalan')
                ->where('is_active', 1)
                ->count(),

            'kegiatan_baru_bulan_ini' => DB::table('tb_kegiatan')
                ->where('tahun', $tahunString)
                ->whereBetween('created_at', [$awalBulan, $akhirBulan])
                ->count(),

            'translok_berjalan' => DB::table('tb_translok_alokasi as alokasi')
                ->join('tb_translok_master as master', 'master.id', '=', 'alokasi.translok_master_id')
                ->where('master.tahun', $tahunString)
                ->where('alokasi.status', 'disetujui')
                ->whereDate('alokasi.tanggal_mulai', '<=', $tanggal)
                ->whereDate('alokasi.tanggal_selesai', '>=', $tanggal)
                ->count(),

            'translok_pending' => DB::table('tb_translok_alokasi as alokasi')
                ->join('tb_translok_master as master', 'master.id', '=', 'alokasi.translok_master_id')
                ->where('master.tahun', $tahunString)
                ->where('alokasi.status', 'draft')
                ->count(),

            'realisasi_honor' => $persentaseHonor,

            'mitra_terlibat' => DB::table('tb_kegiatan_petugas')
                ->where('tahun', $tahunString)
                ->whereNotNull('mitra_id')
                ->where('status', '!=', 'dibatalkan')
                ->distinct()
                ->count('mitra_id'),
        ];
    }

    private function kegiatanTerkini(int $tahun): array
    {
        return DB::table('tb_kegiatan')
            ->where('tahun', (string) $tahun)
            ->select('id', 'ur_giat', 'tanggal_selesai', 'status')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn ($kegiatan) => [
                'id' => $kegiatan->id,
                'nama' => $kegiatan->ur_giat,
                'tenggat' => $kegiatan->tanggal_selesai
                    ? Carbon::parse($kegiatan->tanggal_selesai)
                        ->locale('id')
                        ->translatedFormat('d F Y')
                    : 'Belum ditentukan',
                'status' => match ($kegiatan->status) {
                    'berjalan' => 'Berjalan',
                    'selesai' => 'Selesai',
                    default => 'Draft',
                },
                'status_color' => match ($kegiatan->status) {
                    'berjalan' => 'emerald',
                    'selesai' => 'blue',
                    default => 'slate',
                },
            ])
            ->all();
    }

    private function ringkasanHonor(int $tahun): array
    {
        $hasil = DB::table('tb_kegiatan_petugas')
            ->where('tahun', (string) $tahun)
            ->selectRaw("COALESCE(SUM(CASE WHEN status IN ('disetujui', 'dibayar') THEN jml_hr ELSE 0 END), 0) AS total_disetujui")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'dibayar' THEN jml_hr ELSE 0 END), 0) AS total_dibayar")
            ->first();

        return [
            'persentase' => $this->persentase(
                (float) $hasil->total_dibayar,
                (float) $hasil->total_disetujui
            ),
        ];
    }

    private function ringkasanTranslok(int $tahun): array
    {
        $tahunString = (string) $tahun;

        $pagu = (float) DB::table('tb_translok_master')
            ->where('tahun', $tahunString)
            ->sum('pagu_anggaran');

        $alokasi = DB::table('tb_translok_alokasi as alokasi')
            ->join('tb_translok_master as master', 'master.id', '=', 'alokasi.translok_master_id')
            ->where('master.tahun', $tahunString)
            ->whereIn('alokasi.status', ['disetujui', 'selesai'])
            ->selectRaw('COALESCE(SUM(alokasi.volume * master.rate), 0) AS nilai_teralokasi')
            ->first();

        return [
            'persentase' => $this->persentase(
                (float) $alokasi->nilai_teralokasi,
                $pagu
            ),
        ];
    }

    private function persentase(float $nilai, float $total): int
    {
        return $total > 0
            ? min(100, max(0, (int) round($nilai / $total * 100)))
            : 0;
    }
}
