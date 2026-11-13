<?php

namespace App\Http\Controllers;

use App\Http\Requests\KegiatanRequest;
use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class KegiatanController extends Controller
{
    public function index(Request $request): Response
    {
        $pengguna = $request->user();
        $tahun = $this->tahunAktif($request);

        abort_if($pengguna->role === 'mitra', 403);

        $semuaTim = in_array($pengguna->role, [
            'super_admin',
            'pimpinan',
            'operator',
        ], true);

        $queryTim = DB::table('tb_tim')
            ->where('tahun', (string) $tahun)
            ->where('status', 'aktif');

        if ($pengguna->role === 'ketua_tim') {
            $queryTim->where('ketua_id', $pengguna->id);
        } elseif (! $semuaTim) {
            $queryTim->where(function ($query) use ($pengguna) {
                $query->where('ketua_id', $pengguna->id)
                    ->orWhereExists(function ($subquery) use ($pengguna) {
                        $subquery->selectRaw('1')
                            ->from('tb_anggota_tim')
                            ->whereColumn('tb_anggota_tim.tim_id', 'tb_tim.id')
                            ->where('tb_anggota_tim.pegawai_id', $pengguna->id);
                    });
            });
        }

        $daftarTim = $queryTim
            ->orderBy('nama_tim')
            ->get();

        $idTim = $daftarTim->pluck('id')->all();
        $namaTim = $daftarTim->pluck('nama_tim', 'id');

        $queryKegiatan = Kegiatan::query()
            ->tahun($tahun);

        if (! $semuaTim) {
            $queryKegiatan->whereIn('tim_id', $idTim);
        }

        $kegiatan = $queryKegiatan
            ->orderBy('kd_tim')
            ->orderBy('kd_giat')
            ->get()
            ->map(fn (Kegiatan $item) => [
                'id' => $item->id,
                'tahun' => $item->tahun,
                'tim_id' => $item->tim_id,
                'nama_tim' => $namaTim[$item->tim_id] ?? null,
                'kd_tim' => $item->kd_tim,
                'kd_giat' => $item->kd_giat,
                'ur_giat' => $item->ur_giat,
                'satuan' => $item->satuan,
                'hr_satuan' => $item->hr_satuan,
                'tanggal_mulai' => $item->tanggal_mulai?->format('Y-m-d'),
                'tanggal_selesai' => $item->tanggal_selesai?->format('Y-m-d'),
                'status' => $item->status,
                'is_active' => $item->is_active,
            ])
            ->values()
            ->all();

        $timOptions = $daftarTim
            ->map(fn ($tim) => [
                'id' => $tim->id,
                'value' => $tim->id,
                'label' => $tim->nama_tim,
                'nama_tim' => $tim->nama_tim,
                'kd_tim' => $this->kodeTim($tim),
                'tahun' => $tim->tahun,
            ])
            ->values()
            ->all();

        $bolehMengelola = in_array($pengguna->role, [
            'super_admin',
            'operator',
            'ketua_tim',
        ], true);

        return Inertia::render('Kegiatan/Index', [
            'giats' => $kegiatan,
            'timOptions' => $timOptions,
            'tahunOptions' => [$tahun],
            'tahunAktif' => $tahun,
            'filters' => [
                'tahun' => $tahun,
            ],
            'permissions' => [
                'canCreate' => $bolehMengelola && count($timOptions) > 0,
                'canUpdate' => $bolehMengelola,
                'canDelete' => $bolehMengelola,
            ],
        ]);
    }

    public function store(KegiatanRequest $request): RedirectResponse
    {
        $tahun = $this->tahunAktif($request);
        $pengguna = $request->user();
        $data = $request->validated();

        DB::transaction(function () use ($tahun, $pengguna, $data) {
            $tim = DB::table('tb_tim')
                ->where('id', $data['tim_id'])
                ->where('tahun', (string) $tahun)
                ->where('status', 'aktif')
                ->lockForUpdate()
                ->first();

            if (! $tim) {
                throw ValidationException::withMessages([
                    'tim_id' => 'Tim tidak ditemukan pada tahun anggaran aktif.',
                ]);
            }

            $this->pastikanBolehMengelola($pengguna, $tim);

            $kodeTim = $this->kodeTim($tim);
            $kodeKegiatan = $this->kodeKegiatanBaru($tahun, $kodeTim);

            $this->validasiPeriode(
                $data['tanggal_mulai'] ?? null,
                $data['tanggal_selesai'] ?? null
            );

            Kegiatan::create([
                'tahun' => (string) $tahun,
                'tim_id' => $tim->id,
                'kd_tim' => $kodeTim,
                'kd_giat' => $kodeKegiatan,
                'ur_giat' => $data['ur_giat'],
                'satuan' => $data['satuan'] ?? null,
                'hr_satuan' => $data['hr_satuan'] ?? 0,
                'tanggal_mulai' => $data['tanggal_mulai'] ?? null,
                'tanggal_selesai' => $data['tanggal_selesai'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'is_active' => $data['is_active'] ?? true,
                'created_by' => $pengguna->id,
            ]);
        }, 3);

        return back()->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    public function update(
        KegiatanRequest $request,
        Kegiatan $kegiatan
    ): RedirectResponse {
        $tahun = $this->tahunAktif($request);
        $pengguna = $request->user();
        $data = $request->validated();

        DB::transaction(function () use ($tahun, $pengguna, $data, $kegiatan) {
            $item = Kegiatan::query()
                ->whereKey($kegiatan->id)
                ->tahun($tahun)
                ->lockForUpdate()
                ->firstOrFail();

            $timLama = DB::table('tb_tim')
                ->where('id', $item->tim_id)
                ->first();

            abort_unless($timLama, 404);

            $this->pastikanBolehMengelola($pengguna, $timLama);

            $idTimBaru = (int) ($data['tim_id'] ?? $item->tim_id);

            if ($idTimBaru !== (int) $item->tim_id) {
                if ($this->memilikiRelasi($item->id)) {
                    throw ValidationException::withMessages([
                        'tim_id' => 'Tim tidak dapat diubah karena kegiatan sudah digunakan.',
                    ]);
                }

                $timBaru = DB::table('tb_tim')
                    ->where('id', $idTimBaru)
                    ->where('tahun', (string) $tahun)
                    ->where('status', 'aktif')
                    ->lockForUpdate()
                    ->first();

                if (! $timBaru) {
                    throw ValidationException::withMessages([
                        'tim_id' => 'Tim tujuan tidak tersedia.',
                    ]);
                }

                $this->pastikanBolehMengelola($pengguna, $timBaru);

                $kodeTim = $this->kodeTim($timBaru);

                $data['tim_id'] = $timBaru->id;
                $data['kd_tim'] = $kodeTim;
                $data['kd_giat'] = $this->kodeKegiatanBaru(
                    $tahun,
                    $kodeTim
                );
            } else {
                unset($data['tim_id']);
            }

            $tanggalMulai = array_key_exists('tanggal_mulai', $data)
                ? $data['tanggal_mulai']
                : $item->tanggal_mulai?->format('Y-m-d');

            $tanggalSelesai = array_key_exists('tanggal_selesai', $data)
                ? $data['tanggal_selesai']
                : $item->tanggal_selesai?->format('Y-m-d');

            $this->validasiPeriode(
                $tanggalMulai,
                $tanggalSelesai
            );

            $item->fill($data);
            $item->save();
        }, 3);

        return back()->with('success', 'Kegiatan berhasil diperbarui.');
    }

    public function destroy(
        Request $request,
        Kegiatan $kegiatan
    ): RedirectResponse {
        $tahun = $this->tahunAktif($request);
        $pengguna = $request->user();

        DB::transaction(function () use ($tahun, $pengguna, $kegiatan) {
            $item = Kegiatan::query()
                ->whereKey($kegiatan->id)
                ->tahun($tahun)
                ->lockForUpdate()
                ->firstOrFail();

            $tim = DB::table('tb_tim')
                ->where('id', $item->tim_id)
                ->first();

            abort_unless($tim, 404);

            $this->pastikanBolehMengelola($pengguna, $tim);

            if ($this->memilikiRelasi($item->id)) {
                throw ValidationException::withMessages([
                    'hapus' => 'Kegiatan tidak dapat dihapus karena sudah memiliki data petugas atau translok.',
                ]);
            }

            $item->delete();
        }, 3);

        return back()->with('success', 'Kegiatan berhasil dihapus.');
    }

    private function tahunAktif(Request $request): int
    {
        $tahun = (int) $request->session()->get('tahun_aktif', 0);
        $tahunMaksimal = now('Asia/Jakarta')->year + 1;

        abort_unless(
            $tahun >= 2020 && $tahun <= $tahunMaksimal,
            403,
            'Tahun anggaran tidak valid. Silakan login kembali.'
        );

        return $tahun;
    }

    private function pastikanBolehMengelola(
        User $pengguna,
        object $tim
    ): void {
        if (in_array($pengguna->role, [
            'super_admin',
            'operator',
        ], true)) {
            return;
        }

        abort_unless(
            $pengguna->role === 'ketua_tim'
            && (int) $tim->ketua_id === (int) $pengguna->id,
            403,
            'Anda tidak memiliki akses mengelola kegiatan tim ini.'
        );
    }

    private function kodeTim(object $tim): string
    {
        $kode = trim((string) ($tim->kd_tim ?? ''));

        return $kode !== ''
            ? $kode
            : str_pad((string) $tim->id, 3, '0', STR_PAD_LEFT);
    }

    private function kodeKegiatanBaru(
        int $tahun,
        string $kodeTim
    ): string {
        $kodeTerakhir = Kegiatan::query()
            ->tahun($tahun)
            ->where('kd_tim', $kodeTim)
            ->lockForUpdate()
            ->pluck('kd_giat')
            ->filter(fn ($kode) => ctype_digit((string) $kode))
            ->map(fn ($kode) => (int) $kode)
            ->max();

        return str_pad(
            (string) (($kodeTerakhir ?? 0) + 1),
            3,
            '0',
            STR_PAD_LEFT
        );
    }

    private function validasiPeriode(
        ?string $tanggalMulai,
        ?string $tanggalSelesai
    ): void {
        if (
            $tanggalMulai !== null
            && $tanggalSelesai !== null
            && $tanggalMulai > $tanggalSelesai
        ) {
            throw ValidationException::withMessages([
                'tanggal_selesai' => 'Tanggal selesai tidak boleh mendahului tanggal mulai.',
            ]);
        }
    }

    private function memilikiRelasi(int $kegiatanId): bool
    {
        return DB::table('tb_kegiatan_petugas')
            ->where('kegiatan_id', $kegiatanId)
            ->exists()
            || DB::table('tb_translok_master')
                ->where('kegiatan_id', $kegiatanId)
                ->exists()
            || DB::table('tb_translok_alokasi')
                ->where('kegiatan_id', $kegiatanId)
                ->exists();
    }
}
