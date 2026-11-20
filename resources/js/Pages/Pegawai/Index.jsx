
import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import {
    Search,
    Plus,
    Pencil,
    UserRound,
    Users,
    UserCheck,
    UserX,
    Mail,
    Phone,
    BriefcaseBusiness,
    IdCard,
    LockKeyhole,
    Eye,
    EyeOff,
    X,
    Save,
    Loader2,
    ShieldCheck,
    RotateCcw,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

const dataAwal = {
    nip: '',
    nama_lengkap: '',
    username: '',
    jabatan: '',
    nomor_hp: '',
    email: '',
    password: '',
    is_active: true
};

export default function Index({
    auth,
    pegawai = [],
    jabatanOptions = [],
    permissions = {}
}) {
    const [pencarian, setPencarian] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [formTerbuka, setFormTerbuka] = useState(false);
    const [pegawaiEdit, setPegawaiEdit] = useState(null);
    const [tampilkanPassword, setTampilkanPassword] = useState(false);
    const [sedangMenonaktifkan, setSedangMenonaktifkan] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors
    } = useForm(dataAwal);

    const bolehTambah = Boolean(permissions.canCreate);
    const bolehUbah = Boolean(permissions.canUpdate);
    const bolehNonaktifkan = Boolean(permissions.canDelete);

    const statistik = useMemo(() => ({
        total: pegawai.length,
        aktif: pegawai.filter(item => item.is_active).length,
        nonaktif: pegawai.filter(item => !item.is_active).length
    }), [pegawai]);

    const daftarPegawai = useMemo(() => {
        const kataKunci = pencarian.trim().toLowerCase();

        return pegawai.filter(item => {
            const cocokPencarian = [
                item.nama_lengkap,
                item.nip,
                item.username,
                item.email,
                item.jabatan
            ].some(value =>
                String(value ?? '').toLowerCase().includes(kataKunci)
            );

            const cocokStatus =
                filterStatus === 'semua' ||
                (filterStatus === 'aktif' && item.is_active) ||
                (filterStatus === 'nonaktif' && !item.is_active);

            return cocokPencarian && cocokStatus;
        });
    }, [pegawai, pencarian, filterStatus]);

    const bukaTambah = () => {
        reset();
        clearErrors();
        setPegawaiEdit(null);
        setTampilkanPassword(false);
        setFormTerbuka(true);
    };

    const bukaEdit = (item) => {
        clearErrors();

        setData({
            nip: item.nip ?? '',
            nama_lengkap: item.nama_lengkap ?? '',
            username: item.username ?? '',
            jabatan: item.jabatan ?? '',
            nomor_hp: item.nomor_hp ?? '',
            email: item.email ?? '',
            password: '',
            is_active: Boolean(item.is_active)
        });

        setPegawaiEdit(item.id);
        setTampilkanPassword(false);
        setFormTerbuka(true);
    };

    const tutupForm = () => {
        if (processing) return;

        setFormTerbuka(false);
        setPegawaiEdit(null);
        setTampilkanPassword(false);
        clearErrors();
        reset();
    };

    const simpanPegawai = (e) => {
        e.preventDefault();

        const opsi = {
            preserveScroll: true,
            onSuccess: () => {
                setFormTerbuka(false);
                setPegawaiEdit(null);
                setTampilkanPassword(false);
                clearErrors();
                reset();
            }
        };

        if (pegawaiEdit !== null) {
            put(route('pegawai.update', pegawaiEdit), opsi);
            return;
        }

        post(route('pegawai.store'), opsi);
    };

    const nonaktifkanPegawai = (item) => {
        if (!item.is_active || sedangMenonaktifkan !== null) return;

        const konfirmasi = window.confirm(
            `Nonaktifkan akun ${item.nama_lengkap}? Akun tidak dapat digunakan untuk login kembali.`
        );

        if (!konfirmasi) return;

        setSedangMenonaktifkan(item.id);

        router.delete(route('pegawai.destroy', item.id), {
            preserveScroll: true,
            onFinish: () => setSedangMenonaktifkan(null)
        });
    };

    const kelasInput = (nama) =>
        `h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:ring-4 ${
            errors[nama]
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
        }`;

    const pesanError = (nama) =>
        errors[nama] ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors[nama]}
            </p>
        ) : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Master Pegawai
                </h2>
            }
        >
            <Head title="Master Pegawai | SIMANTU" />

            <div className="min-h-screen bg-slate-50/70 py-6 sm:py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
                                <ShieldCheck className="h-4 w-4" />
                                Manajemen Pengguna
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                Data Pegawai
                            </h1>

                            <p className="mt-1.5 text-sm text-slate-500">
                                Kelola identitas, jabatan, dan akses akun pegawai SIMANTU.
                            </p>
                        </div>

                        {bolehTambah && (
                            <button
                                type="button"
                                onClick={bukaTambah}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Pegawai
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            {
                                label: 'Total Pegawai',
                                value: statistik.total,
                                icon: Users,
                                color: 'text-blue-600',
                                background: 'bg-blue-50'
                            },
                            {
                                label: 'Pegawai Aktif',
                                value: statistik.aktif,
                                icon: UserCheck,
                                color: 'text-emerald-600',
                                background: 'bg-emerald-50'
                            },
                            {
                                label: 'Pegawai Nonaktif',
                                value: statistik.nonaktif,
                                icon: UserX,
                                color: 'text-orange-600',
                                background: 'bg-orange-50'
                            }
                        ].map(item => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                                >
                                    <div>
                                        <p className="text-xs font-medium text-slate-500">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                            {item.value.toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.background} ${item.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {formTerbuka && (
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {pegawaiEdit !== null
                                            ? 'Ubah Data Pegawai'
                                            : 'Tambah Pegawai Baru'}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Lengkapi identitas dan informasi akun pegawai.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={tutupForm}
                                    disabled={processing}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                    aria-label="Tutup formulir"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={simpanPegawai} className="p-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                    <div className="space-y-1.5">
                                        <label htmlFor="nip" className="text-xs font-bold text-slate-700">
                                            NIP <span className="text-red-500">*</span>
                                        </label>

                                        <div className="relative">
                                            <IdCard className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                            <input
                                                id="nip"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={18}
                                                value={data.nip}
                                                onChange={e =>
                                                    setData('nip', e.target.value.replace(/\D/g, '').slice(0, 18))
                                                }
                                                placeholder="18 digit NIP"
                                                className={`${kelasInput('nip')} pl-10`}
                                                disabled={processing}
                                                required
                                            />
                                        </div>

                                        {pesanError('nip')}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="nama_lengkap" className="text-xs font-bold text-slate-700">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </label>

                                        <div className="relative">
                                            <UserRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                            <input
                                                id="nama_lengkap"
                                                type="text"
                                                value={data.nama_lengkap}
                                                onChange={e => setData('nama_lengkap', e.target.value)}
                                                placeholder="Nama lengkap pegawai"
                                                className={`${kelasInput('nama_lengkap')} pl-10`}
                                                disabled={processing}
                                                required
                                            />
                                        </div>

                                        {pesanError('nama_lengkap')}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="username" className="text-xs font-bold text-slate-700">
                                            Username
                                        </label>

                                        <input
                                            id="username"
                                            type="text"
                                            value={data.username}
                                            onChange={e => setData('username', e.target.value)}
                                            placeholder="Kosongkan untuk otomatis"
                                            className={kelasInput('username')}
                                            disabled={processing}
                                        />

                                        {pesanError('username')}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="jabatan" className="text-xs font-bold text-slate-700">
                                            Jabatan <span className="text-red-500">*</span>
                                        </label>

                                        <div className="relative">
                                            <BriefcaseBusiness className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />

                                            <select
                                                id="jabatan"
                                                value={data.jabatan}
                                                onChange={e => setData('jabatan', e.target.value)}
                                                className={`${kelasInput('jabatan')} appearance-none pl-10 pr-10`}
                                                disabled={processing}
                                                required
                                            >
                                                <option value="">Pilih jabatan</option>

                                                {jabatanOptions.map(item => (
                                                    <option key={item.id} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                        </div>

                                        {pesanError('jabatan')}

                                        {jabatanOptions.length === 0 && (
                                            <p className="text-xs text-amber-600">
                                                Belum ada master jabatan aktif.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="nomor_hp" className="text-xs font-bold text-slate-700">
                                            Nomor HP
                                        </label>

                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                            <input
                                                id="nomor_hp"
                                                type="tel"
                                                value={data.nomor_hp}
                                                onChange={e => setData('nomor_hp', e.target.value)}
                                                placeholder="Nomor telepon"
                                                className={`${kelasInput('nomor_hp')} pl-10`}
                                                disabled={processing}
                                            />
                                        </div>

                                        {pesanError('nomor_hp')}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="text-xs font-bold text-slate-700">
                                            Email
                                        </label>

                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                placeholder="pegawai@contoh.id"
                                                className={`${kelasInput('email')} pl-10`}
                                                disabled={processing}
                                            />
                                        </div>

                                        {pesanError('email')}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="password" className="text-xs font-bold text-slate-700">
                                            Password {pegawaiEdit === null && <span className="text-red-500">*</span>}
                                        </label>

                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />

                                            <input
                                                id="password"
                                                type={tampilkanPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                placeholder={
                                                    pegawaiEdit !== null
                                                        ? 'Kosongkan jika tidak diubah'
                                                        : 'Password awal pegawai'
                                                }
                                                autoComplete="new-password"
                                                className={`${kelasInput('password')} pl-10 pr-11`}
                                                disabled={processing}
                                                required={pegawaiEdit === null}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setTampilkanPassword(!tampilkanPassword)}
                                                className="absolute right-3.5 top-3.5 text-slate-400 transition hover:text-blue-600"
                                                aria-label={tampilkanPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                            >
                                                {tampilkanPassword
                                                    ? <EyeOff className="h-4 w-4" />
                                                    : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-slate-400">
                                            Minimal 12 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.
                                        </p>

                                        {pesanError('password')}
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                                            <div>
                                                <span className="block text-sm font-semibold text-slate-700">
                                                    Status Akun
                                                </span>
                                                <span className="mt-0.5 block text-xs text-slate-500">
                                                    {data.is_active
                                                        ? 'Akun dapat digunakan untuk login'
                                                        : 'Akun tidak dapat digunakan untuk login'}
                                                </span>
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={e => setData('is_active', e.target.checked)}
                                                disabled={processing}
                                                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={tutupForm}
                                        disabled={processing}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        <X className="h-4 w-4" />
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing || jabatanOptions.length === 0}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <Save className="h-4 w-4" />}

                                        {processing
                                            ? 'Menyimpan...'
                                            : pegawaiEdit !== null
                                                ? 'Simpan Perubahan'
                                                : 'Simpan Pegawai'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5 sm:p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Daftar Pegawai
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Menampilkan {daftarPegawai.length} dari {pegawai.length} pegawai.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />

                                        <input
                                            type="search"
                                            value={pencarian}
                                            onChange={e => setPencarian(e.target.value)}
                                            placeholder="Cari nama, NIP, jabatan..."
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-64"
                                        />
                                    </div>

                                    <select
                                        value={filterStatus}
                                        onChange={e => setFilterStatus(e.target.value)}
                                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    >
                                        <option value="semua">Semua Status</option>
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="min-w-[900px] w-full text-left">
                                <thead className="bg-slate-50/80">
                                    <tr className="border-b border-slate-200">
                                        {[
                                            'No.',
                                            'Pegawai',
                                            'NIP',
                                            'Jabatan',
                                            'Kontak',
                                            'Status',
                                            'Tindakan'
                                        ].map(judul => (
                                            <th
                                                key={judul}
                                                className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                                            >
                                                {judul}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {daftarPegawai.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                <Users className="mx-auto h-10 w-10 text-slate-300" />
                                                <p className="mt-3 text-sm font-semibold text-slate-600">
                                                    Tidak ada pegawai ditemukan
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Periksa pencarian atau filter status.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : daftarPegawai.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="transition-colors hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-4 text-xs font-medium text-slate-400">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                        <UserRound className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="max-w-[220px] truncate text-sm font-semibold text-slate-800">
                                                            {item.nama_lengkap}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            @{item.username}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 font-mono text-xs text-slate-600">
                                                {item.nip || '-'}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-xs font-medium text-slate-600">
                                                    {item.jabatan || '-'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="max-w-[210px] truncate text-xs text-slate-600">
                                                        {item.email || '-'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {item.nomor_hp || '-'}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                        item.is_active
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    <span
                                                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                                            item.is_active
                                                                ? 'bg-emerald-500'
                                                                : 'bg-slate-400'
                                                        }`}
                                                    />
                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {bolehUbah && (
                                                        <button
                                                            type="button"
                                                            onClick={() => bukaEdit(item)}
                                                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            {item.is_active
                                                                ? <Pencil className="h-3.5 w-3.5" />
                                                                : <RotateCcw className="h-3.5 w-3.5" />}
                                                            {item.is_active ? 'Edit' : 'Kelola'}
                                                        </button>
                                                    )}

                                                    {bolehNonaktifkan && item.is_active && (
                                                        <button
                                                            type="button"
                                                            onClick={() => nonaktifkanPegawai(item)}
                                                            disabled={sedangMenonaktifkan !== null}
                                                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            {sedangMenonaktifkan === item.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <UserX className="h-3.5 w-3.5" />}
                                                            Nonaktifkan
                                                        </button>
                                                    )}

                                                    {!bolehUbah && !bolehNonaktifkan && (
                                                        <span className="text-xs text-slate-400">
                                                            Lihat saja
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                            <span>
                                Total {daftarPegawai.length} data ditampilkan
                            </span>
                            <span>
                                SIMANTU · Manajemen Data Pegawai
                            </span>
                        </div>
                    </section>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
