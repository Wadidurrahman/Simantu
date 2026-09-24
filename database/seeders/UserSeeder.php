<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Membuat akun Super Admin
        User::create([
            'name' => 'Super Administrator',
            'nip_baru' => '198001012005011001',
            'username' => 'superadmin',
            'email' => 'admin@bps.go.id',
            'password' => md5('12345678'), // Password di-MD5 sesuai sistem lama
            'level' => 1, // Misal 1 untuk Super Admin
            'must_change_password' => true, // Memaksa admin ganti password juga saat pertama login
        ]);

        // Membuat akun Pegawai Biasa
        User::create([
            'name' => 'Wadidur Rahman',
            'nip_baru' => '199512212019032001',
            'username' => 'wadidur',
            'email' => 'wadidur@bps.go.id',
            'password' => md5('12345678'),
            'level' => 2, // 2 untuk Pegawai
            'must_change_password' => true,
        ]);
    }
}
