<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BastController extends Controller
{
    public function cetak(Request $request, string $idA)
    {
        $petugas = DB::table('kegiatan_petugas')->where('id_a', $idA)->first();
        abort_if(!$petugas, 404);

        $templatePath = storage_path('app/templates/template_bast.docx');
        abort_if(!file_exists($templatePath), 404);

        $validated = $request->validate([
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

        $nomorBastTerakhir = DB::table('bast')->where('tahun', $petugas->tahun)->max('no_bast_a') ?? 0;
        $nomorBastBaru = $nomorBastTerakhir + 1;
        
        $nSpt = str_pad($nomorBastBaru, 3, '0', STR_PAD_LEFT);
        $noBastFull = "BA-{$nSpt}/35290/PL.714/{$petugas->kd_bulan}/{$petugas->tahun}";

        DB::transaction(function () use ($idA, $validated, $noBastFull, $nomorBastBaru, $petugas) {
            DB::table('kegiatan_petugas')->where('id_a', $idA)->update([
                'no_spt' => $validated['no_spt'],
                'tgl_spt' => $validated['tgl_spt'],
                'no_bast' => $noBastFull,
                'tgl_bast' => $validated['tgl_bast'],
                'flag_bast' => 1,
            ]);

            DB::table('bast')->insert([
                'tahun' => $petugas->tahun,
                'no_bast_a' => $nomorBastBaru,
            ]);
        }, 3);

        $templateProcessorClass = 'PhpOffice\\PhpWord\\TemplateProcessor';
        $template = new $templateProcessorClass($templatePath);

        $template->setValue('hari', $validated['hari']);
        $template->setValue('ur_tgl', $validated['tanggalindo']);
        $template->setValue('ur_bulan', $validated['ur_bulan']);
        $template->setValue('ur_tahun', $petugas->tahun);
        $template->setValue('tgl', date('d-m-Y', strtotime($validated['tgl_bast'])));
        $template->setValue('no_bast', $noBastFull);
        $template->setValue('tgl_spt', date('d-m-Y', strtotime($validated['tgl_spt'])));
        $template->setValue('no_spt', $validated['no_spt']);
        $template->setValue('nm_katim', $validated['nm_katim']);
        $template->setValue('nm_tim', $petugas->nm_tim);
        $template->setValue('nama', $petugas->nama);
        $template->setValue('ur_giat', $petugas->ur_giat);
        $template->setValue('sat', $petugas->satuan);
        $template->setValue('vol', $petugas->vol);
        $template->setValue('nm_ppk', $validated['nm_ppk']);
        $template->setValue('nip_ppk', $validated['nip_ppk']);

        $fileName = 'BAST_' . preg_replace('/[^A-Za-z0-9]/', '_', $petugas->nama) . '.docx';
        $tempFile = storage_path('app/temp/' . $fileName);
        
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $template->saveAs($tempFile);

        return response()->download($tempFile)->deleteFileAfterSend(true);
    }
}