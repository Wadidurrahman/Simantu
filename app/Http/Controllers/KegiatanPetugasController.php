<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KegiatanPetugasController extends Controller
{
    public function store(Request $request)
    {
        $validated =$request->validate([
            'tahun' => ['required', 'integer'],
            'kd_bulan' => ['required', 'string', 'size:2'],
            'id_sobat' => ['required', 'string'],
            'nama' => ['required', 'string'],
            'kd_tim' => ['required', 'string'],
            'nm_tim' => ['required', 'string'],
            'kd_giat' => ['required', 'string'],
            'ur_giat' => ['required', 'string'],
            'satuan' => ['required', 'string'],
            'hr_satuan' => ['required', 'numeric', 'min:0'],
            'vol' => ['required', 'numeric', 'min:1'],
            'jml_hr' => ['required', 'numeric', 'min:0'],
        ]);

        $tahun =$validated['tahun'];
        $kdBulan =$validated['kd_bulan'];
        $idSobat =$validated['id_sobat'];
        $jmlHr = (float)$validated['jml_hr'];

        DB::transaction(function () use ($tahun, $kdBulan,$idSobat, $jmlHr,$validated, $request) {$totalSbm = DB::table('kegiatan_petugas')
                ->where('tahun', $tahun)
                ->where('kd_bulan', $kdBulan)
                ->where('id_sobat', $idSobat)
                ->sum('jml_hr');

            if (($totalSbm +$jmlHr) > 3300000) {
                throw ValidationException::withMessages([
                    'jml_hr' => 'Total honor melebihi batas SBM (Rp3.300.000).',
                ]);
            }

            $idA =$tahun . $kdBulan .$idSobat . $validated['kd_tim'] .$validated['kd_giat'];

            if (DB::table('kegiatan_petugas')->where('id_a', $idA)->exists()) {
                throw ValidationException::withMessages([
                    'id_sobat' => 'Petugas sudah terinput pada kegiatan ini di bulan yang sama.',
                ]);
            }

            DB::table('kegiatan_petugas')->insert([
                'id_a' => $idA,
                'tahun' => $tahun,
                'kd_bulan' => $kdBulan,
                'id_sobat' => $idSobat,
                'nama' => $validated['nama'],
                'kd_tim' => $validated['kd_tim'],
                'nm_tim' => $validated['nm_tim'],
                'kd_giat' => $validated['kd_giat'],
                'ur_giat' => $validated['ur_giat'],
                'satuan' => $validated['satuan'],
                'hr_satuan' => $validated['hr_satuan'],
                'vol' => $validated['vol'],
                'jml_hr' => $jmlHr,
                'user' => $request->user()->username ?? $request->user()->nip_baru,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, 3);

        return back()->with('success', 'Data Petugas Berhasil Disimpan');
    }

    public function copyPenugasan(Request $request)
    {
        $validated =$request->validate([
            'tahun' => ['required', 'integer'],
            'dari_bulan' => ['required', 'string', 'size:2'],
            'ke_bulan' => ['required', 'string', 'size:2'],
            'kd_tim' => ['required', 'string'],
            'kd_giat' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($validated, $request) {$petugasLama = DB::table('kegiatan_petugas')
                ->where('tahun', $validated['tahun'])
                ->where('kd_bulan', $validated['dari_bulan'])
                ->where('kd_tim', $validated['kd_tim'])
                ->where('kd_giat', $validated['kd_giat'])
                ->get();

            if ($petugasLama->isEmpty()) {
                throw ValidationException::withMessages([
                    'dari_bulan' => 'Tidak ada data petugas pada bulan tersebut.',
                ]);
            }

            foreach ($petugasLama as$rl) {
                $idA =$validated['tahun'] . $validated['ke_bulan'] .$rl->id_sobat . $rl->kd_tim .$rl->kd_giat;

                if (!DB::table('kegiatan_petugas')->where('id_a', $idA)->exists()) {
                    DB::table('kegiatan_petugas')->insert([
                        'id_a' => $idA,
                        'tahun' => $validated['tahun'],
                        'kd_bulan' => $validated['ke_bulan'],
                        'id_sobat' => $rl->id_sobat,
                        'nama' => $rl->nama,
                        'kd_tim' => $rl->kd_tim,
                        'nm_tim' => $rl->nm_tim,
                        'kd_giat' => $rl->kd_giat,
                        'ur_giat' => $rl->ur_giat,
                        'satuan' => $rl->satuan,
                        'hr_satuan' => $rl->hr_satuan,
                        'vol' => $rl->vol,
                        'jml_hr' => $rl->jml_hr,
                        'user' => $request->user()->username ?? $request->user()->nip_baru,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }, 3);

        return back()->with('success', 'Data Petugas BERHASIL di COPY');
    }
}