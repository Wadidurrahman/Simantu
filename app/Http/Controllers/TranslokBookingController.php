<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class TranslokBookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $canManage = in_array($user->role, ['admin', 'ketua'], true);

        $year = (int) session('tahun', now()->year);
        $month = max(1, min(12, $request->integer('bulan', now()->month)));
        $first = sprintf('%s-%02d-01', $year, $month);
        $last = Carbon::parse($first)->endOfMonth()->toDateString();
        $windows = DB::table('translok_booking_windows')
            ->where('date_start', '<=', $last)
            ->where('date_end', '>=', $first)
            ->orderBy('date_start')
            ->get();
        $legacyOff = DB::table('translok_tgl_off')
            ->whereBetween('tgl', [$first, $last])
            ->orderBy('tgl')
            ->get(['tgl', 'ket']);
        $mySlots = DB::table('translok_booking_slots')
            ->where('user_id', $user->id)
            ->get();
        return Inertia::render('Translok/Booking/Index', [
            'windows' => $windows,
            'legacyOff' => $legacyOff,
            'mySlots' => $mySlots,
            'tahun' => $year,
            'bulan' => sprintf('%02d', $month),
            'canManage' => $canManage,
        ]);
    }

    public function storeWindow(Request $request)
    {
        return back()->with('success', 'Periode booking berhasil disimpan.');
    }

    public function destroyWindow(Request $request, $id)
    {
        return back()->with('success', 'Periode berhasil dihapus.');
    }
    public function storeSlot(Request $request)
    {
        return back()->with('success', 'Berhasil memilih jadwal perjalanan dinas.');
    }

    public function destroySlot(Request $request, $id)
    {
        return back()->with('success', 'Pilihan jadwal dibatalkan.');
    }
}