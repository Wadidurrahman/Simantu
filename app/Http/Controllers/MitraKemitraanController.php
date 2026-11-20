<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MitraKemitraanController extends Controller
{
    private function resolveTahun(Request $request): string
    {
        return (string) ($request->input('tahun')
            ?? session('tahun_anggaran')
            ?? now()->format('Y'));
    }

    private function mitraTable(): ?string
    {
        foreach (['tb_mitra', 'mitra', 'mitras'] as $table) {
            if (Schema::hasTable($table)) {
                return $table;
            }
        }
        return null;
    }

    public function index(Request $request): Response
    {
        $tahun = $this->resolveTahun($request);
        $bulan = (int) ($request->input('bulan') ?: now()->month);
        $timId = $request->filled('tim_id') ? (int) $request->input('tim_id') : null;

        $timList = DB::table('tb_tim')
            ->where('tahun', $tahun)
            ->where('status', 'aktif')
            ->orderBy('id')
            ->get(['id', 'nama_tim']);

        $kegiatanList = DB::table('tb_kegiatan')
            ->where('tahun', $tahun)
            ->where('is_active', 1)
            ->when($timId, fn ($q) => $q->where('tim_id', $timId))
            ->orderBy('kd_giat')
            ->get(['id', 'tim_id', 'kd_tim', 'kd_giat', 'ur_giat', 'satuan', 'hr_satuan']);

        $mitraTable = $this->mitraTable();
        $mitraList = $mitraTable
            ? DB::table($mitraTable)->orderBy('nama')->get()
            : collect();

        $pegawaiList = Schema::hasTable('users')
            ? DB::table('users')
                ->whereNotIn('role', ['mitra'])
                ->orderBy('name')
                ->get(['id', 'name', 'nip', 'username'])
            : collect();

        $query = DB::table('tb_kegiatan_petugas as kp')
            ->join('tb_kegiatan as k', 'k.id', '=', 'kp.kegiatan_id')
            ->leftJoin('tb_tim as t', 't.id', '=', 'k.tim_id')
            ->leftJoin('users as u', 'u.id', '=', 'kp.user_id')
            ->where('kp.tahun', $tahun)
            ->where('kp.bulan', $bulan);

        if ($mitraTable) {
            $query->leftJoin("{$mitraTable} as m", 'm.id', '=', 'kp.mitra_id');
        }

        if ($timId) {
            $query->where('k.tim_id', $timId);
        }

        $selects = [
            'kp.id',
            'kp.kegiatan_id',
            'kp.user_id',
            'kp.mitra_id',
            'kp.tahun',
            'kp.bulan',
            'kp.sebagai',
            'kp.satuan',
            'kp.hr_satuan',
            'kp.vol',
            'kp.jml_hr',
            'kp.no_spt',
            'kp.tgl_spt',
            'kp.no_bast',
            'kp.tgl_bast',
            'kp.status',
            'k.tim_id',
            'k.kd_tim',
            'k.kd_giat',
            'k.ur_giat',
            't.nama_tim',
            'u.name as nama_user',
            'u.nip as nip_user',
        ];

        if ($mitraTable) {
            $selects[] = 'm.nama as nama_mitra';
            $selects[] = Schema::hasColumn($mitraTable, 'id_sobat') ? 'm.id_sobat' : DB::raw('NULL as id_sobat');
            $selects[] = Schema::hasColumn($mitraTable, 'kecamatan') ? 'm.kecamatan as asal_kecamatan' : DB::raw('NULL as asal_kecamatan');
        } else {
            $selects[] = DB::raw('NULL as nama_mitra');
            $selects[] = DB::raw('NULL as id_sobat');
            $selects[] = DB::raw('NULL as asal_kecamatan');
        }

        $items = $query->orderByDesc('kp.id')->get($selects)->map(function ($row) {
            $isMitra = !empty($row->mitra_id);
            $row->tipe_petugas = $isMitra ? 'mitra' : 'organik';
            $row->nama_petugas = $isMitra ? ($row->nama_mitra ?? '-') : ($row->nama_user ?? '-');
            $row->kode_identitas = $isMitra ? ($row->id_sobat ?? '-') : ($row->nip_user ?? '-');
            return $row;
        });

        return Inertia::render('Mitra/InputKemitraan', [
            'filters' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
                'tim_id' => $timId,
            ],
            'timList' => $timList,
            'kegiatanList' => $kegiatanList,
            'mitraList' => $mitraList,
            'pegawaiList' => $pegawaiList,
            'items' => $items,
            'ppkDefault' => [
                'nm_ppk' => config('app.nm_ppk', ''),
                'nip_ppk' => config('app.nip_ppk', ''),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tahun' => ['required', 'string', 'size:4'],
            'bulan' => ['required', 'integer', 'min:1', 'max:12'],
            'kegiatan_id' => ['required', 'integer', 'exists:tb_kegiatan,id'],
            'tipe_petugas' => ['required', 'in:mitra,organik'],
            'mitra_id' => ['nullable', 'required_if:tipe_petugas,mitra', 'integer'],
            'user_id' => ['nullable', 'required_if:tipe_petugas,organik', 'integer', 'exists:users,id'],
            'sebagai' => ['nullable', 'string', 'max:100'],
            'satuan' => ['required', 'string', 'max:50'],
            'hr_satuan' => ['required', 'numeric', 'min:0'],
            'vol' => ['required', 'numeric', 'min:1'],
        ]);

        $jmlHr = (float) $validated['hr_satuan'] * (float) $validated['vol'];
        $isMitra = $validated['tipe_petugas'] === 'mitra';

        DB::transaction(function () use ($validated, $jmlHr, $isMitra, $request) {
            // Cek batas SBM Rp3.300.000 per bulan untuk mitra
            if ($isMitra) {
                $totalSbm = DB::table('tb_kegiatan_petugas')
                    ->where('tahun', $validated['tahun'])
                    ->where('bulan', $validated['bulan'])
                    ->where('mitra_id', $validated['mitra_id'])
                    ->sum('jml_hr');

                if (($totalSbm + $jmlHr) > 3300000) {
                    throw ValidationException::withMessages([
                        'vol' => 'Total honor mitra bulan ini melebihi batas SBM (Rp 3.300.000). Sisa kuota: Rp ' . number_format(max(0, 3300000 - $totalSbm), 0, ',', '.'),
                    ]);
                }
            }

            // Cek duplikasi pada kegiatan dan bulan yang sama
            $exists = DB::table('tb_kegiatan_petugas')
                ->where('tahun', $validated['tahun'])
                ->where('bulan', $validated['bulan'])
                ->where('kegiatan_id', $validated['kegiatan_id'])
                ->when($isMitra, fn ($q) => $q->where('mitra_id', $validated['mitra_id']))
                ->when(!$isMitra, fn ($q) => $q->where('user_id', $validated['user_id']))
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    $isMitra ? 'mitra_id' : 'user_id' => 'Petugas sudah terdaftar pada kegiatan ini di bulan yang sama.',
                ]);
            }

            DB::table('tb_kegiatan_petugas')->insert([
                'kegiatan_id' => $validated['kegiatan_id'],
                'mitra_id' => $isMitra ? $validated['mitra_id'] : null,
                'user_id' => !$isMitra ? $validated['user_id'] : null,
                'tahun' => $validated['tahun'],
                'bulan' => $validated['bulan'],
                'sebagai' => $validated['sebagai'] ?: 'Petugas Pendataan',
                'satuan' => $validated['satuan'],
                'hr_satuan' => $validated['hr_satuan'],
                'vol' => $validated['vol'],
                'jml_hr' => $jmlHr,
                'status' => 'aktif',
                'created_by' => $request->user()?->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, 3);

        return back()->with('success', 'Data kemitraan berhasil ditambahkan.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $row = DB::table('tb_kegiatan_petugas')->where('id', $id)->first();
        abort_if(!$row, 404);

        $validated = $request->validate([
            'sebagai' => ['nullable', 'string', 'max:100'],
            'satuan' => ['required', 'string', 'max:50'],
            'hr_satuan' => ['required', 'numeric', 'min:0'],
            'vol' => ['required', 'numeric', 'min:1'],
        ]);

        $jmlHr = (float) $validated['hr_satuan'] * (float) $validated['vol'];

        DB::transaction(function () use ($row, $validated, $jmlHr) {
            if (!empty($row->mitra_id)) {
                $totalSbmLain = DB::table('tb_kegiatan_petugas')
                    ->where('tahun', $row->tahun)
                    ->where('bulan', $row->bulan)
                    ->where('mitra_id', $row->mitra_id)
                    ->where('id', '!=', $row->id)
                    ->sum('jml_hr');

                if (($totalSbmLain + $jmlHr) > 3300000) {
                    throw ValidationException::withMessages([
                        'vol' => 'Total honor mitra bulan ini melebihi batas SBM (Rp 3.300.000).',
                    ]);
                }
            }

            DB::table('tb_kegiatan_petugas')->where('id', $row->id)->update([
                'sebagai' => $validated['sebagai'] ?: $row->sebagai,
                'satuan' => $validated['satuan'],
                'hr_satuan' => $validated['hr_satuan'],
                'vol' => $validated['vol'],
                'jml_hr' => $jmlHr,
                'updated_at' => now(),
            ]);
        }, 3);

        return back()->with('success', 'Data kemitraan berhasil diperbarui.');
    }

    public function destroy(int $id): RedirectResponse
    {
        DB::table('tb_kegiatan_petugas')->where('id', $id)->delete();

        return back()->with('success', 'Data kemitraan berhasil dihapus.');
    }

    public function copy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tahun' => ['required', 'string', 'size:4'],
            'dari_bulan' => ['required', 'integer', 'min:1', 'max:12'],
            'ke_bulan' => ['required', 'integer', 'min:1', 'max:12', 'different:dari_bulan'],
            'tim_id' => ['required', 'integer', 'exists:tb_tim,id'],
            'kegiatan_id' => ['nullable', 'integer', 'exists:tb_kegiatan,id'],
        ]);

        $copied = 0;

        DB::transaction(function () use ($validated, $request, &$copied) {
            $sumber = DB::table('tb_kegiatan_petugas as kp')
                ->join('tb_kegiatan as k', 'k.id', '=', 'kp.kegiatan_id')
                ->where('kp.tahun', $validated['tahun'])
                ->where('kp.bulan', $validated['dari_bulan'])
                ->where('k.tim_id', $validated['tim_id'])
                ->when($validated['kegiatan_id'] ?? null, fn ($q, $kegId) => $q->where('kp.kegiatan_id', $kegId))
                ->get(['kp.*']);

            if ($sumber->isEmpty()) {
                throw ValidationException::withMessages([
                    'dari_bulan' => 'Tidak ada data petugas pada bulan sumber yang dipilih.',
                ]);
            }

            foreach ($sumber as $item) {
                $exists = DB::table('tb_kegiatan_petugas')
                    ->where('tahun', $validated['tahun'])
                    ->where('bulan', $validated['ke_bulan'])
                    ->where('kegiatan_id', $item->kegiatan_id)
                    ->when($item->mitra_id, fn ($q) => $q->where('mitra_id', $item->mitra_id))
                    ->when(!$item->mitra_id && $item->user_id, fn ($q) => $q->where('user_id', $item->user_id))
                    ->exists();

                if ($exists) {
                    continue;
                }

                if ($item->mitra_id) {
                    $totalSbm = DB::table('tb_kegiatan_petugas')
                        ->where('tahun', $validated['tahun'])
                        ->where('bulan', $validated['ke_bulan'])
                        ->where('mitra_id', $item->mitra_id)
                        ->sum('jml_hr');

                    if (($totalSbm + (float) $item->jml_hr) > 3300000) {
                        continue;
                    }
                }

                DB::table('tb_kegiatan_petugas')->insert([
                    'kegiatan_id' => $item->kegiatan_id,
                    'user_id' => $item->user_id,
                    'mitra_id' => $item->mitra_id,
                    'pengawas_user_id' => $item->pengawas_user_id,
                    'tahun' => $validated['tahun'],
                    'bulan' => $validated['ke_bulan'],
                    'sebagai' => $item->sebagai,
                    'satuan' => $item->satuan,
                    'hr_satuan' => $item->hr_satuan,
                    'vol' => $item->vol,
                    'jml_hr' => $item->jml_hr,
                    'status' => 'aktif',
                    'created_by' => $request->user()?->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $copied++;
            }
        }, 3);

        return back()->with('success', "Berhasil menyalin {$copied} data petugas ke bulan tujuan.");
    }

    public function rekapMitra(Request $request): Response
    {
        $tahun = $this->resolveTahun($request);
        $bulan = (int) ($request->input('bulan') ?: now()->month);
        $mitraTable = $this->mitraTable();

        $rekap = collect();
        if ($mitraTable) {
            $rekap = DB::table('tb_kegiatan_petugas as kp')
                ->join("{$mitraTable} as m", 'm.id', '=', 'kp.mitra_id')
                ->join('tb_kegiatan as k', 'k.id', '=', 'kp.kegiatan_id')
                ->where('kp.tahun', $tahun)
                ->where('kp.bulan', $bulan)
                ->whereNotNull('kp.mitra_id')
                ->groupBy('m.id', 'm.nama')
                ->select([
                    'm.id as mitra_id',
                    'm.nama',
                    Schema::hasColumn($mitraTable, 'id_sobat') ? DB::raw('MAX(m.id_sobat) as id_sobat') : DB::raw('NULL as id_sobat'),
                    Schema::hasColumn($mitraTable, 'kecamatan') ? DB::raw('MAX(m.kecamatan) as asal_kecamatan') : DB::raw('NULL as asal_kecamatan'),
                    DB::raw('COUNT(kp.id) as jml_kegiatan'),
                    DB::raw('SUM(kp.jml_hr) as total_honor'),
                ])
                ->orderByDesc('total_honor')
                ->get();
        }

        return Inertia::render('Mitra/RekapMitra', [
            'filters' => ['tahun' => $tahun, 'bulan' => $bulan],
            'rekap' => $rekap,
        ]);
    }

    public function rekapKegiatan(Request $request): Response
    {
        $tahun = $this->resolveTahun($request);
        $bulan = (int) ($request->input('bulan') ?: now()->month);

        $rekap = DB::table('tb_kegiatan_petugas as kp')
            ->join('tb_kegiatan as k', 'k.id', '=', 'kp.kegiatan_id')
            ->leftJoin('tb_tim as t', 't.id', '=', 'k.tim_id')
            ->where('kp.tahun', $tahun)
            ->where('kp.bulan', $bulan)
            ->groupBy('k.id', 'k.kd_giat', 'k.ur_giat', 't.nama_tim')
            ->select([
                'k.id as kegiatan_id',
                'k.kd_giat',
                'k.ur_giat',
                't.nama_tim',
                DB::raw('COUNT(kp.id) as jml_petugas'),
                DB::raw('SUM(kp.jml_hr) as total_honor'),
            ])
            ->orderBy('t.nama_tim')
            ->orderBy('k.kd_giat')
            ->get();

        return Inertia::render('Mitra/RekapKegiatan', [
            'filters' => ['tahun' => $tahun, 'bulan' => $bulan],
            'rekap' => $rekap,
        ]);
    }
}
