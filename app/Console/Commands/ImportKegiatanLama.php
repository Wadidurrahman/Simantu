<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ImportKegiatanLama extends Command
{
    protected $signature = 'kegiatan:import-lama {--dry-run}';

    protected $description = 'Impor data kegiatan lama ke tabel kegiatans';

    public function handle(): int
    {
        if (! Schema::hasTable('kegiatan')) {
            $this->error('Tabel kegiatan lama tidak ditemukan.');
            return self::FAILURE;
        }

        if (! Schema::hasTable('kegiatans')) {
            $this->error('Tabel kegiatans tidak ditemukan.');
            return self::FAILURE;
        }

        $rows = DB::table('kegiatan')
            ->orderBy('tahun')
            ->orderBy('kd_tim')
            ->orderBy('kd_giat')
            ->get([
                'id',
                'tahun',
                'kd_tim',
                'nm_tim',
                'kd_giat',
                'ur_giat',
                'sat',
                'hr_sat',
            ]);

        if ($rows->isEmpty()) {
            $this->warn('Tidak ada data pada tabel kegiatan lama.');
            return self::SUCCESS;
        }

        $invalid = [];
        $normalized = [];

        foreach ($rows as $row) {
            $tahun = trim((string) $row->tahun);
            $kdTim = trim((string) $row->kd_tim);
            $nmTim = trim((string) ($row->nm_tim ?? ''));
            $kdGiat = trim((string) $row->kd_giat);
            $uraian = trim((string) $row->ur_giat);
            $satuan = trim((string) ($row->sat ?? ''));
            $honor = $this->normalizeHonor($row->hr_sat);

            if (
                ! preg_match('/^\d{4}$/', $tahun)
                || $kdTim === ''
                || $kdGiat === ''
                || $uraian === ''
                || $honor === null
            ) {
                $invalid[] = [
                    $row->id,
                    $row->tahun,
                    $row->kd_tim,
                    $row->kd_giat,
                    $row->hr_sat,
                ];

                continue;
            }

            $normalized[] = [
                'id_lama' => $row->id,
                'tahun' => (int) $tahun,
                'kd_tim' => $kdTim,
                'nm_tim' => $nmTim,
                'kd_giat' => $kdGiat,
                'ur_giat' => $uraian,
                'satuan' => $satuan,
                'hr_satuan' => $honor,
            ];
        }

        if ($invalid !== []) {
            $this->error('Ada data lama yang tidak valid.');

            $this->table(
                ['ID', 'Tahun', 'Tim', 'Kegiatan', 'Honor'],
                $invalid
            );

            return self::FAILURE;
        }

        $this->info('Validasi berhasil.');
        $this->info('Jumlah data lama: '.count($normalized));

        if ($this->option('dry-run')) {
            $this->tampilkanRingkasan($normalized);
            return self::SUCCESS;
        }

        DB::transaction(function () use ($normalized) {
            foreach ($normalized as $row) {
                DB::table('kegiatans')->updateOrInsert(
                    [
                        'tahun' => $row['tahun'],
                        'kd_tim' => $row['kd_tim'],
                        'kd_giat' => $row['kd_giat'],
                    ],
                    [
                        'nm_tim' => $row['nm_tim'],
                        'ur_giat' => $row['ur_giat'],
                        'satuan' => $row['satuan'],
                        'hr_satuan' => $row['hr_satuan'],
                        'is_active' => true,
                        'updated_at' => now(),
                        'created_at' => DB::raw('COALESCE(created_at, NOW())'),
                    ]
                );
            }
        });

        $lama = collect($normalized)
            ->groupBy('tahun')
            ->map(fn ($items, $tahun) => [
                'tahun' => (int) $tahun,
                'jumlah' => $items->count(),
                'total' => $items->sum(fn ($item) => (float) $item['hr_satuan']),
            ])
            ->sortKeys();

        $baru = DB::table('kegiatans')
            ->selectRaw('tahun, COUNT(*) AS jumlah, SUM(hr_satuan) AS total')
            ->groupBy('tahun')
            ->orderBy('tahun')
            ->get()
            ->keyBy('tahun');

        $hasil = [];
        $cocok = true;

        foreach ($lama as $tahun => $row) {
            $rowBaru = $baru->get((int) $tahun);

            $jumlahBaru = (int) ($rowBaru->jumlah ?? 0);
            $totalBaru = (float) ($rowBaru->total ?? 0);

            $jumlahSama = (int) $row['jumlah'] === $jumlahBaru;
            $totalSama = abs((float) $row['total'] - $totalBaru) < 0.01;
            $sama = $jumlahSama && $totalSama;

            $cocok = $cocok && $sama;

            $hasil[] = [
                $tahun,
                $row['jumlah'],
                $jumlahBaru,
                number_format($row['total'], 0, ',', '.'),
                number_format($totalBaru, 0, ',', '.'),
                $sama ? 'SAMA' : 'BEDA',
            ];
        }

        $this->table(
            ['Tahun', 'Data Lama', 'Data Baru', 'Honor Lama', 'Honor Baru', 'Hasil'],
            $hasil
        );

        if (! $cocok) {
            $this->error('Hasil import belum sama dengan data lama.');
            return self::FAILURE;
        }

        $this->info('Import kegiatan selesai dan data terverifikasi.');

        return self::SUCCESS;
    }

    private function normalizeHonor($value): ?float
    {
        $value = trim((string) ($value ?? ''));

        if ($value === '') return 0;

        $value = preg_replace('/\s+/', '', $value);

        if (preg_match('/^\d+$/', $value)) {
            return (float) $value;
        }

        if (preg_match('/^\d{1,3}(\.\d{3})+$/', $value)) {
            return (float) str_replace('.', '', $value);
        }

        if (preg_match('/^\d{1,3}(,\d{3})+$/', $value)) {
            return (float) str_replace(',', '', $value);
        }

        if (preg_match('/^\d+[,.]\d{1,2}$/', $value)) {
            return (float) str_replace(',', '.', $value);
        }

        return null;
    }

    private function tampilkanRingkasan(array $rows): void
    {
        $ringkasan = collect($rows)
            ->groupBy('tahun')
            ->map(fn ($items, $tahun) => [
                $tahun,
                $items->count(),
                number_format(
                    $items->sum(fn ($item) => (float) $item['hr_satuan']),
                    0,
                    ',',
                    '.'
                ),
            ])
            ->sortBy(fn ($row) => $row[0])
            ->values()
            ->all();

        $this->table(
            ['Tahun', 'Jumlah Data', 'Total Honor'],
            $ringkasan
        );
    }
}
