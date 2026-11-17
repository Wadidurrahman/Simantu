<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TranslokAlokasiController extends Controller
{
    public function index(Request $request): Response
    {
        $this->otorisasiLihat($request);

        $tahun = $this->tahunAktif($request);
        $bulan = (int) $request->input('bulan', now('Asia/Jakarta')->month);

        abort_unless($bulan >= 1 && $bulan <= 12, 422);

        [$awalBulan, $akhirBulan] = $this->batasBulan($tahun, $bulan);

        $jumlahDetail = DB::table('tb_translok_detail')
            ->where('status', '!=', 'dibatalkan')
            ->select('translok_alokasi_id')
            ->selectRaw('COUNT(*) AS jumlah_detail')
            ->groupBy('translok_alokasi_id');

        $queryAlokasi = DB::table('tb_translok_alokasi as a')
            ->join('tb_translok_master as m', 'm.id', '=', 'a.translok_master_id')
            ->join('users as p', 'p.id', '=', 'a.pegawai_id')
            ->join('tb_tim as t', 't.id', '=', 'm.tim_id')
            ->leftJoin('users as penginput', 'penginput.id', '=', 'a.dialokasikan_oleh')
            ->leftJoinSub($jumlahDetail, 'd', function ($join) {
                $join->on('d.translok_alokasi_id', '=', 'a.id');
            })
            ->where('m.tahun', (string) $tahun)
            ->whereBetween('a.tanggal_mulai', [$awalBulan, $akhirBulan])
            ->select([
                'a.*',
                'm.tahun',
                'm.kd_translok',
                'm.uraian',
                'm.satuan',
                'm.rate',
                'm.tim_id',
                't.nama_tim',
                'p.name as nama_pegawai',
                'p.nip',
                'penginput.username as penginput',
                'd.jumlah_detail',
            ]);

        if ($request->user()->role === 'pegawai') {
            $queryAlokasi->where('a.pegawai_id', $request->user()->id);
        } else {
            $this->batasiTim($queryAlokasi, $request, 'm.tim_id');
        }

        $alokasi = $queryAlokasi
            ->orderBy('a.tanggal_mulai')
            ->orderBy('p.name')
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'translok_master_id' => $item->translok_master_id,
                'pegawai_id' => $item->pegawai_id,
                'nip' => $item->nip,
                'nama' => $item->nama_pegawai,
                'uraian' => $item->uraian,
                'kd_translok' => $item->kd_translok,
                'tim' => $item->nama_tim,
                'tanggal_mulai' => $item->tanggal_mulai,
                'tanggal_selesai' => $item->tanggal_selesai,
                'volume' => (int) $item->volume,
                'status' => $item->status,
                'catatan' => $item->catatan,
                'jumlah_detail' => (int) ($item->jumlah_detail ?? 0),
                'penginput' => $item->penginput,
            ])
            ->all();

        $volumeTerpakai = DB::table('tb_translok_alokasi')
            ->where('status', '!=', 'dibatalkan')
            ->select('translok_master_id')
            ->selectRaw('SUM(volume) AS teralokasi')
            ->groupBy('translok_master_id');

        $queryMaster = DB::table('tb_translok_master as m')
            ->join('tb_tim as t', 't.id', '=', 'm.tim_id')
            ->leftJoinSub($volumeTerpakai, 'v', function ($join) {
                $join->on('v.translok_master_id', '=', 'm.id');
            })
            ->where('m.tahun', (string) $tahun)
            ->select('m.*', 't.nama_tim', 'v.teralokasi');

        if ($request->user()->role === 'pegawai') {
            $queryMaster->whereIn(
                'm.id',
                DB::table('tb_translok_alokasi')
                    ->where('pegawai_id', $request->user()->id)
                    ->select('translok_master_id')
            );
        } else {
            $this->batasiTim($queryMaster, $request, 'm.tim_id');
        }

        $masters = $queryMaster
            ->orderBy('m.kd_translok')
            ->get()
            ->map(function ($item) {
                $teralokasi = (int) ($item->teralokasi ?? 0);
                return [
                    'id' => $item->id,
                    'kd_translok' => $item->kd_translok,
                    'uraian' => $item->uraian,
                    'tim' => $item->nama_tim,
                    'tim_id' => $item->tim_id,
                    'satuan' => $item->satuan,
                    'vol_a' => (int) $item->vol_a,
                    'volume_teralokasi' => $teralokasi,
                    'sisa_volume' => (int) $item->vol_a - $teralokasi,
                    'rate' => (float) $item->rate,
                    'status' => $item->status,
                ];
            })
            ->all();

        $queryPegawai = DB::table('users')
            ->where('status', 'aktif')
            ->where('role', '!=', 'mitra');

        if ($request->user()->role === 'ketua_tim') {
            $queryPegawai->where(function ($query) use ($request, $tahun) {
                $query->where('id', $request->user()->id)
                    ->orWhereIn(
                        'id',
                        DB::table('tb_anggota_tim as a')
                            ->join('tb_tim as t', 't.id', '=', 'a.tim_id')
                            ->where('t.tahun', (string) $tahun)
                            ->where('t.ketua_id', $request->user()->id)
                            ->select('a.pegawai_id')
                    );
            });
        }

        if ($request->user()->role === 'pegawai') {
            $queryPegawai->where('id', $request->user()->id);
        }

        $pegawai = $queryPegawai
            ->orderBy('name')
            ->get(['id', 'nip', 'name', 'role'])
            ->map(fn ($item) => [
                'id' => $item->id,
                'nip' => $item->nip,
                'name' => $item->name,
                'role' => $item->role,
            ])
            ->all();

        return Inertia::render('Translok/Alokasi/Index', [
            'alokasi' => $alokasi,
            'masters' => $masters,
            'pegawai' => $pegawai,
            'tahun' => $tahun,
            'bulan' => sprintf('%02d', $bulan),
            'canManage' => $this->bolehMengelola($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->otorisasiKelola($request);

        $tahun = $this->tahunAktif($request);
        $data = $this->validasiMasukan($request, $tahun);

        DB::transaction(function () use ($request, $tahun, $data) {
            $master = $this->kunciMaster(
                $data['translok_master_id'],
                $tahun
            );

            $this->pastikanAksesTim(
                $request,
                $master->tim_id,
                $tahun
            );

            $this->pastikanKegiatanMaster($master, $tahun);

            if ($master->status === 'ditutup') {
                throw ValidationException::withMessages([
                    'translok_master_id' => 'Master translok sudah ditutup.',
                ]);
            }

            $this->kunciPegawai($data['pegawai_id']);

            [$awalBulan, $akhirBulan] = $this->batasBulan(
                $tahun,
                $data['bulan']
            );

            $sudahAda = DB::table('tb_translok_alokasi')
                ->where('translok_master_id', $master->id)
                ->where('pegawai_id', $data['pegawai_id'])
                ->where('status', '!=', 'dibatalkan')
                ->whereBetween('tanggal_mulai', [
                    $awalBulan,
                    $akhirBulan,
                ])
                ->exists();

            if ($sudahAda) {
                throw ValidationException::withMessages([
                    'translok_master_id' => 'Pegawai sudah memiliki alokasi master ini pada bulan yang sama.',
                ]);
            }

            $this->periksaKapasitas(
                $master,
                $data,
                $tahun
            );

            $id = DB::table('tb_translok_alokasi')->insertGetId([
                'translok_master_id' => $master->id,
                'kegiatan_id' => $master->kegiatan_id,
                'pegawai_id' => $data['pegawai_id'],
                'dialokasikan_oleh' => $request->user()->id,
                'tanggal_mulai' => $data['tanggal_mulai'],
                'tanggal_selesai' => $data['tanggal_selesai'],
                'volume' => $data['volume'],
                'status' => 'draft',
                'catatan' => $data['catatan'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sesudah = DB::table('tb_translok_alokasi')->find($id);

            $this->catatRiwayat(
                $id,
                $request->user()->id,
                'buat',
                null,
                $sesudah
            );
        }, 3);

        return back()->with(
            'success',
            'Alokasi translok berhasil ditambahkan.'
        );
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $this->otorisasiKelola($request);

        $tahun = $this->tahunAktif($request);

        DB::transaction(function () use ($request, $tahun, $id) {
            $awal = DB::table('tb_translok_alokasi as a')
                ->join('tb_translok_master as m', 'm.id', '=', 'a.translok_master_id')
                ->where('a.id', $id)
                ->where('m.tahun', (string) $tahun)
                ->select('a.translok_master_id', 'a.pegawai_id')
                ->first();

            abort_unless($awal, 404);

            $master = $this->kunciMaster(
                $awal->translok_master_id,
                $tahun
            );

            $this->pastikanAksesTim(
                $request,
                $master->tim_id,
                $tahun
            );

            $this->kunciPegawai($awal->pegawai_id, false);

            $alokasi = DB::table('tb_translok_alokasi')
                ->where('id', $id)
                ->where('translok_master_id', $master->id)
                ->lockForUpdate()
                ->first();

            abort_unless($alokasi, 404);

            if ($alokasi->status !== 'draft') {
                throw ValidationException::withMessages([
                    'alokasi' => 'Hanya alokasi draft yang dapat diperbarui.',
                ]);
            }

            if ($master->status === 'ditutup') {
                throw ValidationException::withMessages([
                    'alokasi' => 'Master translok sudah ditutup.',
                ]);
            }

            $data = $this->validasiMasukan(
                $request,
                $tahun,
                $alokasi
            );

            $bulanLama = (int) substr(
                $alokasi->tanggal_mulai,
                5,
                2
            );

            if ($data['bulan'] !== $bulanLama) {
                throw ValidationException::withMessages([
                    'tanggal_mulai' => 'Bulan alokasi tidak dapat diubah.',
                ]);
            }

            $detail = DB::table('tb_translok_detail')
                ->where('translok_alokasi_id', $id)
                ->where('status', '!=', 'dibatalkan');

            $jumlahDetail = (clone $detail)->count();

            if ($data['volume'] < $jumlahDetail) {
                throw ValidationException::withMessages([
                    'volume' => 'Volume tidak boleh lebih kecil dari jumlah detail perjalanan yang ada.',
                ]);
            }

            $diLuarPeriode = (clone $detail)
                ->where(function ($query) use ($data) {
                    $query
                        ->where('tanggal', '<', $data['tanggal_mulai'])
                        ->orWhere('tanggal', '>', $data['tanggal_selesai']);
                })
                ->exists();

            if ($diLuarPeriode) {
                throw ValidationException::withMessages([
                    'tanggal_mulai' => 'Periode tidak boleh mengeluarkan tanggal perjalanan yang sudah tercatat.',
                ]);
            }

            $this->periksaKapasitas(
                $master,
                $data,
                $tahun,
                $id
            );

            DB::table('tb_translok_alokasi')
                ->where('id', $id)
                ->update([
                    'tanggal_mulai' => $data['tanggal_mulai'],
                    'tanggal_selesai' => $data['tanggal_selesai'],
                    'volume' => $data['volume'],
                    'catatan' => $data['catatan'],
                    'updated_at' => now(),
                ]);

            $sesudah = DB::table('tb_translok_alokasi')->find($id);

            $this->catatRiwayat(
                $id,
                $request->user()->id,
                'ubah',
                $alokasi,
                $sesudah
            );
        }, 3);

        return back()->with(
            'success',
            'Alokasi translok berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $this->otorisasiKelola($request);

        $tahun = $this->tahunAktif($request);

        DB::transaction(function () use ($request, $tahun, $id) {
            $awal = DB::table('tb_translok_alokasi as a')
                ->join('tb_translok_master as m', 'm.id', '=', 'a.translok_master_id')
                ->where('a.id', $id)
                ->where('m.tahun', (string) $tahun)
                ->select('a.translok_master_id', 'a.pegawai_id')
                ->first();

            abort_unless($awal, 404);

            $master = $this->kunciMaster(
                $awal->translok_master_id,
                $tahun
            );

            $this->pastikanAksesTim(
                $request,
                $master->tim_id,
                $tahun
            );

            $this->kunciPegawai($awal->pegawai_id, false);

            $alokasi = DB::table('tb_translok_alokasi')
                ->where('id', $id)
                ->where('translok_master_id', $master->id)
                ->lockForUpdate()
                ->first();

            abort_unless($alokasi, 404);

            if ($alokasi->status !== 'draft') {
                throw ValidationException::withMessages([
                    'alokasi' => 'Hanya alokasi draft yang dapat dibatalkan.',
                ]);
            }

            $memilikiDetail = DB::table('tb_translok_detail')
                ->where('translok_alokasi_id', $id)
                ->where('status', '!=', 'dibatalkan')
                ->exists();

            if ($memilikiDetail) {
                throw ValidationException::withMessages([
                    'alokasi' => 'Batalkan detail perjalanan terlebih dahulu.',
                ]);
            }

            DB::table('tb_translok_alokasi')
                ->where('id', $id)
                ->update([
                    'status' => 'dibatalkan',
                    'updated_at' => now(),
                ]);

            $sesudah = DB::table('tb_translok_alokasi')->find($id);

            $this->catatRiwayat(
                $id,
                $request->user()->id,
                'batalkan',
                $alokasi,
                $sesudah
            );
        }, 3);

        return back()->with(
            'success',
            'Alokasi translok berhasil dibatalkan.'
        );
    }

    private function validasiMasukan(
        Request $request,
        int $tahun,
        ?object $alokasi = null
    ): array {
        $input = [
            'translok_master_id' => $request->input('translok_master_id'),
            'pegawai_id' => $request->input('pegawai_id'),
            'tanggal_mulai' => $request->input('tanggal_mulai'),
            'tanggal_selesai' => $request->input('tanggal_selesai'),
            'volume' => $request->input('volume'),
            'bulan' => $request->input('bulan'),
            'catatan' => $request->input('catatan', $alokasi?->catatan),
        ];

        $aturan = [
            'tanggal_mulai' => [
                'required',
                'date_format:Y-m-d',
            ],
            'tanggal_selesai' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:tanggal_mulai',
            ],
            'volume' => [
                'required',
                'integer',
                'min:1',
                'max:4294967295',
            ],
            'catatan' => [
                'nullable',
                'string',
            ],
            'bulan' => [
                'nullable',
                'integer',
                'between:1,12',
            ],
        ];

        if ($alokasi === null) {
            $aturan['translok_master_id'] = [
                'required',
                'integer',
                Rule::exists('tb_translok_master', 'id')
                    ->where('tahun', (string) $tahun),
            ];

            $aturan['pegawai_id'] = [
                'required',
                'integer',
                Rule::exists('users', 'id'),
            ];
        }

        $data = Validator::make($input, $aturan)->validate();

        $awal = $data['tanggal_mulai'];
        $akhir = $data['tanggal_selesai'];
        $bulan = (int) substr($awal, 5, 2);

        if (
            substr($awal, 0, 4) !== (string) $tahun ||
            substr($akhir, 0, 4) !== (string) $tahun ||
            substr($akhir, 5, 2) !== substr($awal, 5, 2) ||
            (isset($data['bulan']) && (int) $data['bulan'] !== $bulan)
        ) {
            throw ValidationException::withMessages([
                'tanggal_mulai' => 'Periode harus berada dalam bulan dan tahun anggaran yang dipilih.',
            ]);
        }

        return [
            'translok_master_id' => $alokasi?->translok_master_id
                ?? (int) $data['translok_master_id'],
            'pegawai_id' => $alokasi?->pegawai_id
                ?? (int) $data['pegawai_id'],
            'tanggal_mulai' => $awal,
            'tanggal_selesai' => $akhir,
            'volume' => (int) $data['volume'],
            'bulan' => $bulan,
            'catatan' => $data['catatan'] ?? null,
        ];
    }

    private function periksaKapasitas(
        object $master,
        array $data,
        int $tahun,
        ?int $kecualiId = null
    ): void {
        [$awalBulan, $akhirBulan] = $this->batasBulan(
            $tahun,
            $data['bulan']
        );

        $queryPegawai = DB::table('tb_translok_alokasi')
            ->where('pegawai_id', $data['pegawai_id'])
            ->where('status', '!=', 'dibatalkan')
            ->whereBetween('tanggal_mulai', [
                $awalBulan,
                $akhirBulan,
            ]);

        $queryMaster = DB::table('tb_translok_alokasi')
            ->where('translok_master_id', $master->id)
            ->where('status', '!=', 'dibatalkan');

        if ($kecualiId !== null) {
            $queryPegawai->where('id', '!=', $kecualiId);
            $queryMaster->where('id', '!=', $kecualiId);
        }

        if ((int) $queryPegawai->sum('volume') + $data['volume'] > 16) {
            throw ValidationException::withMessages([
                'volume' => 'Total volume pegawai maksimal 16 dalam satu bulan.',
            ]);
        }

        if ((int) $queryMaster->sum('volume') + $data['volume'] > (int) $master->vol_a) {
            throw ValidationException::withMessages([
                'volume' => 'Sisa volume master translok tidak mencukupi.',
            ]);
        }
    }

    private function kunciMaster(int $id, int $tahun): object
    {
        $master = DB::table('tb_translok_master')
            ->where('id', $id)
            ->where('tahun', (string) $tahun)
            ->lockForUpdate()
            ->first();

        abort_unless($master, 404);

        return $master;
    }

    private function kunciPegawai(
        int $id,
        bool $wajibAktif = true
    ): void {
        $pegawai = DB::table('users')
            ->where('id', $id)
            ->lockForUpdate()
            ->first();

        if (
            !$pegawai ||
            (
                $wajibAktif &&
                (
                    $pegawai->status !== 'aktif' ||
                    $pegawai->role === 'mitra'
                )
            )
        ) {
            throw ValidationException::withMessages([
                'pegawai_id' => 'Pegawai tidak ditemukan, tidak aktif, atau bukan pegawai internal.',
            ]);
        }
    }

    private function pastikanKegiatanMaster(
        object $master,
        int $tahun
    ): void {
        $valid = $master->kegiatan_id !== null &&
            DB::table('tb_kegiatan')
                ->where('id', $master->kegiatan_id)
                ->where('tim_id', $master->tim_id)
                ->where('tahun', (string) $tahun)
                ->where('is_active', true)
                ->exists();

        if (!$valid) {
            throw ValidationException::withMessages([
                'translok_master_id' => 'Master translok harus memiliki kegiatan aktif pada tim dan tahun yang sama.',
            ]);
        }
    }

    private function batasiTim(
        $query,
        Request $request,
        string $kolom
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
                $kolom,
                DB::table('tb_tim')
                    ->where('tahun', (string) $tahun)
                    ->where('ketua_id', $pengguna->id)
                    ->select('id')
            );

            return;
        }

        $query->whereIn(
            $kolom,
            DB::table('tb_anggota_tim as a')
                ->join('tb_tim as t', 't.id', '=', 'a.tim_id')
                ->where('t.tahun', (string) $tahun)
                ->where('a.pegawai_id', $pengguna->id)
                ->select('a.tim_id')
        );
    }

    private function pastikanAksesTim(
        Request $request,
        int $timId,
        int $tahun
    ): void {
        if ($request->user()->role !== 'ketua_tim') {
            return;
        }

        abort_unless(
            DB::table('tb_tim')
                ->where('id', $timId)
                ->where('tahun', (string) $tahun)
                ->where('ketua_id', $request->user()->id)
                ->exists(),
            403
        );
    }

    private function catatRiwayat(
        int $id,
        int $aktorId,
        string $aksi,
        ?object $sebelum,
        ?object $sesudah
    ): void {
        DB::table('tb_translok_riwayat')->insert([
            'translok_alokasi_id' => $id,
            'aktor_id' => $aktorId,
            'aksi' => $aksi,
            'data_sebelum' => $sebelum === null
                ? null
                : json_encode($sebelum, JSON_UNESCAPED_UNICODE),
            'data_sesudah' => $sesudah === null
                ? null
                : json_encode($sesudah, JSON_UNESCAPED_UNICODE),
            'created_at' => now(),
        ]);
    }

    private function batasBulan(int $tahun, int $bulan): array
    {
        $awal = Carbon::create(
            $tahun,
            $bulan,
            1,
            0,
            0,
            0,
            'Asia/Jakarta'
        );

        return [
            $awal->toDateString(),
            $awal->copy()->endOfMonth()->toDateString(),
        ];
    }

    private function tahunAktif(Request $request): int
    {
        $tahun = (int) $request->session()->get(
            'tahun_aktif',
            0
        );

        abort_unless(
            $tahun >= 2020 &&
            $tahun <= now('Asia/Jakarta')->year + 1,
            403
        );

        return $tahun;
    }

    private function otorisasiLihat(Request $request): void
    {
        abort_unless(
            $request->user()->status === 'aktif' &&
            $request->user()->role !== 'mitra',
            403
        );
    }

    private function otorisasiKelola(Request $request): void
    {
        abort_unless(
            $this->bolehMengelola($request),
            403
        );
    }

    private function bolehMengelola(Request $request): bool
    {
        return $request->user()->status === 'aktif' &&
            in_array($request->user()->role, [
                'super_admin',
                'operator',
                'ketua_tim',
            ], true);
    }
}
