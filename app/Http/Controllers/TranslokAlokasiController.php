<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use stdClass;

class TranslokAlokasiController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeView($request);

        $tahun = $this->tahun();
        $bulan = sprintf('%02d', $request->integer('bulan', now()->month));

        abort_unless((int) $bulan >= 1 && (int) $bulan <= 12, 422);

        $items = DB::table('translok_alokasi as a')
            ->leftJoin('translok_master as m', 'm.id_translok', '=', 'a.id_translok')
            ->leftJoin('organik as o', 'o.nip_lama', '=', 'a.nip_lama')
            ->where('a.tahun', $tahun)
            ->where('a.bulan', $bulan)
            ->select([
                'a.id',
                'a.tahun',
                'a.bulan',
                'a.id_translok',
                'a.nip_lama',
                'a.jadwal_a',
                'a.jadwal_b',
                'a.vol',
                'a.user',
                'm.kd_translok',
                'm.translok',
                'm.tim',
                'm.sat',
                'm.rate',
                'o.nama',
            ])
            ->orderBy('a.jadwal_a')
            ->orderBy('o.nama')
            ->get();

        $detailCounts = DB::table('translok_detail')
            ->whereIn('id_alokasi', $items->pluck('id'))
            ->select('id_alokasi')
            ->selectRaw('COUNT(*) AS jumlah')
            ->groupBy('id_alokasi')
            ->pluck('jumlah', 'id_alokasi');

        $alokasi = $items->map(function ($item) use ($detailCounts) {
            return [
                'id' => $item->id,
                'tahun' => $item->tahun,
                'bulan' => $item->bulan,
                'id_translok' => $item->id_translok,
                'nip_lama' => $item->nip_lama,
                'nama' => $item->nama ?? $item->nip_lama,
                'translok' => $item->translok,
                'kd_translok' => $item->kd_translok,
                'tim' => $item->tim,
                'satuan' => $item->sat,
                'rate' => (float) ($item->rate ?? 0),
                'jadwal_a' => $item->jadwal_a,
                'jadwal_b' => $item->jadwal_b,
                'vol' => (int) $item->vol,
                'jumlah_detail' => (int) ($detailCounts[$item->id] ?? 0),
                'penginput' => $item->user,
            ];
        });

        $masters = DB::table('translok_master')
            ->where('thn', $tahun)
            ->orderByRaw('CAST(kd_translok AS UNSIGNED)')
            ->get();

        $used = DB::table('translok_alokasi')
            ->whereIn('id_translok', $masters->pluck('id_translok'))
            ->select('id_translok')
            ->selectRaw('COALESCE(SUM(vol), 0) AS total')
            ->groupBy('id_translok')
            ->pluck('total', 'id_translok');

        $masterOptions = $masters->map(function ($master) use ($used) {
            $volume = (int) $master->vol_a;
            $allocated = (int) ($used[$master->id_translok] ?? 0);

            return [
                'id' => $master->id_translok,
                'kode' => $master->kd_translok,
                'nama' => $master->translok,
                'tim' => $master->tim,
                'satuan' => $master->sat,
                'volume' => $volume,
                'teralokasi' => $allocated,
                'sisa' => $volume - $allocated,
                'rate' => (float) $master->rate,
            ];
        });

        $pegawai = DB::table('organik')
            ->select('nip_lama', 'nama')
            ->orderBy('nama')
            ->get();

        return Inertia::render('Translok/Alokasi/Index', [
            'alokasi' => $alokasi,
            'masters' => $masterOptions,
            'pegawai' => $pegawai,
            'tahun' => (int) $tahun,
            'bulan' => $bulan,
            'canManage' => $this->canManage($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = $this->tahun();
        $data = $this->validateInput($request, $tahun);

        DB::transaction(function () use ($request, $tahun, $data) {
            $master = $this->lockMaster($data['id_translok'], $tahun);

            $bulan = $data['bulan'];
            $nip = $data['nip_lama'];
            $volume = (int) $data['vol'];
            $id = $master->id_translok . $bulan . $nip;

            $this->lockPegawai($nip);

            $existing = DB::table('translok_alokasi')
                ->where('tahun', $tahun)
                ->where('bulan', $bulan)
                ->where('nip_lama', $nip)
                ->where('id_translok', $master->id_translok)
                ->exists();

            if ($existing) {
                throw ValidationException::withMessages([
                    'id_translok' => 'Pegawai sudah memiliki alokasi untuk kegiatan ini pada bulan yang sama.',
                ]);
            }

            if (DB::table('translok_alokasi')->where('id', $id)->exists()) {
                throw ValidationException::withMessages([
                    'nip_lama' => 'Identitas alokasi sudah terdaftar.',
                ]);
            }

            $this->validateCapacity(
                $master,
                $tahun,
                $nip,
                $bulan,
                $volume
            );

            DB::table('translok_alokasi')->insert([
                'id' => $id,
                'tahun' => $tahun,
                'bulan' => $bulan,
                'id_translok' => $master->id_translok,
                'jadwal_a' => $data['jadwal_a'],
                'jadwal_b' => $data['jadwal_b'],
                'nip_lama' => $nip,
                'vol' => $volume,
                'user' => (string) (
                    $request->user()->username
                    ?? $request->user()->nip
                    ?? $request->user()->id
                ),
            ]);

            $this->syncMaster($master);
        }, 3);

        return back()->with('success', 'Alokasi Translok berhasil ditambahkan.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = $this->tahun();

        $data = $request->validate([
            'jadwal_a' => ['required', 'date_format:Y-m-d'],
            'jadwal_b' => ['required', 'date_format:Y-m-d', 'after_or_equal:jadwal_a'],
            'vol' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($tahun, $id, $data) {
            $current = DB::table('translok_alokasi')
                ->where('id', $id)
                ->where('tahun', $tahun)
                ->first();

            abort_if(!$current, 404);

            $master = $this->lockMaster($current->id_translok, $tahun);

            $this->lockPegawai($current->nip_lama);

            $alokasi = DB::table('translok_alokasi')
                ->where('id', $id)
                ->where('tahun', $tahun)
                ->lockForUpdate()
                ->first();

            abort_if(!$alokasi, 404);

            $this->validateDates(
                $data['jadwal_a'],
                $data['jadwal_b'],
                $tahun,
                $alokasi->bulan
            );

            $detailCount = DB::table('translok_detail')
                ->where('id_alokasi', $id)
                ->count();

            $volume = (int) $data['vol'];

            if ($volume < $detailCount) {
                throw ValidationException::withMessages([
                    'vol' => 'Volume tidak boleh lebih kecil dari jumlah perjalanan yang sudah tercatat.',
                ]);
            }

            if ($detailCount > 0) {
                $outside = DB::table('translok_detail')
                    ->where('id_alokasi', $id)
                    ->where(function ($query) use ($data) {
                        $query
                            ->where('tgl', '<', $data['jadwal_a'])
                            ->orWhere('tgl', '>', $data['jadwal_b']);
                    })
                    ->exists();

                if ($outside) {
                    throw ValidationException::withMessages([
                        'jadwal_a' => 'Periode baru tidak boleh mengeluarkan tanggal perjalanan yang sudah tercatat.',
                    ]);
                }
            }

            $this->validateCapacity(
                $master,
                $tahun,
                $alokasi->nip_lama,
                $alokasi->bulan,
                $volume,
                $id
            );

            DB::table('translok_alokasi')
                ->where('id', $id)
                ->where('tahun', $tahun)
                ->update([
                    'jadwal_a' => $data['jadwal_a'],
                    'jadwal_b' => $data['jadwal_b'],
                    'vol' => $volume,
                ]);

            $this->syncMaster($master);
        }, 3);

        return back()->with('success', 'Alokasi Translok berhasil diperbarui.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = $this->tahun();

        DB::transaction(function () use ($tahun, $id) {
            $current = DB::table('translok_alokasi')
                ->where('id', $id)
                ->where('tahun', $tahun)
                ->first();

            abort_if(!$current, 404);

            $master = $this->lockMaster($current->id_translok, $tahun);

            $this->lockPegawai($current->nip_lama);

            $alokasi = DB::table('translok_alokasi')
                ->where('id', $id)
                ->where('tahun', $tahun)
                ->lockForUpdate()
                ->first();

            abort_if(!$alokasi, 404);

            $hasDetail = DB::table('translok_detail')
                ->where('id_alokasi', $id)
                ->exists();

            if ($hasDetail) {
                throw ValidationException::withMessages([
                    'alokasi' => 'Alokasi tidak dapat dihapus karena sudah memiliki detail perjalanan.',
                ]);
            }

            DB::table('translok_alokasi')
                ->where('id', $id)
                ->where('tahun', $tahun)
                ->delete();

            $this->syncMaster($master);
        }, 3);

        return back()->with('success', 'Alokasi Translok berhasil dihapus.');
    }

    private function validateInput(Request $request, string $tahun): array
    {
        $data = $request->validate([
            'bulan' => ['required', 'regex:/^(0[1-9]|1[0-2])$/'],
            'id_translok' => ['required', 'string', 'max:255'],
            'nip_lama' => ['required', 'string', 'max:24'],
            'jadwal_a' => ['required', 'date_format:Y-m-d'],
            'jadwal_b' => ['required', 'date_format:Y-m-d', 'after_or_equal:jadwal_a'],
            'vol' => ['required', 'integer', 'min:1'],
        ]);

        $this->validateDates(
            $data['jadwal_a'],
            $data['jadwal_b'],
            $tahun,
            $data['bulan']
        );

        return $data;
    }

    private function validateDates(
        string $start,
        string $end,
        string $tahun,
        string $bulan
    ): void {
        $awal = Carbon::createFromFormat('!Y-m-d', $start);
        $akhir = Carbon::createFromFormat('!Y-m-d', $end);

        if (
            $awal->format('Y') !== $tahun ||
            $akhir->format('Y') !== $tahun ||
            $awal->format('m') !== $bulan ||
            $akhir->format('m') !== $bulan
        ) {
            throw ValidationException::withMessages([
                'jadwal_a' => 'Periode alokasi harus berada dalam bulan dan tahun yang dipilih.',
            ]);
        }
    }

    private function lockMaster(string $id, string $tahun): stdClass
    {
        $master = DB::table('translok_master')
            ->where('id_translok', $id)
            ->where('thn', $tahun)
            ->lockForUpdate()
            ->first();

        abort_if(!$master, 404);

        return $master;
    }

    private function lockPegawai(string $nip): void
    {
        $pegawai = DB::table('organik')
            ->where('nip_lama', $nip)
            ->lockForUpdate()
            ->first();

        if (!$pegawai) {
            throw ValidationException::withMessages([
                'nip_lama' => 'Pegawai tidak ditemukan.',
            ]);
        }
    }

    private function validateCapacity(
        stdClass $master,
        string $tahun,
        string $nip,
        string $bulan,
        int $volume,
        ?string $excludeId = null
    ): void {
        $employeeQuery = DB::table('translok_alokasi')
            ->where('tahun', $tahun)
            ->where('bulan', $bulan)
            ->where('nip_lama', $nip);

        $masterQuery = DB::table('translok_alokasi')
            ->where('id_translok', $master->id_translok);

        if ($excludeId !== null) {
            $employeeQuery->where('id', '!=', $excludeId);
            $masterQuery->where('id', '!=', $excludeId);
        }

        $employeeVolume = (int) $employeeQuery->sum('vol');
        $masterVolume = (int) $masterQuery->sum('vol');

        if ($employeeVolume + $volume > 16) {
            throw ValidationException::withMessages([
                'vol' => 'Total alokasi pegawai tidak boleh melebihi 16 volume dalam satu bulan.',
            ]);
        }

        if ($masterVolume + $volume > (int) $master->vol_a) {
            throw ValidationException::withMessages([
                'vol' => 'Sisa volume Master Translok tidak mencukupi.',
            ]);
        }
    }

    private function syncMaster(stdClass $master): void
    {
        $allocated = (int) DB::table('translok_alokasi')
            ->where('id_translok', $master->id_translok)
            ->sum('vol');

        $volume = (int) $master->vol_a;
        $sisa = $volume - $allocated;

        if ($sisa < 0) {
            throw ValidationException::withMessages([
                'vol' => 'Total alokasi telah melampaui volume Master Translok.',
            ]);
        }

        $rate = (float) $master->rate;

        DB::table('translok_master')
            ->where('id_translok', $master->id_translok)
            ->update([
                'sisa_v' => $sisa,
                'sisa_a' => number_format($sisa * $rate, 2, '.', ''),
            ]);
    }

    private function authorizeView(Request $request): void
    {
        abort_unless(
            in_array($request->user()->role, ['admin', 'ketua'], true),
            403
        );
    }

    private function authorizeManage(Request $request): void
    {
        $this->authorizeView($request);
    }

    private function canManage(Request $request): bool
    {
        return in_array($request->user()->role, ['admin', 'ketua'], true);
    }

    private function tahun(): string
    {
        $tahun = (int) session('tahun', now()->year);

        abort_unless($tahun >= 2000 && $tahun <= 2100, 422);

        return (string) $tahun;
    }
}
