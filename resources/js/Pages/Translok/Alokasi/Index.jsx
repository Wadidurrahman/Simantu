
import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Search, Pencil, Trash2, X, CalendarDays, Users, Wallet, ClipboardList, AlertTriangle, RotateCcw } from 'lucide-react';

const bulanOptions = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const number = value => new Intl.NumberFormat('id-ID').format(Number(value) || 0);
const money = value => `Rp ${number(value)}`;
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export default function Index({ alokasi = [], masters = [], pegawai = [], tahun, bulan, canManage = false }) {
    const [search, setSearch] = useState('');
    const [filterTim, setFilterTim] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        bulan: String(bulan).padStart(2, '0'),
        id_translok: '',
        nip_lama: '',
        jadwal_a: '',
        jadwal_b: '',
        vol: 1,
    });

    const teams = useMemo(() => [...new Set(masters.map(item => item.tim).filter(Boolean))].sort(), [masters]);

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return alokasi.filter(item => {
            const matchTim = !filterTim || item.tim === filterTim;
            const matchSearch = !keyword || [
                item.nama, item.nip_lama, item.translok,
                item.kd_translok, item.tim, item.penginput,
            ].some(value => String(value ?? '').toLowerCase().includes(keyword));

            return matchTim && matchSearch;
        });
    }, [alokasi, search, filterTim]);

    const statistics = useMemo(() => ({
        total: filtered.length,
        pegawai: new Set(filtered.map(item => item.nip_lama)).size,
        volume: filtered.reduce((sum, item) => sum + Number(item.vol), 0),
        anggaran: filtered.reduce((sum, item) => sum + Number(item.vol) * Number(item.rate), 0),
    }), [filtered]);

    const selectedMaster = masters.find(item => item.id === data.id_translok);

    const current = editing ? alokasi.find(item => item.id === editing) : null;

    const pegawaiVolume = alokasi
        .filter(item => item.nip_lama === data.nip_lama && item.id !== editing)
        .reduce((sum, item) => sum + Number(item.vol), 0);

    const maxPegawai = Math.max(0, 16 - pegawaiVolume);

    const maxMaster = selectedMaster
        ? Number(selectedMaster.sisa) + Number(current?.vol || 0)
        : 0;

    const openAdd = () => {
        setEditing(null);
        clearErrors();
        setData({
            bulan: String(bulan).padStart(2, '0'),
            id_translok: '',
            nip_lama: '',
            jadwal_a: '',
            jadwal_b: '',
            vol: 1,
        });
        setOpen(true);
    };

    const openEdit = item => {
        setEditing(item.id);
        clearErrors();
        setData({
            bulan: item.bulan,
            id_translok: item.id_translok,
            nip_lama: item.nip_lama,
            jadwal_a: item.jadwal_a,
            jadwal_b: item.jadwal_b,
            vol: item.vol,
        });
        setOpen(true);
    };

    const close = () => {
        if (processing) return;
        setOpen(false);
        setEditing(null);
        clearErrors();
    };

    const submit = event => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setEditing(null);
            },
        };

        if (editing) {
            put(route('translok.alokasi.update', editing), options);
        } else {
            post(route('translok.alokasi.store'), options);
        }
    };

    const remove = () => {
        if (!deleting || deleteProcessing) return;

        setDeleteProcessing(true);
        setDeleteError('');

        router.delete(route('translok.alokasi.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
            onError: error => setDeleteError(Object.values(error).join(' ') || 'Gagal menghapus alokasi.'),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    const changeMonth = value => {
        router.get(route('translok.alokasi'), { bulan: value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const fieldClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-500';
    const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700';

    return (
        <AuthenticatedLayout>
            <Head title={`Alokasi Translok ${tahun}`} />

            <div className="space-y-5 pb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Alokasi Translok</h1>
                        <p className="mt-1 text-sm text-slate-500">Pengelolaan alokasi volume perjalanan dinas pegawai tahun {tahun}</p>
                    </div>

                    {canManage && (
                        <button type="button" onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                            <Plus size={16} />
                            Tambah Alokasi
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {[
                        { label: 'Total Alokasi', value: number(statistics.total), icon: ClipboardList },
                        { label: 'Pegawai Terlibat', value: number(statistics.pegawai), icon: Users },
                        { label: 'Total Volume', value: number(statistics.volume), icon: CalendarDays },
                        { label: 'Estimasi Anggaran', value: money(statistics.anggaran), icon: Wallet },
                    ].map(item => (
                        <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                <item.icon size={16} className="text-slate-400" />
                            </div>
                            <p className="mt-3 text-xl font-bold tracking-tight text-slate-900">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Cari nama pegawai, NIP, atau kegiatan..."
                                className={`${fieldClass} pl-9`}
                            />
                        </div>

                        <select value={filterTim} onChange={event => setFilterTim(event.target.value)} className={`${fieldClass} lg:w-36`}>
                            <option value="">Semua Tim</option>
                            {teams.map(value => <option key={value} value={value}>Tim {value}</option>)}
                        </select>

                        <select value={bulan} onChange={event => changeMonth(event.target.value)} className={`${fieldClass} lg:w-44`}>
                            {bulanOptions.map((name, index) => {
                                const value = String(index + 1).padStart(2, '0');
                                return <option key={value} value={value}>{name} {tahun}</option>;
                            })}
                        </select>

                        <button type="button" onClick={() => { setSearch(''); setFilterTim(''); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                            <RotateCcw size={15} />
                            Reset
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1060px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Pegawai</th>
                                    <th className="px-4 py-3">Kegiatan Translok</th>
                                    <th className="px-4 py-3">Periode</th>
                                    <th className="px-4 py-3 text-right">Volume</th>
                                    <th className="px-4 py-3 text-right">Estimasi Anggaran</th>
                                    <th className="px-4 py-3 text-center">Realisasi</th>
                                    {canManage && <th className="px-4 py-3 text-center">Aksi</th>}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={canManage ? 7 : 6} className="px-4 py-14 text-center text-sm text-slate-400">
                                            Belum ada alokasi pada bulan ini.
                                        </td>
                                    </tr>
                                ) : filtered.map(item => (
                                    <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800">{item.nama}</p>
                                            <p className="mt-1 text-xs text-slate-400">{item.nip_lama}</p>
                                        </td>
                                        <td className="max-w-sm px-4 py-3">
                                            <p className="font-medium leading-relaxed text-slate-800">{item.translok || '-'}</p>
                                            <p className="mt-1 text-xs text-slate-400">Kode {item.kd_translok || '-'} · Tim {item.tim || '-'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="whitespace-nowrap text-slate-700">{dateLabel(item.jadwal_a)}</span>
                                            <p className="mt-1 whitespace-nowrap text-xs text-slate-400">s.d. {dateLabel(item.jadwal_b)}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">{number(item.vol)}</td>
                                        <td className="px-4 py-3 text-right tabular-nums">{money(item.vol * item.rate)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.jumlah_detail} / {item.vol}</span>
                                        </td>
                                        {canManage && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button type="button" onClick={() => openEdit(item)} title="Edit Alokasi" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button type="button" onClick={() => { setDeleteError(''); setDeleting(item); }} title="Hapus Alokasi" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                        Menampilkan {filtered.length} dari {alokasi.length} alokasi
                    </div>
                </div>
            </div>

            {open && canManage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">{editing ? 'Edit Alokasi Translok' : 'Tambah Alokasi Translok'}</h2>
                                <p className="mt-1 text-xs text-slate-500">{bulanOptions[Number(bulan) - 1]} {tahun}</p>
                            </div>
                            <button type="button" disabled={processing} onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4 overflow-y-auto p-5">
                            <div>
                                <label className={labelClass}>Kegiatan Translok</label>
                                <select required disabled={Boolean(editing)} value={data.id_translok} onChange={event => setData('id_translok', event.target.value)} className={fieldClass}>
                                    <option value="">Pilih kegiatan Translok</option>
                                    {masters.filter(item => item.sisa > 0 || item.id === data.id_translok).map(item => (
                                        <option key={item.id} value={item.id}>
                                            [{item.kode}] {item.nama} — Sisa {number(item.sisa)} {item.satuan}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_translok && <p className="mt-1 text-xs text-red-600">{errors.id_translok}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Pegawai</label>
                                <select required disabled={Boolean(editing)} value={data.nip_lama} onChange={event => setData('nip_lama', event.target.value)} className={fieldClass}>
                                    <option value="">Pilih pegawai</option>
                                    {pegawai.map(item => (
                                        <option key={item.nip_lama} value={item.nip_lama}>{item.nama} — {item.nip_lama}</option>
                                    ))}
                                </select>
                                {errors.nip_lama && <p className="mt-1 text-xs text-red-600">{errors.nip_lama}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className={labelClass}>Tanggal Mulai</label>
                                    <input type="date" required value={data.jadwal_a} onChange={event => setData('jadwal_a', event.target.value)} className={fieldClass} />
                                    {errors.jadwal_a && <p className="mt-1 text-xs text-red-600">{errors.jadwal_a}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Tanggal Selesai</label>
                                    <input type="date" required min={data.jadwal_a || undefined} value={data.jadwal_b} onChange={event => setData('jadwal_b', event.target.value)} className={fieldClass} />
                                    {errors.jadwal_b && <p className="mt-1 text-xs text-red-600">{errors.jadwal_b}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Volume Alokasi</label>
                                    <input type="number" required min="1" step="1" value={data.vol} onChange={event => setData('vol', event.target.value)} className={fieldClass} />
                                    {errors.vol && <p className="mt-1 text-xs text-red-600">{errors.vol}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
                                {[
                                    ['Sisa Volume Master', number(maxMaster)],
                                    ['Kuota Pegawai', `${number(maxPegawai)} tersisa`],
                                    ['Estimasi Anggaran', money(Number(data.vol) * Number(selectedMaster?.rate || 0))],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <p className="text-xs text-slate-500">{label}</p>
                                        <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {(Number(data.vol) > maxMaster || Number(data.vol) > maxPegawai) && selectedMaster && (
                                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                                    <AlertTriangle size={16} className="shrink-0" />
                                    Volume melebihi sisa Master atau kuota pegawai.
                                </div>
                            )}

                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                                    {Object.values(errors).join(' ')}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button type="button" disabled={processing} onClick={close} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing || !selectedMaster || Number(data.vol) > maxMaster || Number(data.vol) > maxPegawai} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                                    {processing ? 'Menyimpan...' : 'Simpan Alokasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleting && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-center gap-2 text-red-600">
                            <AlertTriangle size={20} />
                            <h2 className="text-base font-bold text-slate-900">Hapus Alokasi?</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Alokasi milik <strong>{deleting.nama}</strong> akan dihapus dan volume dikembalikan ke Master Translok.
                        </p>
                        {deleting.jumlah_detail > 0 && (
                            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                Alokasi ini sudah memiliki {deleting.jumlah_detail} detail perjalanan sehingga tidak dapat dihapus.
                            </p>
                        )}
                        {deleteError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{deleteError}</p>}
                        <div className="mt-5 flex justify-end gap-2">
                            <button type="button" disabled={deleteProcessing} onClick={() => setDeleting(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">
                                Batal
                            </button>
                            <button type="button" disabled={deleteProcessing || deleting.jumlah_detail > 0} onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                                {deleteProcessing ? 'Menghapus...' : 'Hapus Alokasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
