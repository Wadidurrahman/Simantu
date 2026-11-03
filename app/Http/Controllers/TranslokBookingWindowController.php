<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TranslokBookingWindowController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAccess($request);

        $year = $this->year();
        $month = max(1, min(12, $request->integer('bulan', now()->month)));
        $first = sprintf('%s-%02d-01', $year, $month);
        $last = Carbon::parse($first)->endOfMonth()->toDateString();

        $windows = DB::table('translok_booking_windows')
            ->where('date_start', '<=', $last)
            ->where('date_end', '>=', $first)
            ->orderBy('date_start')
            ->get();

        $legacy = DB::table('translok_tgl_off')
            ->whereBetween('tgl', [$first, $last])
            ->orderBy('tgl')
            ->get(['tgl', 'ket']);

        return Inertia::render('Translok/Off/Index', [
            'windows' => $windows,
            'legacyOff' => $legacy,
            'tahun' => (int) $year,
            'bulan' => sprintf('%02d', $month),
            'canManage' => $this->canManage($request),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManage($request);
        $data = $this->validated($request);

        DB::transaction(function () use ($data) {
            $this->lockMutex();
            $this->checkOverlap($data);

            DB::table('translok_booking_windows')->insert([
                ...$data,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, 3);

        return back()->with('success', 'Periode booking berhasil disimpan.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $this->authorizeManage($request);
        $data = $this->validated($request);

        DB::transaction(function () use ($data, $id) {
            $this->lockMutex();

            $old = DB::table('translok_booking_windows')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            abort_if(!$old || substr($old->date_start, 0, 4) !== $this->year(), 404);

            $hasBooking = DB::table('translok_booking_slots')
                ->where('window_id', $id)
                ->exists();

            if (
                $hasBooking &&
                (
                    $old->date_start !== $data['date_start'] ||
                    $old->date_end !== $data['date_end'] ||
                    substr($old->time_start, 0, 5) !== $data['time_start'] ||
                    substr($old->time_end, 0, 5) !== $data['time_end']
                )
            ) {
                throw ValidationException::withMessages([
                    'date_start' => 'Periode dan jam tidak dapat diubah ketika sudah ada booking. Batalkan booking terlebih dahulu.',
                ]);
            }

            $this->checkOverlap($data, $id);

            DB::table('translok_booking_windows')
                ->where('id', $id)
                ->update([
                    ...$data,
                    'updated_at' => now(),
                ]);
        }, 3);

        return back()->with('success', 'Periode booking diperbarui.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $this->authorizeManage($request);

        DB::transaction(function () use ($id) {
            $this->lockMutex();

            $window = DB::table('translok_booking_windows')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            abort_if(!$window || substr($window->date_start, 0, 4) !== $this->year(), 404);

            if (
                DB::table('translok_booking_slots')
                    ->where('window_id', $id)
                    ->exists()
            ) {
                throw ValidationException::withMessages([
                    'window' => 'Masih ada booking pada periode ini. Batalkan booking terlebih dahulu.',
                ]);
            }

            DB::table('translok_booking_windows')
                ->where('id', $id)
                ->delete();
        }, 3);

        return back()->with('success', 'Periode berhasil dihapus.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'date_start' => ['required', 'date_format:Y-m-d'],
            'date_end' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_start'],
            'time_start' => ['required', 'date_format:H:i'],
            'time_end' => ['required', 'date_format:H:i', 'after:time_start'],
            'deadline' => ['required', 'date_format:Y-m-d H:i'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        if (
            substr($data['date_start'], 0, 4) !== $this->year() ||
            substr($data['date_end'], 0, 4) !== $this->year()
        ) {
            throw ValidationException::withMessages([
                'date_start' => 'Periode harus dalam tahun aktif.',
            ]);
        }

        if (
            !str_ends_with($data['time_start'], ':00') ||
            !str_ends_with($data['time_end'], ':00')
        ) {
            throw ValidationException::withMessages([
                'time_start' => 'Gunakan jam bulat, misalnya 08:00 atau 16:00.',
            ]);
        }

        if (
            Carbon::parse($data['time_end'])
                ->diffInMinutes(Carbon::parse($data['time_start']), true) < 60
        ) {
            throw ValidationException::withMessages([
                'time_end' => 'Rentang jam minimal satu jam.',
            ]);
        }

        if (
            Carbon::parse($data['deadline'])
                ->greaterThan(Carbon::parse($data['date_end'] . ' ' . $data['time_end']))
        ) {
            throw ValidationException::withMessages([
                'deadline' => 'Deadline tidak boleh melewati akhir periode.',
            ]);
        }

        return $data;
    }

    private function checkOverlap(array $data, ?int $excludeId = null): void
    {
        $overlap = DB::table('translok_booking_windows')
            ->where('date_start', '<=', $data['date_end'])
            ->where('date_end', '>=', $data['date_start'])
            ->where('time_start', '<', $data['time_end'])
            ->where('time_end', '>', $data['time_start'])
            ->when(
                $excludeId !== null,
                fn ($query) => $query->where('id', '!=', $excludeId)
            )
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'date_start' => 'Periode dan jam bertabrakan dengan jadwal booking lainnya.',
            ]);
        }
    }

    private function lockMutex(): void
    {
        DB::table('translok_booking_mutex')
            ->where('id', 1)
            ->lockForUpdate()
            ->first();
    }

    private function year(): string
    {
        $year = (int) session('tahun', now()->year);

        abort_unless($year >= 2000 && $year <= 2100, 422);

        return (string) $year;
    }

    private function authorizeAccess(Request $request): void
    {
        abort_unless(
            in_array($request->user()->role, ['admin', 'ketua', 'pegawai'], true),
            403
        );
    }

    private function canManage(Request $request): bool
    {
        return in_array($request->user()->role, ['admin', 'ketua'], true);
    }

    private function authorizeManage(Request $request): void
    {
        abort_unless($this->canManage($request), 403);
    }
}
