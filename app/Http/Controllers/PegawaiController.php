<?php

namespace App\Http\Controllers;

use App\Http\Requests\PegawaiRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PegawaiController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(in_array($request->user()->role, [
            'super_admin',
            'pimpinan',
            'operator',
            'ketua_tim',
        ], true), 403);

        $pegawai = DB::table('users as pengguna')
            ->leftJoin('jabatan as j', 'j.id', '=', 'pengguna.id_jabatan')
            ->where('pengguna.role', 'pegawai')
            ->select(
                'pengguna.id',
                'pengguna.name',
                'pengguna.username',
                'pengguna.nip',
                'pengguna.id_jabatan',
                'pengguna.no_hp',
                'pengguna.email',
                'pengguna.status',
                'pengguna.created_at',
                'j.nama_jabatan as jabatan'
            )
            ->orderBy('pengguna.name')
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'nip' => $item->nip,
                'nama_lengkap' => $item->name,
                'name' => $item->name,
                'username' => $item->username,
                'jabatan' => $item->jabatan,
                'id_jabatan' => $item->id_jabatan,
                'nomor_hp' => $item->no_hp,
                'no_hp' => $item->no_hp,
                'email' => $item->email,
                'is_active' => $item->status === 'aktif',
                'status' => $item->status,
                'created_at' => $item->created_at,
            ])
            ->all();

        $jabatan = DB::table('jabatan')
            ->where('status', 'aktif')
            ->orderBy('nama_jabatan')
            ->get(['id', 'nama_jabatan'])
            ->map(fn ($item) => [
                'id' => $item->id,
                'value' => $item->nama_jabatan,
                'label' => $item->nama_jabatan,
            ])
            ->all();

        return Inertia::render('Pegawai/Index', [
            'pegawai' => $pegawai,
            'jabatanOptions' => $jabatan,
            'permissions' => [
                'canCreate' => in_array($request->user()->role, ['super_admin', 'operator'], true),
                'canUpdate' => in_array($request->user()->role, ['super_admin', 'operator'], true),
                'canDelete' => in_array($request->user()->role, ['super_admin', 'operator'], true),
            ],
        ]);
    }

    public function store(PegawaiRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $username = trim((string) ($data['username'] ?? ''));

            if ($username === '') {
                $username = 'pegawai_' . $data['nip'];
            }

            $this->pastikanIdentitasUnik(
                $username,
                $data['nip']
            );

            $pegawai = new User();

            $pegawai->name = trim($data['nama_lengkap']);
            $pegawai->username = $username;
            $pegawai->nip = $data['nip'];
            $pegawai->email = strtolower(trim((string) ($data['email'] ?? '')));
            $pegawai->verifikasi_email = '';
            $pegawai->password = $data['password'];
            $pegawai->id_jabatan = $this->cariJabatan($data['jabatan']);
            $pegawai->no_hp = $data['nomor_hp'] ?? null;
            $pegawai->role = 'pegawai';
            $pegawai->status = ($data['is_active'] ?? true)
                ? 'aktif'
                : 'nonaktif';

            $pegawai->save();
        });

        return redirect()
            ->route('pegawai.index')
            ->with('success', 'Pegawai dan akun berhasil ditambahkan.');
    }

    public function update(
        PegawaiRequest $request,
        User $pegawai
    ): RedirectResponse {
        $this->pastikanPegawai($pegawai);

        $data = $request->validated();

        DB::transaction(function () use ($pegawai, $data) {
            $username = trim((string) ($data['username'] ?? ''));

            if ($username === '') {
                $username = $pegawai->username;
            }

            $this->pastikanIdentitasUnik(
                $username,
                $data['nip'],
                $pegawai->id
            );

            $pegawai->name = trim($data['nama_lengkap']);
            $pegawai->username = $username;
            $pegawai->nip = $data['nip'];
            $pegawai->email = strtolower(trim((string) ($data['email'] ?? '')));
            $pegawai->id_jabatan = $this->cariJabatan($data['jabatan']);
            $pegawai->no_hp = $data['nomor_hp'] ?? null;

            if (array_key_exists('is_active', $data)) {
                $pegawai->status = $data['is_active']
                    ? 'aktif'
                    : 'nonaktif';
            }

            if (!empty($data['password'])) {
                $pegawai->password = $data['password'];
            }

            $pegawai->save();
        });

        return redirect()
            ->route('pegawai.index')
            ->with('success', 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(
        Request $request,
        User $pegawai
    ): RedirectResponse {
        abort_unless(in_array($request->user()?->role, [
            'super_admin',
            'operator',
        ], true), 403);

        $this->pastikanPegawai($pegawai);

        $pegawai->status = 'nonaktif';
        $pegawai->save();

        return redirect()
            ->route('pegawai.index')
            ->with('success', 'Akun pegawai berhasil dinonaktifkan.');
    }

    private function pastikanPegawai(User $pegawai): void
    {
        abort_unless($pegawai->role === 'pegawai', 404);
    }

    private function cariJabatan(string $namaJabatan): int
    {
        $id = DB::table('jabatan')
            ->where('nama_jabatan', $namaJabatan)
            ->where('status', 'aktif')
            ->value('id');

        if ($id === null) {
            throw ValidationException::withMessages([
                'jabatan' => 'Jabatan tidak ditemukan atau tidak aktif.',
            ]);
        }

        return (int) $id;
    }

    private function pastikanIdentitasUnik(
        string $username,
        string $nip,
        ?int $kecualiId = null
    ): void {
        $cekUsername = User::query()
            ->where('nip', $username);

        $cekNip = User::query()
            ->where('username', $nip);

        if ($kecualiId !== null) {
            $cekUsername->where('id', '!=', $kecualiId);
            $cekNip->where('id', '!=', $kecualiId);
        }

        if ($cekUsername->exists()) {
            throw ValidationException::withMessages([
                'username' => 'Username berbenturan dengan NIP pengguna lain.',
            ]);
        }

        if ($cekNip->exists()) {
            throw ValidationException::withMessages([
                'nip' => 'NIP berbenturan dengan username pengguna lain.',
            ]);
        }
    }
}
