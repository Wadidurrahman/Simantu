<?php

namespace Database\Seeders;

use App\Models\Tim;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (
            !app()->environment('local') ||
            DB::connection()->getDatabaseName() !== 'db_simantu'
        ) {
            throw new RuntimeException(
                'Seeder pengujian hanya dapat dijalankan pada lingkungan lokal db_simantu.'
            );
        }

        $daftarRole = [
            'super_admin' => 'Super Admin Uji',
            'pimpinan' => 'Pimpinan Uji',
            'operator' => 'Operator Uji',
            'ketua_tim' => 'Ketua Tim Uji',
            'pegawai' => 'Pegawai Uji',
            'mitra' => 'Mitra Uji',
        ];

        $penggunaUji = [];
        $kredensial = [];
        $nomor = 1;

        DB::transaction(function () use (
            $daftarRole,
            &$penggunaUji,
            &$kredensial,
            &$nomor
        ) {
            foreach ($daftarRole as $role => $nama) {
                $username = 'uji_' . $role;
                $email = $username . '@example.test';
                $nip = str_pad(
                    (string) $nomor++,
                    18,
                    '9',
                    STR_PAD_LEFT
                );

                $pengguna = User::query()
                    ->where('username', $username)
                    ->first();

                if ($pengguna && $pengguna->email !== $email) {
                    throw new RuntimeException(
                        'Username sudah digunakan akun lain: ' . $username
                    );
                }

                $kataSandi = 'bps12345';

                $pengguna ??= new User();

                $pengguna->name = $nama;
                $pengguna->username = $username;
                $pengguna->email = $email;
                $pengguna->verifikasi_email = '';
                $pengguna->password = Hash::make($kataSandi);
                $pengguna->role = $role;
                $pengguna->nip = $nip;
                $pengguna->status = 'aktif';

                $pengguna->save();

                $penggunaUji[$role] = $pengguna;

                $kredensial[] = [
                    'username' => $username,
                    'role' => $role,
                    'nip' => $nip,
                    'password' => $kataSandi,
                ];
            }

            $tahunSekarang = now('Asia/Jakarta')->year;

            $daftarTahun = [
                $tahunSekarang - 1,
                $tahunSekarang,
                $tahunSekarang + 1,
            ];

            foreach ($daftarTahun as $tahun) {
                $tim = Tim::query()->firstOrNew([
                    'nama_tim' => 'Tim Uji SIMANTU ' . $tahun,
                    'tahun' => (string) $tahun,
                ]);

                $tim->ketua_id = $penggunaUji['ketua_tim']->id;
                $tim->status = 'aktif';

                if (Schema::hasColumn('tb_tim', 'kd_tim')) {
                    $tim->kd_tim = 'UJI';
                }

                $tim->save();

                $tim->anggota()->syncWithoutDetaching([
                    $penggunaUji['pegawai']->id,
                ]);
            }
        });

        $this->command?->info('Akun pengujian SIMANTU berhasil disiapkan.');
        $this->command?->table(
            ['Username', 'Role', 'NIP', 'Password'],
            $kredensial
        );
    }
}
