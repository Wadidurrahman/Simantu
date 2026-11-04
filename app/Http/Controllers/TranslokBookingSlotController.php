<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class TranslokBookingSlotController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $windows = DB::table('translok_booking_windows')->get();

        // Menggunakan user_id sesuai kolom yang baru ditambahkan
        $mySlots = DB::table('translok_booking_slots')
            ->where('user_id', $user->id)
            ->get();

        return Inertia::render('Translok/BookingSlot/Index', [
            'windows' => $windows,
            'mySlots' => $mySlots,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'window_id' => 'required|exists:translok_booking_windows,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($validated, $user) {
            $window = DB::table('translok_booking_windows')
                ->where('id', $validated['window_id'])
                ->first();

            if (! $window) {
                abort(404, 'Periode booking tidak ditemukan.');
            }

            if ($validated['tanggal'] < $window->date_start || $validated['tanggal'] > $window->date_end) {
                abort(422, 'Tanggal pilihan di luar rentang periode yang ditentukan ketua.');
            }

            $exists = DB::table('translok_booking_slots')
                ->where('tanggal', $validated['tanggal'])
                ->where('jam_mulai', $validated['jam_mulai'])
                ->exists();

            if ($exists) {
                abort(422, 'Maaf, slot tanggal dan jam tersebut sudah dipilih oleh pegawai lain.');
            }

            DB::table('translok_booking_slots')->insert([
                'window_id' => $validated['window_id'],
                'user_id' => $user->id, // Menggunakan user_id
                'tanggal' => $validated['tanggal'],
                'jam_mulai' => $validated['jam_mulai'],
                'jam_selesai' => $validated['jam_selesai'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Berhasil memilih jadwal perjalanan dinas.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        DB::table('translok_booking_slots')
            ->where('id', $id)
            ->where('user_id', $user->id) // Menggunakan user_id
            ->delete();

        return back()->with('success', 'Pilihan jadwal dibatalkan.');
    }
}
