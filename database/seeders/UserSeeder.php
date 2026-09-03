<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'nip_lama' => '340014013',
            'nip_baru' => '197406301994011002',
            'name' => 'John Doe',
            'jabatan' => 'Kepala Subbagian Umum',
            'gol' => 'III/d',
            'jk' => 'LK',
            'username' => 'johndoe',
            'password' => Hash::make('12345678'),
            'level' => 1,
        ]);
    }
}
