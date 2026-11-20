<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BastController extends Controller
{
    public function cetak(Request $request, int $id)
    {
        $mitraTable = collect(['tb_mitra', 'mitra', 'mitras'])->first(fn ($t) => Schema::hasTable($t));

        $query = DB::table('tb_kegiatan_petugas as kp')
            ->join('tb_kegiatan as k', 'k.id', '=', 'kp.kegiatan_id')
            ->leftJoin('tb_tim as t', 't.id', '=', 'k.tim_id')
            ->leftJoin('users as u', 'u.id', '=', 'kp.user_id')
            ->where('kp.id', $id);

        if ($mitraTable) {
            $query->leftJoin("{$mitraTable} as m", 'm.id', '=', 'kp.mitra_id');
        }

        $petugas = $query->first([
            'kp.*',
            'k.ur_giat',
            't.nama_tim',
            'u.name as nama_user',
            $mitraTable ? 'm.nama as nama_mitra' : DB::raw('NULL as nama_mitra'),
        ]);

        abort_if(!$petugas, 404);

        $validated = $request->validate([
            'format' => ['nullable', 'in:docx,pdf'],
            'hari' => ['required', 'string'],
            'tanggalindo' => ['required', 'string'],
            'ur_bulan' => ['required', 'string'],
            'tgl_bast' => ['required', 'date'],
            'no_spt' => ['required', 'string'],
            'tgl_spt' => ['required', 'date'],
            'nm_katim' => ['required', 'string'],
            'nm_ppk' => ['required', 'string'],
            'nip_ppk' => ['required', 'string'],
        ]);

        $kdBulan = str_pad((string) $petugas->bulan, 2, '0', STR_PAD_LEFT);
        $noBastFull = $petugas->no_bast;

        if (!$noBastFull) {
            $nomorBastTerakhir = Schema::hasTable('bast')
                ? (DB::table('bast')->where('tahun', $petugas->tahun)->max('no_bast_a') ?? 0)
                : 0;
            $nomorBastBaru = $nomorBastTerakhir + 1;
            $nSpt = str_pad((string) $nomorBastBaru, 3, '0', STR_PAD_LEFT);
            $noBastFull = "BA-{$nSpt}/35740/PL.714/{$kdBulan}/{$petugas->tahun}";

            DB::transaction(function () use ($id, $validated, $noBastFull, $nomorBastBaru, $petugas) {
                DB::table('tb_kegiatan_petugas')->where('id', $id)->update([
                    'no_spt' => $validated['no_spt'],
                    'tgl_spt' => $validated['tgl_spt'],
                    'no_bast' => $noBastFull,
                    'tgl_bast' => $validated['tgl_bast'],
                    'updated_at' => now(),
                ]);

                if (Schema::hasTable('bast')) {
                    DB::table('bast')->insert([
                        'tahun' => $petugas->tahun,
                        'no_bast_a' => $nomorBastBaru,
                    ]);
                }
            }, 3);
        }

        $namaPetugas = $petugas->mitra_id ? ($petugas->nama_mitra ?? '-') : ($petugas->nama_user ?? '-');
        $templatePath = storage_path('app/templates/template_bast.docx');
        abort_if(!file_exists($templatePath), 404, 'File template_bast.docx belum tersedia di storage/app/templates/');

        $template = new \PhpOffice\PhpWord\TemplateProcessor($templatePath);
        $template->setValue('hari', $validated['hari']);
        $template->setValue('ur_tgl', $validated['tanggalindo']);
        $template->setValue('ur_bulan', $validated['ur_bulan']);
        $template->setValue('ur_tahun', $petugas->tahun);
        $template->setValue('tgl', date('d-m-Y', strtotime($validated['tgl_bast'])));
        $template->setValue('no_bast', $noBastFull);
        $template->setValue('tgl_spt', date('d-m-Y', strtotime($validated['tgl_spt'])));
        $template->setValue('no_spt', $validated['no_spt']);
        $template->setValue('nm_katim', $validated['nm_katim']);
        $template->setValue('nm_tim', $petugas->nama_tim ?? '-');
        $template->setValue('nama', $namaPetugas);
        $template->setValue('ur_giat', $petugas->ur_giat);
        $template->setValue('sat', $petugas->satuan);
        $template->setValue('vol', $petugas->vol);
        $template->setValue('nm_ppk', $validated['nm_ppk']);
        $template->setValue('nip_ppk', $validated['nip_ppk']);

        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $safeName = preg_replace('/[^A-Za-z0-9]/', '_', $namaPetugas);
        $docxFile = "{$tempDir}/BAST_{$safeName}.docx";
        $template->saveAs($docxFile);

        return response()->download($docxFile)->deleteFileAfterSend(true);
    }
}
