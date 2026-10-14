<?php

namespace App\Http\Controllers;

use App\Http\Requests\KegiatanRequest;
use App\Models\Kegiatan;
use App\Models\Tim;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class KegiatanController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_if($user->isMitra(), 403);

        $tahun = $this->resolveTahun($request);
        $timSaya = $this->timSaya($user, $tahun);

        $giats = Kegiatan::query()
            ->where('tahun', $tahun)
            ->orderBy('kd_tim')
            ->orderByRaw('CAST(kd_giat AS UNSIGNED)')
            ->get()
            ->map(fn (Kegiatan $giat) => [
                'id' => $giat->id,
                'tahun' => (int) $giat->tahun,
                'kd_tim' => $giat->kd_tim,
                'nm_tim' => $giat->nm_tim,
                'kd_giat' => $giat->kd_giat,
                'ur_giat' => $giat->ur_giat,
                'satuan' => $giat->satuan,
                'hr_satuan' => (float) $giat->hr_satuan,
                'is_active' => (bool) $giat->is_active,
                'bisa_kelola' => $this->bolehKelola($user, $tahun, $giat->kd_tim, $timSaya),
            ]);

        $timOptions = $this->timOptions($user, $tahun, $timSaya);

        $tahunList = collect([now()->year, $tahun])
            ->merge(Tim::query()->distinct()->pluck('tahun'))
            ->merge(Kegiatan::query()->distinct()->pluck('tahun'))
            ->filter()
            ->map(fn ($value) => (int) $value)
            ->unique()
            ->sortDesc()
            ->values();

        return Inertia::render('Kegiatan/Index', [
            'giats' => $giats,
            'tahun' => $tahun,
            'tahunList' => $tahunList,
            'timOptions' => $timOptions,
            'permissions' => [
                'canCreate' => $user->canManageKegiatan() && $timOptions->isNotEmpty(),
            ],
        ]);
    }

    public function store(KegiatanRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $tahun = (int) $data['tahun'];

        $this->izinkanKelola($user, $tahun, $data['kd_tim']);

        DB::transaction(function () use ($data, $tahun) {
            $tim = Tim::query()
                ->where('tahun', $tahun)
                ->where('kd_tim', $data['kd_tim'])
                ->lockForUpdate()
                ->firstOrFail();

            $kodeTerakhir = Kegiatan::query()
                ->where('tahun', $tahun)
                ->where('kd_tim', $data['kd_tim'])
                ->selectRaw('COALESCE(MAX(CAST(kd_giat AS UNSIGNED)), 0) AS kode_terakhir')
                ->value('kode_terakhir');

            $kodeBaru = str_pad(((int) $kodeTerakhir) + 1, 3, '0', STR_PAD_LEFT);

            Kegiatan::create([
                'tahun' => $tahun,
                'kd_tim' => $tim->kd_tim,
                'nm_tim' => $tim->nm_tim,
                'kd_giat' => $kodeBaru,
                'ur_giat' => trim($data['ur_giat']),
                'satuan' => trim($data['satuan']),
                'hr_satuan' => $data['hr_satuan'],
                'is_active' => $data['is_active'],
            ]);
        });

        return back()->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    public function update(KegiatanRequest $request, Kegiatan $giat): RedirectResponse
    {
        $this->izinkanKelola($request->user(), (int) $giat->tahun, $giat->kd_tim);

        $data = $request->validated();

        $giat->update([
            'satuan' => trim($data['satuan']),
            'hr_satuan' => $data['hr_satuan'],
            'is_active' => $data['is_active'],
        ]);

        return back()->with('success', 'Kegiatan berhasil diperbarui.');
    }

    public function destroy(Request $request, Kegiatan $giat): RedirectResponse
    {
        $this->izinkanKelola($request->user(), (int) $giat->tahun, $giat->kd_tim);

        if ($this->dipakaiRealisasi($giat)) {
            return back()->withErrors([
                'hapus' => 'Kegiatan tidak dapat dihapus karena sudah digunakan pada realisasi kinerja.',
            ]);
        }

        try {
            $giat->delete();
        } catch (QueryException $exception) {
            report($exception);

            return back()->withErrors([
                'hapus' => 'Kegiatan tidak dapat dihapus karena sudah digunakan pada modul lain.',
            ]);
        }

        return back()->with('success', 'Kegiatan berhasil dihapus.');
    }

    private function resolveTahun(Request $request): int
    {
        $tahun = (int) $request->query('tahun', session('tahun', now()->year));

        return $tahun >= 2020 && $tahun <= 2100 ? $tahun : now()->year;
    }

    private function timSaya(User $user, int $tahun)
    {
        if (! $user->nip_baru) {
            return collect();
        }

        return Tim::query()
            ->where('tahun', $tahun)
            ->where('nip_katim', $user->nip_baru)
            ->pluck('kd_tim');
    }

    private function timOptions(User $user, int $tahun, $timSaya)
    {
        if (! $user->canManageKegiatan()) {
            return collect();
        }

        $query = Tim::query()->where('tahun', $tahun)->orderBy('kd_tim');

        if ($user->isKetua()) {
            $query->whereIn('kd_tim', $timSaya);
        }

        return $query->get(['kd_tim', 'nm_tim'])->unique('kd_tim')->values();
    }

    private function bolehKelola(User $user, int $tahun, ?string $kdTim, $timSaya = null): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if (! $user->isKetua()) {
            return false;
        }

        $timSaya ??= $this->timSaya($user, $tahun);

        return $timSaya->contains($kdTim);
    }

    private function izinkanKelola(User $user, int $tahun, ?string $kdTim): void
    {
        abort_unless(
            $this->bolehKelola($user, $tahun, $kdTim),
            403,
            'Anda tidak berhak mengelola kegiatan tim ini.'
        );
    }

    private function dipakaiRealisasi(Kegiatan $giat): bool
    {
        if (! Schema::hasTable('kegiatan_petugas') || ! Schema::hasColumn('kegiatan_petugas', 'kegiatan_id')) {
            return false;
        }

        return DB::table('kegiatan_petugas')->where('kegiatan_id', $giat->id)->exists();
    }
}
