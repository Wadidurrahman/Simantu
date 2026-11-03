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
        $this->authorizeAccess($request);

        $year = $this->year();
        $month = max(1, min(12, $request->integer('bulan', now()->month)));
        $manager = $this->isManager($request);
        $nip = $this->nip($request);

        if (!$manager) {
            abort_if($nip === '', 403);
        }

        $query = DB::table('translok_alokasi as a')
            ->leftJoin('translok_master as m', 'm.id_translok', '=', 'a.id_translok')
            ->leftJoin('organik as o', 'o.nip_lama', '=', 'a.nip_lama')
            ->where('a.tahun', $year)
            ->where('a.bulan', sprintf('%02d', $month));

        if (!$manager) {
            $query->where('a.nip_lama', $nip);
        }

        $allocations = $query
            ->select(
                'a.id',
                'a.tahun',
                'a.bulan',
                'a.nip_lama',
                'a.jadwal_a',
                'a.jadwal_b',
                'a.vol',
                'm.kd_translok',
                'm.translok',
                'm.tim',
                'o.nama'
            )
            ->orderBy('a.jadwal_a')
            ->get();

        $ids = $allocations->pluck('id');

        $bookings = DB::table('translok_booking_slots')
            ->whereIn('id_alokasi', $ids)
            ->get(['id', 'detail_id', 'id_alokasi', 'starts_at']);

        $bookingMap = $bookings->keyBy('detail_id');

        $details = DB::table('translok_detail')
            ->whereIn('id_alokasi', $ids)
            ->orderBy('tgl')
            ->get(['id', 'id_alokasi', 'tgl']);

        $grouped = $details->groupBy('id_alokasi');

        $items = $allocations->map(function ($allocation) use ($grouped, $bookingMap) {
            $rows = $grouped->get($allocation->id, collect());

            return [
                'id' => $allocation->id,
                'nip_lama' => $allocation->nip_lama,
                'nama' => $allocation->nama ?: $allocation->nip_lama,
                'translok' => $allocation->translok ?: 'Translok',
                'kd_translok' => $allocation->kd_translok,
                'tim' => $allocation->tim,
                'jadwal_a' => $allocation->jadwal_a,
                'jadwal_b' => $allocation->jadwal_b,
                'vol' => (int) $allocation->vol,
                'realisasi' => $rows->count(),
                'details' => $rows->map(function ($detail) use ($bookingMap) {
                    $slot = $bookingMap->get($detail->id);

                    return [
                        'id' => $detail->id,
                        'tgl' => $detail->tgl,
                        'jam' => $slot ? substr($slot->starts_at, 11, 5) : null,
                        'managed' => (bool) $slot,
                    ];
                })->values(),
            ];
        });

        return Inertia::render('Translok/Detail/Index', [
            'alokasi' => $items,
            'tahun' => (int) $year,
            'bulan' => sprintf('%02d', $month),
            'canManage' => $manager,
        ]);
    }

    public function availability(Request $request): JsonResponse
    {
        $this->authorizeAccess($request);

        $data = $request->validate([
            'id_alokasi' => ['required', 'string', 'max:255'],
        ]);

        $allocation = $this->allocation($request, $data['id_alokasi']);

        $windows = DB::table('translok_booking_windows')
            ->where('active', true)
            ->where('date_start', '<=', $allocation->jadwal_b)
            ->where('date_end', '>=', $allocation->jadwal_a)
            ->orderBy('date_start')
            ->get();

        $first = max($allocation->jadwal_a, now()->toDateString());
        $last = $allocation->jadwal_b;
        $dates = [];

        if ($first <= $last) {
            $legacyOff = DB::table('translok_tgl_off')
                ->whereBetween('tgl', [$first, $last])
                ->pluck('tgl')
                ->flip();

            $legacyDetail = DB::table('translok_detail as d')
                ->leftJoin('translok_booking_slots as b', 'b.detail_id', '=', 'd.id')
                ->whereBetween('d.tgl', [$first, $last])
                ->whereNull('b.id')
                ->distinct()
                ->pluck('d.tgl')
                ->flip();

            $takenSlots = DB::table('translok_booking_slots')
                ->whereBetween('starts_at', [
                    $first . ' 00:00:00',
                    $last . ' 23:59:59',
                ])
                ->pluck('starts_at')
                ->flip();

            for ($day = Carbon::parse($first); $day->toDateString() <= $last; $day->addDay()) {
                $date = $day->toDateString();
                $slots = [];

                foreach ($windows as $window) {
                    if (
                        $date < $window->date_start ||
                        $date > $window->date_end ||
                        now()->greaterThanOrEqualTo(Carbon::parse($window->deadline))
                    ) {
                        continue;
                    }

                    $startHour = (int) substr($window->time_start, 0, 2);
                    $endHour = (int) substr($window->time_end, 0, 2);

                    for ($hour = $startHour; $hour < $endHour; $hour++) {
                        $startsAt = sprintf('%s %02d:00:00', $date, $hour);

                        if (Carbon::parse($startsAt)->lte(now())) {
                            continue;
                        }

                        $slots[] = [
                            'time' => sprintf('%02d:00', $hour),
                            'taken' => $takenSlots->has($startsAt)
                                || $legacyOff->has($date)
                                || $legacyDetail->has($date),
                        ];
                    }
                }

                if (count($slots)) {
                    $dates[] = [
                        'date' => $date,
                        'slots' => $slots,
                    ];
                }
            }
        }

        return response()->json([
            'dates' => $dates,
            'server_time' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAccess($request);

        $data = $request->validate([
            'id_alokasi' => ['required', 'string', 'max:255'],
            'tgl' => ['required', 'date_format:Y-m-d'],
            'jam' => ['required', 'date_format:H:i'],
        ]);

        if (!str_ends_with($data['jam'], ':00')) {
            throw ValidationException::withMessages([
                'jam' => 'Slot harus menggunakan jam bulat.',
            ]);
        }

        $allocation = $this->allocation($request, $data['id_alokasi']);
        $dateTime = $data['tgl'] . ' ' . $data['jam'] . ':00';

        DB::transaction(function () use ($allocation, $data, $dateTime) {
            $this->lockMutex();
            $this->lockPegawai($allocation->nip_lama);

            $a = DB::table('translok_alokasi')
                ->where('id', $allocation->id)
                ->lockForUpdate()
                ->first();

            abort_if(!$a, 404);

            if (
                $data['tgl'] < $a->jadwal_a ||
                $data['tgl'] > $a->jadwal_b ||
                substr($data['tgl'], 0, 4) !== (string) $a->tahun ||
                substr($data['tgl'], 5, 2) !== (string) $a->bulan
            ) {
                throw ValidationException::withMessages([
                    'tgl' => 'Tanggal berada di luar periode alokasi.',
                ]);
            }

            if (Carbon::parse($dateTime)->lte(now())) {
                throw ValidationException::withMessages([
                    'tgl' => 'Tidak bisa memesan slot di waktu yang telah lewat.',
                ]);
            }

            $window = DB::table('translok_booking_windows')
                ->where('active', true)
                ->where('date_start', '<=', $data['tgl'])
                ->where('date_end', '>=', $data['tgl'])
                ->where('time_start', '<=', $data['jam'] . ':00')
                ->where('time_end', '>', $data['jam'] . ':00')
                ->where('deadline', '>', now())
                ->orderBy('id')
                ->first();

            if (!$window) {
                throw ValidationException::withMessages([
                    'jam' => 'Slot tidak tersedia atau deadline booking sudah berakhir.',
                ]);
            }

            if (
                DB::table('translok_tgl_off')
                    ->where('tgl', $data['tgl'])
                    ->exists()
            ) {
                throw ValidationException::withMessages([
                    'tgl' => 'Tanggal masuk daftar Tanggal Off.',
                ]);
            }

            $legacyDetail = DB::table('translok_detail as d')
                ->leftJoin('translok_booking_slots as s', 's.detail_id', '=', 'd.id')
                ->where('d.tgl', $data['tgl'])
                ->whereNull('s.id')
                ->exists();

            if ($legacyDetail) {
                throw ValidationException::withMessages([
                    'tgl' => 'Tanggal memiliki perjalanan historis tanpa jam, sehingga belum dapat dipesan.',
                ]);
            }

            if (
                DB::table('translok_booking_slots')
                    ->where('starts_at', $dateTime)
                    ->exists()
            ) {
                throw ValidationException::withMessages([
                    'jam' => 'Slot sudah dipesan pegawai lain. Pilih jam lain.',
                ]);
            }

            if (
                DB::table('translok_detail')
                    ->where('nip_l', $a->nip_lama)
                    ->where('tgl', $data['tgl'])
                    ->exists()
            ) {
                throw ValidationException::withMessages([
                    'tgl' => 'Pegawai sudah memiliki perjalanan di tanggal ini.',
                ]);
            }

            if (
                DB::table('translok_detail')
                    ->where('id_alokasi', $a->id)
                    ->count() >= (int) $a->vol
            ) {
                throw ValidationException::withMessages([
                    'tgl' => 'Kuota volume alokasi sudah habis.',
                ]);
            }

            $detailId = $a->id . $data['tgl'];

            if (DB::table('translok_detail')->where('id', $detailId)->exists()) {
                throw ValidationException::withMessages([
                    'tgl' => 'Detail perjalanan sudah ada.',
                ]);
            }

            DB::table('translok_detail')->insert([
                'id' => $detailId,
                'id_alokasi' => $a->id,
                'th' => $a->tahun,
                'bl' => $a->bulan,
                'id_translok' => $a->id_translok,
                'nip_l' => $a->nip_lama,
                'tgl' => $data['tgl'],
            ]);

            DB::table('translok_booking_slots')->insert([
                'window_id' => $window->id,
                'id_alokasi' => $a->id,
                'detail_id' => $detailId,
                'nip_lama' => $a->nip_lama,
                'starts_at' => $dateTime,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, 3);

        return back()->with('success', 'Slot perjalanan berhasil dipesan.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $this->authorizeAccess($request);

        $current = DB::table('translok_detail')
            ->where('id', $id)
            ->where('th', $this->year())
            ->first();

        abort_if(!$current, 404);

        $this->authorizeAllocation($request, $current->nip_l);

        DB::transaction(function () use ($id, $current) {
            $this->lockMutex();
            $this->lockPegawai($current->nip_l);

            $a = DB::table('translok_alokasi')
                ->where('id', $current->id_alokasi)
                ->lockForUpdate()
                ->first();

            abort_if(!$a, 404);

            $booking = DB::table('translok_booking_slots')
                ->where('detail_id', $id)
                ->first();

            if (!$booking) {
                throw ValidationException::withMessages([
                    'booking' => 'Detail perjalanan historis tidak dapat dibatalkan melalui booking baru.',
                ]);
            }

            DB::table('translok_booking_slots')
                ->where('detail_id', $id)
                ->delete();

            DB::table('translok_detail')
                ->where('id', $id)
                ->where('id_alokasi', $a->id)
                ->delete();
        }, 3);

        return back()->with('success', 'Booking dibatalkan. Slot tersedia kembali.');
    }

    private function allocation(Request $request, string $id): object
    {
        $allocation = DB::table('translok_alokasi')
            ->where('id', $id)
            ->where('tahun', $this->year())
            ->first();

        abort_if(!$allocation, 404);

        $this->authorizeAllocation($request, $allocation->nip_lama);

        return $allocation;
    }

    private function lockMutex(): void
    {
        DB::table('translok_booking_mutex')
            ->where('id', 1)
            ->lockForUpdate()
            ->first();
    }

    private function lockPegawai(string $nip): void
    {
        abort_if(
            !DB::table('organik')
                ->where('nip_lama', $nip)
                ->lockForUpdate()
                ->first(),
            404
        );
    }

    private function authorizeAllocation(Request $request, string $nip): void
    {
        if (!$this->isManager($request)) {
            abort_unless(
                $this->nip($request) !== '' &&
                $this->nip($request) === $nip,
                403
            );
        }
    }

    private function nip(Request $request): string
    {
        return (string) (
            $request->user()->nip_lama
            ?? $request->user()->nip
            ?? ''
        );
    }

    private function isManager(Request $request): bool
    {
        return in_array(
            $request->user()->role,
            ['admin', 'ketua'],
            true
        );
    }

    private function authorizeAccess(Request $request): void
    {
        abort_unless(
            in_array(
                $request->user()->role,
                ['admin', 'ketua', 'pegawai'],
                true
            ),
            403
        );
    }

    private function year(): string
    {
        $year = (int) session('tahun', now()->year);

        abort_unless($year >= 2000 && $year <= 2100, 422);

        return (string) $year;
    }
}
