<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TranslokDetailController extends Controller
{
    public function index(Request $request): Response
    {
        $this->otorisasiLihat($request);

        $tahun = $this->tahunAktif($request);
        $bulan = (int) $request->input('bulan', now('Asia/Jakarta')->month);

        abort_unless($bulan >= 1 && $bulan <= 12, 422);

        [$awalBulan, $akhirBulan] = $this->batasBulan($tahun, $bulan);

        $queryAlokasi = DB::table('tb_translok_alokasi as a')
            ->join('tb_translok_master as m', 'm.id', '=', 'a.translok_master_id')
            ->join('users as p', 'p.id', '=', 'a.pegawai_id')
            ->join('tb_tim as t', 't.id', '=', 'm.tim_id')
            ->where('a.status', '!=', 'dibatalkan')
            ->where('m.tahun', (string) $tahun)
            ->whereBetween('a.tanggal_mulai', [$awalBulan, $akhirBulan])
            ->select([
                'a.id',
                'a.translok_master_id',
                'a.pegawai_id',
                'a.tanggal_mulai',
                'a.tanggal_selesai',
                'a.volume',
                'm.kd_translok',
                'm.uraian',
                'm.tim_id',
                't.nama_tim',
                'p.name as nama_pegawai',
                'p.nip',
            ]);

        if ($request->user()->role === 'pegawai') {
            $queryAlokasi->where('a.pegawai_id', $request->user()->id);
        } else {
            $this->batasiTim($queryAlokasi, $request, 'm.tim_id');
        }

        $alokasi = $queryAlokasi
            ->orderBy('a.tanggal_mulai')
            ->orderBy('p.name')
            ->get();

        $ids = $alokasi->pluck('id')->toArray();

        $details = [];
        if (!empty($ids)) {
            $details = DB::table('tb_translok_detail')
                ->whereIn('translok_alokasi_id', $ids)
                ->where('status', '!=', 'dibatalkan')
                ->orderBy('tanggal')
                ->get(['id', 'translok_alokasi_id', 'tanggal', 'catatan', 'status'])
                ->groupBy('translok_alokasi_id');
        }

        $items = $alokasi->map(function ($item) use ($details) {
            $rows = $details->get($item->id, collect());

            return [
                'id' => $item->id,
                'pegawai_id' => $item->pegawai_id,
                'nip' => $item->nip,
                'nama' => $item->nama_pegawai,
                'uraian' => $item->uraian ?: 'Translok',
                'kd_translok' => $item->kd_translok,
                'tim' => $item->nama_tim,
                'tanggal_mulai' => $item->tanggal_mulai,
                'tanggal_selesai' => $item->tanggal_selesai,
                'volume' => (int) $item->volume,
                'jumlah_detail' => $rows->count(),
                'details' => $rows->map(fn($detail) => [
                    'id' => $detail->id,
                    'tanggal' => $detail->tanggal,
                    'catatan' => $detail->catatan,
                    'status' => $detail->status,
                ])->values(),
            ];
        });

        return Inertia::render('Translok/Detail/Index', [
            'alokasi' => $items,
            'tahun' => $tahun,
            'bulan' => sprintf('%02d', $bulan),
            'canManage' => $this->bolehMengelola($request),
        ]);
    }

    public function availability(Request $request): JsonResponse
    {
        $this->otorisasiLihat($request);

        $data = $request->validate([
            'translok_alokasi_id' => ['required', 'integer'],
        ]);

        $tahun = $this->tahunAktif($request);
        $alokasi = $this->kunciAlokasi($request, $data['translok_alokasi_id'], $tahun, false);

        $first = max($alokasi->tanggal_mulai, now('Asia/Jakarta')->toDateString());
        $last = $alokasi->tanggal_selesai;
        $dates = [];

        if ($first <= $last) {
            $takenDates = DB::table('tb_translok_detail')
                ->where('translok_alokasi_id', $alokasi->id)
                ->where('status', '!=', 'dibatalkan')
                ->whereBetween('tanggal', [$first, $last])
                ->pluck('tanggal')
                ->flip();

            for ($day = Carbon::parse($first); $day->toDateString() <= $last; $day->addDay()) {
                $date = $day->toDateString();

                // Hari Sabtu dan Minggu tidak bisa dipilih
                if ($day->isWeekend()) {
                    continue;
                }

                $dates[] = [
                    'date' => $date,
                    'taken' => $takenDates->has($date),
                ];
            }
        }

        return response()->json([
            'dates' => $dates,
            'server_time' => now('Asia/Jakarta')->format('Y-m-d H:i:s'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->otorisasiKelola($request);

        $data = $request->validate([
            'translok_alokasi_id' => ['required', 'integer'],
            'tanggal' => ['required', 'date_format:Y-m-d'],
            'catatan' => ['nullable', 'string'],
        ]);

        $tahun = $this->tahunAktif($request);

        DB::transaction(function () use ($request, $data, $tahun) {
            $alokasi = $this->kunciAlokasi($request, $data['translok_alokasi_id'], $tahun, true);

            if ($alokasi->status !== 'draft') {
                throw ValidationException::withMessages([
                    'tanggal' => 'Alokasi ini tidak dapat ditambah detail karena statusnya bukan draft.',
                ]);
            }

            if ($data['tanggal'] < $alokasi->tanggal_mulai || $data['tanggal'] > $alokasi->tanggal_selesai) {
                throw ValidationException::withMessages([
                    'tanggal' => 'Tanggal berada di luar periode alokasi.',
                ]);
            }

            $day = Carbon::parse($data['tanggal']);
            if ($day->isWeekend()) {
                throw ValidationException::withMessages([
                    'tanggal' => 'Detail perjalanan tidak dapat dilakukan pada hari libur akhir pekan.',
                ]);
            }

            if ($day->isPast() && !$this->bolehKelolaHistoris($request)) {
                 throw ValidationException::withMessages([
                    'tanggal' => 'Pegawai tidak bisa merekam detail di tanggal yang sudah terlewat. Hubungi Ketua Tim atau Operator.',
                ]);
            }

            $detailHitung = DB::table('tb_translok_detail')
                ->where('translok_alokasi_id', $alokasi->id)
                ->where('status', '!=', 'dibatalkan')
                ->count();

            if ($detailHitung >= (int) $alokasi->volume) {
                throw ValidationException::withMessages([
                    'tanggal' => 'Kuota volume alokasi sudah habis.',
                ]);
            }

            $sudahAda = DB::table('tb_translok_detail')
                ->where('translok_alokasi_id', $alokasi->id)
                ->where('tanggal', $data['tanggal'])
                ->where('status', '!=', 'dibatalkan')
                ->exists();

            if ($sudahAda) {
                throw ValidationException::withMessages([
                    'tanggal' => 'Detail perjalanan pada tanggal ini sudah ada.',
                ]);
            }

            // Periksa jika pegawai punya perjalanan di master alokasi lain di hari yang sama
            $bentrok = DB::table('tb_translok_detail as d')
                ->join('tb_translok_alokasi as a', 'a.id', '=', 'd.translok_alokasi_id')
                ->where('a.pegawai_id', $alokasi->pegawai_id)
                ->where('d.tanggal', $data['tanggal'])
                ->where('d.status', '!=', 'dibatalkan')
                ->exists();

            if ($bentrok) {
                 throw ValidationException::withMessages([
                    'tanggal' => 'Pegawai sudah memiliki detail perjalanan di alokasi lain pada tanggal ini.',
                ]);
            }

            DB::table('tb_translok_detail')->insert([
                'translok_alokasi_id' => $alokasi->id,
                'tanggal' => $data['tanggal'],
                'status' => 'draft',
                'catatan' => $data['catatan'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, 3);

        return back()->with('success', 'Detail perjalanan berhasil ditambahkan.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $this->otorisasiKelola($request);
        $tahun = $this->tahunAktif($request);

        DB::transaction(function () use ($request, $id, $tahun) {
            $detail = DB::table('tb_translok_detail')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            abort_unless($detail, 404);

            if ($detail->status !== 'draft') {
                throw ValidationException::withMessages([
                    'detail' => 'Hanya detail dengan status draft yang dapat dibatalkan.',
                ]);
            }

            $alokasi = $this->kunciAlokasi($request, $detail->translok_alokasi_id, $tahun, true);

            $day = Carbon::parse($detail->tanggal);
            if ($day->isPast() && !$this->bolehKelolaHistoris($request)) {
                 throw ValidationException::withMessages([
                    'detail' => 'Detail yang sudah terlewat hanya bisa dibatalkan oleh Ketua Tim atau Operator.',
                ]);
            }

            DB::table('tb_translok_detail')
                ->where('id', $id)
                ->update([
                    'status' => 'dibatalkan',
                    'updated_at' => now()
                ]);
        }, 3);

        return back()->with('success', 'Detail perjalanan dibatalkan. Volume tersedia kembali.');
    }

    private function kunciAlokasi(Request $request, int $id, int $tahun, bool $lock): object
    {
        $query = DB::table('tb_translok_alokasi as a')
            ->join('tb_translok_master as m', 'm.id', '=', 'a.translok_master_id')
            ->where('a.id', $id)
            ->where('a.status', '!=', 'dibatalkan')
            ->where('m.tahun', (string) $tahun)
            ->select('a.*', 'm.tim_id');

        if ($lock) {
            $query->lockForUpdate();
        }

        $alokasi = $query->first();
        abort_unless($alokasi, 404);

        if ($request->user()->role === 'pegawai') {
            abort_unless($alokasi->pegawai_id === $request->user()->id, 403);
        } else {
            $this->pastikanAksesTim($request, $alokasi->tim_id, $tahun);
        }

        return $alokasi;
    }

    private function batasiTim($query, Request $request, string $kolom): void
    {
        $pengguna = $request->user();
        $tahun = $this->tahunAktif($request);

        if (in_array($pengguna->role, ['super_admin', 'pimpinan', 'operator'], true)) {
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

        // Ini tidak akan dipanggil untuk 'pegawai' karena sudah di handle di method index
        $query->where($kolom, 0);
    }

    private function pastikanAksesTim(Request $request, int $timId, int $tahun): void
    {
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

    private function batasBulan(int $tahun, int $bulan): array
    {
        $awal = Carbon::create($tahun, $bulan, 1, 0, 0, 0, 'Asia/Jakarta');
        return [
            $awal->toDateString(),
            $awal->copy()->endOfMonth()->toDateString(),
        ];
    }

    private function tahunAktif(Request $request): int
    {
        $tahun = (int) $request->session()->get('tahun_aktif', 0);
        abort_unless($tahun >= 2020 && $tahun <= now('Asia/Jakarta')->year + 1, 403);
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
        abort_unless($this->bolehMengelola($request), 403);
    }

    private function bolehMengelola(Request $request): bool
    {
        return $request->user()->status === 'aktif' &&
            in_array($request->user()->role, [
                'super_admin',
                'operator',
                'ketua_tim',
                'pegawai'
            ], true);
    }

    private function bolehKelolaHistoris(Request $request): bool
    {
         return in_array($request->user()->role, [
            'super_admin',
            'operator',
            'ketua_tim'
        ], true);
    }
}
