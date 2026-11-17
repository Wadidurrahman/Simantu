<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Matikan sementara pengecekan Foreign Key agar bisa mengosongkan tabel
        Schema::disableForeignKeyConstraints();

        // Kosongkan tabel users
        DB::table('users')->truncate();

        // Nyalakan kembali pengecekan Foreign Key
        Schema::enableForeignKeyConstraints();

        // Gunakan password default (Nanti Middleware SIMANTU akan mendeteksi ini
        // untuk memaksa user ganti password saat login pertama kali)
        $defaultPassword = Hash::make('bps12345');
        $now = now();

        $users = [
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'role' => 'super_admin',
                'nip' => '198001012005011001',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Bapak Pimpinan',
                'username' => 'pimpinan',
                'role' => 'pimpinan',
                'nip' => '197502022000031002',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Mbak Operator',
                'username' => 'operator',
                'role' => 'operator',
                'nip' => '198503032010122003',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Ketua Tim Satu',
                'username' => 'ketuatim1',
                'role' => 'ketua_tim',
                'nip' => '199004042015051004',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Ketua Tim Dua',
                'username' => 'ketuatim2',
                'role' => 'ketua_tim',
                'nip' => '199105052016061005',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Pegawai Satu',
                'username' => 'pegawai1',
                'role' => 'pegawai',
                'nip' => '199506062020121006',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Pegawai Dua',
                'username' => 'pegawai2',
                'role' => 'pegawai',
                'nip' => '199607072021012007',
                'password' => $defaultPassword,
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('users')->insert($users);
    }
}
