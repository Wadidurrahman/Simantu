<?php

namespace App\Http\Controllers;

use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TranslokMasterController extends Controller
{
    public function index(Request $request): Response
    {
        $pengguna = $request->user();

        abort_unless(
            $pengguna->status === 'aktif' && $pengguna->role !== 'mitra',
            403
        );

        $tahun = $this->tahunAktif($request);

        $query = DB::table('tb_translok_master as m')
            ->leftJoin('tb_kegiatan as k', 'k.id', '=', 'm.kegiatan_id')
            ->leftJoin('v_translok_saldo as s', 's.translok_master_id', '=', 'm.id')
            ->where('m.tahun', (string) $tahun)
            ->select(
                'm.*',
                'k.ur_giat as kegiatan_nama',
                'k.kd_giat as kegiatan_kode',
                'k.kd_tim as kegiatan_kd_tim',
                's.volume_teralokasi',
                's.sisa_volume',
                's.sisa_anggaran',
                's.total_tanggal_realisasi'
            );

        $this->batasiTim($query, $request, 'm.tim_id');

        $giat = $query
            ->orderBy('m.kd_translok')
            ->get()
            ->map(function ($item) {
                $pagu_anggaran = (float) $item->vol_a * (float) $item->rate;
                return [
                    'id' => $item->id,
                    'tahun' => $item->tahun,
                    'tim_id' => $item->tim_id,
                    'kegiatan_id' => $item->kegiatan_id,
                    'kd_translok' => $item->kd_translok,
                    'uraian' => $item->uraian,
                    'vol_a' => (int) $item->vol_a,
                    'vol_awal' => (int) $item->vol_a,
                    'satuan' => $item->satuan,
                    'rate' => (float) $item->rate,
                    'pagu_anggaran' => $pagu_anggaran,
                    'jml_anggaran' => $pagu_anggaran,
                    'volume_teralokasi' => (int) ($item->volume_teralokasi ?? 0),
                    'sisa_volume' => (int) ($item->sisa_volume ?? $item->vol_a),
                    'sisa_vol' => (int) ($item->sisa_volume ?? $item->vol_a),
                    'sisa_anggaran' => (float) ($item->sisa_anggaran ?? $pagu_anggaran),
                    'total_tanggal_realisasi' => (int) ($item->total_tanggal_realisasi ?? 0),
                    'realisasi_vol' => (int) ($item->total_tanggal_realisasi ?? 0),
                    'status' => $item->status,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                    'kegiatan' => $item->kegiatan_id ? [
                        'id' => $item->kegiatan_id,
                        'ur_giat' => $item->kegiatan_nama,
                        'kd_giat' => $item->kegiatan_kode,
                        'kd_tim' => $item->kegiatan_kd_tim,
                    ] : null,
                ];
            })
            ->values()
            ->all();

        $queryKegiatan = DB::table('tb_kegiatan')
            ->where('tahun', (string) $tahun)
            ->where('is_active', true);

        $this->batasiTim($queryKegiatan, $request, 'tim_id');

        $masterKegiatan = $queryKegiatan
            ->orderBy('kd_tim')
            ->orderBy('kd_giat')
            ->get()
            ->all();

        $queryTim = DB::table('tb_tim')
            ->where('tahun', (string) $tahun)
            ->where('status', 'aktif');

        $this->batasiTim($queryTim, $request, 'id');

        $timOptions = $queryTim
            ->orderBy('nama_tim')
            ->get(['id', 'nama_tim', 'tahun', 'ketua_id'])
            ->map(fn ($tim) => [
                'id' => $tim->id,
                'value' => $tim->id,
                'label' => $tim->nama_tim,
                'nama_tim' => $tim->nama_tim,
                'tahun' => $tim->tahun,
                'ketua_id' => $tim->ketua_id,
            ])
            ->all();

        return Inertia::render('Translok/Master/Index', [
            'giat' => $giat,
            'masterKegiatan' => $masterKegiatan,
            'timOptions' => $timOptions,
            'tahun' => $tahun,
            'tahunAktif' => $tahun,
            'canManage' => $this->bolehMengelola($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = $this->tahunAktif($request);
        $data = $this->validasiMasukan($request, $tahun);
        $namaKunci = 'simantu_translok_master_' . $tahun;

        $kunci = DB::selectOne(
            'SELECT GET_LOCK(?, 10) AS berhasil',
            [$namaKunci]
        );

        if ((int) ($kunci->berhasil ?? 0) !== 1) {
            throw ValidationException::withMessages([
                'translok' => 'Pembuatan kode translok sedang diproses. Silakan coba kembali.',
            ]);
        }

        try {
            DB::transaction(function () use ($request, $tahun, $data) {
                $maksimal = DB::table('tb_translok_master')
                    ->where('tahun', (string) $tahun)
                    ->whereRaw("kd_translok REGEXP '^[0-9]+$'")
                    ->selectRaw('MAX(CAST(kd_translok AS UNSIGNED)) AS maksimal')
                    ->value('maksimal');

                $kodeBaru = str_pad(
                    (string) (((int) $maksimal) + 1),
                    3,
                    '0',
                    STR_PAD_LEFT
                );

                DB::table('tb_translok_master')->insert([
                    'tahun' => (string) $tahun,
                    'tim_id' => $data['tim_id'],
                    'kegiatan_id' => $data['kegiatan_id'],
                    'kd_translok' => $kodeBaru,
                    'uraian' => $data['uraian'],
                    'vol_a' => $data['vol_a'],
                    'satuan' => $data['satuan'],
                    'rate' => $data['rate'],
                    'status' => $data['status'],
                    'created_by' => $request->user()->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }, 3);
        } finally {
            DB::selectOne(
                'SELECT RELEASE_LOCK(?) AS dilepas',
                [$namaKunci]
            );
        }

        return back()->with(
            'success',
            'Master translok berhasil ditambahkan.'
        );
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = $this->tahunAktif($request);

        DB::transaction(function () use ($request, $tahun, $id) {
            $master = DB::table('tb_translok_master')
                ->where('id', $id)
                ->where('tahun', (string) $tahun)
                ->lockForUpdate()
                ->first();

            abort_unless($master, 404);

            $this->pastikanAksesTim(
                $request,
                (int) $master->tim_id,
                $tahun
            );

            $data = $this->validasiMasukan(
                $request,
                $tahun,
                $master
            );

            $jumlahDialokasikan = (int) DB::table('tb_translok_alokasi')
                ->where('translok_master_id', $master->id)
                ->where('status', '!=', 'dibatalkan')
                ->sum('volume');

            if ($data['vol_a'] < $jumlahDialokasikan) {
                throw ValidationException::withMessages([
                    'vol_awal' => 'Volume tidak boleh lebih kecil dari jumlah volume yang sudah dialokasikan.',
                ]);
            }

            $memilikiAlokasi = DB::table('tb_translok_alokasi')
                ->where('translok_master_id', $master->id)
                ->exists();

            $timBerubah = (int) $master->tim_id !== (int) $data['tim_id'];

            $kegiatanBerubah = (int) $master->kegiatan_id !==
                (int) $data['kegiatan_id'];

            if ($memilikiAlokasi && ($timBerubah || $kegiatanBerubah)) {
                throw ValidationException::withMessages([
                    'kegiatan_id' => 'Tim dan kegiatan tidak dapat diubah karena master translok sudah memiliki alokasi.',
                ]);
            }

            $memilikiPersetujuan = DB::table('tb_translok_alokasi')
                ->where('translok_master_id', $master->id)
                ->whereIn('status', ['disetujui', 'selesai'])
                ->exists();

            $memilikiRealisasi = DB::table('tb_translok_detail as d')
                ->join(
                    'tb_translok_alokasi as a',
                    'a.id',
                    '=',
                    'd.translok_alokasi_id'
                )
                ->where('a.translok_master_id', $master->id)
                ->where('d.status', 'realisasi')
                ->exists();

            $rateBerubah = number_format((float) $master->rate, 2, '.', '') !==
                number_format((float) $data['rate'], 2, '.', '');

            $satuanBerubah = $master->satuan !== $data['satuan'];

            if (
                ($memilikiPersetujuan || $memilikiRealisasi)
                && ($rateBerubah || $satuanBerubah)
            ) {
                throw ValidationException::withMessages([
                    'rate' => 'Rate dan satuan tidak dapat diubah setelah terdapat persetujuan atau realisasi.',
                ]);
            }

            DB::table('tb_translok_master')
                ->where('id', $master->id)
                ->where('tahun', (string) $tahun)
                ->update([
                    'tim_id' => $data['tim_id'],
                    'kegiatan_id' => $data['kegiatan_id'],
                    'uraian' => $data['uraian'],
                    'vol_a' => $data['vol_a'],
                    'satuan' => $data['satuan'],
                    'rate' => $data['rate'],
                    'status' => $data['status'],
                    'updated_at' => now(),
                ]);
        }, 3);

        return back()->with(
            'success',
            'Master translok berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = $this->tahunAktif($request);

        try {
            DB::transaction(function () use ($request, $tahun, $id) {
                $master = DB::table('tb_translok_master')
                    ->where('id', $id)
                    ->where('tahun', (string) $tahun)
                    ->lockForUpdate()
                    ->first();

                abort_unless($master, 404);

                $this->pastikanAksesTim(
                    $request,
                    (int) $master->tim_id,
                    $tahun
                );

                $memilikiAlokasi = DB::table('tb_translok_alokasi')
                    ->where('translok_master_id', $master->id)
                    ->exists();

                if ($memilikiAlokasi) {
                    throw ValidationException::withMessages([
                        'translok' => 'Master translok tidak dapat dihapus karena sudah digunakan dalam alokasi.',
                    ]);
                }

                DB::table('tb_translok_master')
                    ->where('id', $master->id)
                    ->delete();
            }, 3);
        } catch (QueryException $exception) {
            if (in_array(
                (string) $exception->getCode(),
                ['23000', '23503'],
                true
            )) {
                return back()->withErrors([
                    'translok' => 'Master translok tidak dapat dihapus karena masih memiliki relasi data.',
                ]);
            }

            throw $exception;
        }

        return back()->with(
            'success',
            'Master translok berhasil dihapus.'
        );
    }

    private function tahunAktif(Request $request): int
    {
        $tahun = (int) $request->session()->get('tahun_aktif', 0);

        abort_unless(
            $tahun >= 2020 &&
            $tahun <= now('Asia/Jakarta')->year + 1,
            403,
            'Tahun anggaran tidak valid. Silakan login kembali.'
        );

        return $tahun;
    }

    private function bolehMengelola(Request $request): bool
    {
        return $request->user()->status === 'aktif'
            && in_array($request->user()->role, [
                'super_admin',
                'operator',
                'ketua_tim',
            ], true);
    }

    private function authorizeManage(Request $request): void
    {
        abort_unless($this->bolehMengelola($request), 403);
    }

    private function batasiTim(
        $query,
        Request $request,
        string $kolomTim
    ): void {
        $pengguna = $request->user();
        $tahun = $this->tahunAktif($request);

        if (in_array($pengguna->role, [
            'super_admin',
            'pimpinan',
            'operator',
        ], true)) {
            return;
        }

        if ($pengguna->role === 'ketua_tim') {
            $query->whereIn(
                $kolomTim,
                DB::table('tb_tim')
                    ->where('tahun', (string) $tahun)
                    ->where('ketua_id', $pengguna->id)
                    ->select('id')
            );

            return;
        }

        if ($pengguna->role === 'pegawai') {
            $query->whereIn(
                $kolomTim,
                DB::table('tb_anggota_tim as a')
                    ->join('tb_tim as t', 't.id', '=', 'a.tim_id')
                    ->where('t.tahun', (string) $tahun)
                    ->where('a.pegawai_id', $pengguna->id)
                    ->select('a.tim_id')
            );

            return;
        }

        $query->whereRaw('1 = 0');
    }

    private function pastikanAksesTim(
        Request $request,
        int $timId,
        int $tahun
    ): void {
        $tim = DB::table('tb_tim')
            ->where('id', $timId)
            ->where('tahun', (string) $tahun)
            ->first();

        if (!$tim) {
            throw ValidationException::withMessages([
                'tim_id' => 'Tim tidak tersedia pada tahun anggaran aktif.',
            ]);
        }

        if ($request->user()->role === 'ketua_tim') {
            abort_unless(
                (int) $tim->ketua_id === (int) $request->user()->id,
                403,
                'Anda tidak memiliki akses pada tim ini.'
            );
        }
    }

    private function validasiMasukan(
        Request $request,
        int $tahun,
        ?object $master = null
    ): array {
        $input = $request->all();

        if (
            !isset($input['vol_a']) ||
            $input['vol_a'] === ''
        ) {
            $input['vol_a'] = $input['vol_awal'] ?? null;
        }

        $data = Validator::make($input, [
            'tim_id' => [
                'nullable',
                'integer',
                Rule::exists('tb_tim', 'id'),
            ],
            'kegiatan_id' => [
                'nullable',
                'integer',
                Rule::exists('tb_kegiatan', 'id'),
            ],
            'uraian' => [
                'nullable',
                'string',
            ],
            'vol_a' => [
                'required',
                'integer',
                'min:1',
                'max:4294967295',
            ],
            'satuan' => [
                'required',
                'string',
                'max:30',
            ],
            'rate' => [
                'required',
                'numeric',
                'min:0',
                'max:9999999999999.99',
                'decimal:0,2',
            ],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'aktif', 'ditutup']),
            ],
        ])->validate();

        $kegiatanId = array_key_exists('kegiatan_id', $input)
            ? ($data['kegiatan_id'] ?? null)
            : ($master->kegiatan_id ?? null);

        $timId = array_key_exists('tim_id', $input)
            ? ($data['tim_id'] ?? null)
            : ($master->tim_id ?? null);

        $kegiatan = null;

        if ($kegiatanId !== null) {
            $kegiatan = DB::table('tb_kegiatan')
                ->where('id', $kegiatanId)
                ->where('tahun', (string) $tahun)
                ->where('is_active', true)
                ->first();

            if (!$kegiatan) {
                throw ValidationException::withMessages([
                    'kegiatan_id' => 'Kegiatan tidak tersedia pada tahun anggaran aktif.',
                ]);
            }

            if (
                $timId !== null &&
                (int) $timId !== (int) $kegiatan->tim_id
            ) {
                throw ValidationException::withMessages([
                    'tim_id' => 'Tim yang dipilih tidak sesuai dengan kegiatan.',
                ]);
            }

            $timId = $kegiatan->tim_id;
        }

        if ($timId === null) {
            throw ValidationException::withMessages([
                'tim_id' => 'Tim atau kegiatan wajib dipilih.',
            ]);
        }

        $tim = DB::table('tb_tim')
            ->where('id', $timId)
            ->where('tahun', (string) $tahun)
            ->where('status', 'aktif')
            ->first();

        if (!$tim) {
            throw ValidationException::withMessages([
                'tim_id' => 'Tim tidak tersedia atau tidak aktif.',
            ]);
        }

        $this->pastikanAksesTim(
            $request,
            (int) $timId,
            $tahun
        );

        $uraian = trim((string) ($data['uraian'] ?? ''));

        if ($uraian === '' && $master !== null) {
            $uraian = trim((string) $master->uraian);
        }

        if ($uraian === '' && $kegiatan !== null) {
            $uraian = trim((string) $kegiatan->ur_giat);
        }

        if ($uraian === '') {
            throw ValidationException::withMessages([
                'uraian' => 'Uraian translok wajib diisi.',
            ]);
        }

        if (
            (float) $data['vol_a'] *
            (float) $data['rate'] >= 10000000000000000
        ) {
            throw ValidationException::withMessages([
                'rate' => 'Pagu anggaran melebihi batas penyimpanan.',
            ]);
        }

        return [
            'tim_id' => (int) $timId,
            'kegiatan_id' => $kegiatanId === null
                ? null
                : (int) $kegiatanId,
            'uraian' => $uraian,
            'vol_a' => (int) $data['vol_a'],
            'satuan' => $data['satuan'],
            'rate' => $data['rate'],
            'status' => $data['status'] ?? ($master->status ?? 'draft'),
        ];
    }
}
