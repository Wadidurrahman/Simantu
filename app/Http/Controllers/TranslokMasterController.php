<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\TranslokMaster;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TranslokMasterController extends Controller
{
    public function index(Request $request): Response
    {
        abort_if($request->user()->role === 'mitra', 403);

        $tahun = (int) session('tahun', now()->year);

        $giat = TranslokMaster::query()
            ->with('kegiatan')
            ->where('tahun', $tahun)
            ->orderBy('kd_translok')
            ->get();

        $masterKegiatan = Kegiatan::query()
            ->where('tahun', $tahun)
            ->where('is_active', true)
            ->orderBy('kd_tim')
            ->orderBy('kd_giat')
            ->get();

        return Inertia::render('Translok/Master/Index', [
            'giat' => $giat,
            'masterKegiatan' => $masterKegiatan,
            'tahun' => $tahun,
            'canManage' => in_array($request->user()->role, ['admin', 'ketua'], true),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = (int) session('tahun', now()->year);
        $validated = $this->validateInput($request, $tahun);

        DB::transaction(function () use ($validated, $tahun) {
            $maxKd = TranslokMaster::query()
                ->where('tahun', $tahun)
                ->lockForUpdate()
                ->orderByDesc('kd_translok')
                ->value('kd_translok');

            $newKd = str_pad(
                ((int) $maxKd) + 1,
                3,
                '0',
                STR_PAD_LEFT
            );

            $volume = (int) $validated['vol_awal'];
            $rate = $validated['rate'];
            $anggaran = $this->calculateAmount($volume, $rate);

            TranslokMaster::create([
                'tahun' => $tahun,
                'kd_translok' => $newKd,
                'kegiatan_id' => $validated['kegiatan_id'],
                'vol_awal' => $volume,
                'satuan' => $validated['satuan'],
                'rate' => $rate,
                'jml_anggaran' => $anggaran,
                'realisasi_vol' => 0,
                'sisa_vol' => $volume,
                'sisa_anggaran' => $anggaran,
            ]);
        });

        return back()->with('success', 'Master Translok berhasil ditambahkan.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = (int) session('tahun', now()->year);
        $validated = $this->validateInput($request, $tahun);

        DB::transaction(function () use ($validated, $tahun, $id) {
            $translok = $this->tahunQuery($tahun)
                ->lockForUpdate()
                ->findOrFail($id);

            $volume = (int) $validated['vol_awal'];
            $realisasi = (int) $translok->realisasi_vol;
            $rate = $validated['rate'];

            if ($volume < $realisasi) {
                throw ValidationException::withMessages([
                    'vol_awal' => 'Volume awal tidak boleh lebih kecil dari realisasi.',
                ]);
            }

            if (
                $realisasi > 0 &&
                (int) $translok->kegiatan_id !== (int) $validated['kegiatan_id']
            ) {
                throw ValidationException::withMessages([
                    'kegiatan_id' => 'Kegiatan tidak dapat diubah karena sudah memiliki realisasi.',
                ]);
            }

            if (
                $realisasi > 0 &&
                (
                    (string) $translok->rate !== (string) number_format((float) $rate, 2, '.', '')
                    || (string) $translok->satuan !== (string) $validated['satuan']
                )
            ) {
                throw ValidationException::withMessages([
                    'rate' => 'Rate dan satuan tidak dapat diubah karena sudah memiliki realisasi.',
                ]);
            }

            $sisaVolume = $volume - $realisasi;

            $translok->update([
                'kegiatan_id' => $validated['kegiatan_id'],
                'vol_awal' => $volume,
                'satuan' => $validated['satuan'],
                'rate' => $rate,
                'jml_anggaran' => $this->calculateAmount($volume, $rate),
                'sisa_vol' => $sisaVolume,
                'sisa_anggaran' => $this->calculateAmount($sisaVolume, $rate),
            ]);
        });

        return back()->with('success', 'Master Translok berhasil diperbarui.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $this->authorizeManage($request);

        $tahun = (int) session('tahun', now()->year);

        try {
            DB::transaction(function () use ($tahun, $id) {
                $translok = $this->tahunQuery($tahun)
                    ->lockForUpdate()
                    ->findOrFail($id);

                if ((int) $translok->realisasi_vol > 0) {
                    throw ValidationException::withMessages([
                        'translok' => 'Data tidak dapat dihapus karena sudah memiliki realisasi.',
                    ]);
                }

                $translok->delete();
            });
        } catch (QueryException $exception) {
            if (in_array((string) $exception->getCode(), ['23000', '23503'], true)) {
                return back()->withErrors([
                    'translok' => 'Data tidak dapat dihapus karena masih digunakan oleh data lain.',
                ]);
            }

            throw $exception;
        }

        return back()->with('success', 'Master Translok berhasil dihapus.');
    }

    private function authorizeManage(Request $request): void
    {
        abort_unless(
            in_array($request->user()->role, ['admin', 'ketua'], true),
            403
        );
    }

    private function validateInput(Request $request, int $tahun): array
    {
        $validated = $request->validate([
            'kegiatan_id' => ['required', 'integer', 'exists:kegiatans,id'],
            'vol_awal' => ['required', 'integer', 'min:0'],
            'satuan' => ['required', 'string', 'max:50'],
            'rate' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
        ]);

        $valid = Kegiatan::query()
            ->whereKey($validated['kegiatan_id'])
            ->where('tahun', $tahun)
            ->where('is_active', true)
            ->exists();

        if (!$valid) {
            throw ValidationException::withMessages([
                'kegiatan_id' => 'Kegiatan tidak tersedia pada tahun aktif.',
            ]);
        }

        return $validated;
    }

    private function tahunQuery(int $tahun): Builder
    {
        return TranslokMaster::query()->where('tahun', $tahun);
    }

    private function calculateAmount(int $volume, string|int|float $rate): string
    {
        $rateString = number_format((float) $rate, 2, '.', '');
        $parts = explode('.', $rateString);
        $cents = ((int) $parts[0] * 100) + (int) $parts[1];
        $total = $volume * $cents;

        if ($total > 99999999999999999) {
            throw ValidationException::withMessages([
                'rate' => 'Jumlah anggaran melebihi batas penyimpanan.',
            ]);
        }

        return sprintf('%d.%02d', intdiv($total, 100), $total % 100);
    }
}
