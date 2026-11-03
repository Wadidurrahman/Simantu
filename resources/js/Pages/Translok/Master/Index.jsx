
import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Calculator,
    Search,
    Wallet,
    Layers,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    Filter,
} from 'lucide-react';

const formatNumber = (value) =>
    new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);

const formatCurrency = (value) => `Rp ${formatNumber(value)}`;

const emptyForm = {
    tim: '',
    translok: '',
    vol_awal: '',
    satuan: 'O-K',
    rate: '',
};

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700';

export default function Index({
    giat = [],
    tahun,
    canManage = false,
}) {
    const [search, setSearch] = useState('');
    const [filterTim, setFilterTim] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        clearErrors,
    } = useForm(emptyForm);

    const masters = useMemo(
        () => (Array.isArray(giat) ? giat : []),
        [giat]
    );

    const timOptions = useMemo(
        () => [
            ...new Set(
                masters.map((item) => item.tim).filter(Boolean)
            ),
        ].sort(),
        [masters]
    );

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return masters.filter((item) => {
            const matchTim =
                !filterTim || String(item.tim) === filterTim;

            const matchSearch =
                !keyword ||
                [
                    item.id,
                    item.kd_translok,
                    item.translok,
                    item.tim,
                    item.satuan,
                ].some((value) =>
                    String(value ?? '')
                        .toLowerCase()
                        .includes(keyword)
                );

            return matchTim && matchSearch;
        });
    }, [masters, search, filterTim]);

    const statistics = useMemo(
        () => ({
            total: filtered.length,
            anggaran: filtered.reduce(
                (sum, item) =>
                    sum + Number(item.jml_anggaran || 0),
                0
            ),
            sisaAnggaran: filtered.reduce(
                (sum, item) =>
                    sum + Number(item.sisa_anggaran || 0),
                0
            ),
            volumeAlokasi: filtered.reduce(
                (sum, item) =>
                    sum + Number(item.volume_alokasi || 0),
                0
            ),
        }),
        [filtered]
    );

    const selected = useMemo(
        () => masters.find((item) => item.id === editing),
        [masters, editing]
    );

    const calculation = useMemo(() => {
        const volume = Number(data.vol_awal) || 0;
        const rate = Number(data.rate) || 0;
        const allocated =
            Number(selected?.volume_alokasi) || 0;
        const remaining = volume - allocated;

        return {
            anggaran: volume * rate,
            allocated,
            remaining,
            sisaAnggaran: remaining * rate,
        };
    }, [data.vol_awal, data.rate, selected]);

    const showAdd = () => {
        setEditing(null);
        clearErrors();
        setData({ ...emptyForm });
        setModalOpen(true);
    };

    const showEdit = (item) => {
        setEditing(item.id);
        clearErrors();

        setData({
            tim: item.tim || '',
            translok: item.translok || '',
            vol_awal: item.vol_awal,
            satuan: item.satuan || '',
            rate: item.rate,
        });

        setModalOpen(true);
    };

    const closeModal = () => {
        if (processing) return;

        setModalOpen(false);
        setEditing(null);
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                setEditing(null);
                clearErrors();
            },
        };

        if (editing !== null) {
            put(
                route('translok.master.update', editing),
                options
            );
        } else {
            post(
                route('translok.master.store'),
                options
            );
        }
    };

    const remove = () => {
        if (!deleting || deleteProcessing) return;

        setDeleteProcessing(true);
        setDeleteError('');

        router.delete(
            route('translok.master.destroy', deleting.id),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
                onError: (response) =>
                    setDeleteError(
                        Object.values(response || {}).join(' ') ||
                        'Gagal menghapus Master Translok.'
                    ),
                onFinish: () => setDeleteProcessing(false),
            }
        );
    };

    const resetFilter = () => {
        setSearch('');
        setFilterTim('');
    };

    const cards = [
        {
            label: 'Total Master',
            value: formatNumber(statistics.total),
            icon: Layers,
        },
        {
            label: 'Total Anggaran',
            value: formatCurrency(statistics.anggaran),
            icon: Wallet,
        },
        {
            label: 'Sisa Anggaran',
            value: formatCurrency(statistics.sisaAnggaran),
            icon: Calculator,
        },
        {
            label: 'Volume Teralokasi',
            value: formatNumber(statistics.volumeAlokasi),
            icon: CheckCircle2,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`Master Translok ${tahun}`} />

            <div className="space-y-5 pb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Master Translok
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Pengelolaan volume dan anggaran perjalanan dinas tahun {tahun}
                        </p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={showAdd}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
                        >
                            <Plus size={16} />
                            Tambah Translok
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-medium text-slate-500">
                                        {card.label}
                                    </p>

                                    <Icon
                                        size={17}
                                        className="text-slate-400"
                                    />
                                </div>

                                <p className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                                    {card.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <Filter size={16} />
                            Daftar Master Translok
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative sm:w-72">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari kegiatan atau kode..."
                                    className={`${inputClass} pl-10`}
                                />
                            </div>

                            <select
                                value={filterTim}
                                onChange={(event) =>
                                    setFilterTim(event.target.value)
                                }
                                className={`${inputClass} sm:w-36`}
                            >
                                <option value="">Semua Tim</option>

                                {timOptions.map((value) => (
                                    <option key={value} value={value}>
                                        Tim {value}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={resetFilter}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                <RotateCcw size={14} />
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1080px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">
                                        Kegiatan Translok
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Volume Awal
                                    </th>
                                    <th className="px-4 py-3">
                                        Satuan
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Rate
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Anggaran
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Teralokasi
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Sisa Volume
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Sisa Anggaran
                                    </th>
                                    {canManage && (
                                        <th className="px-4 py-3 text-center">
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={canManage ? 9 : 8}
                                            className="px-4 py-14 text-center text-sm text-slate-400"
                                        >
                                            Tidak ada data Master Translok pada tahun {tahun}.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition-colors hover:bg-slate-50/80"
                                        >
                                            <td className="max-w-sm px-4 py-3">
                                                <p className="font-medium leading-relaxed text-slate-800">
                                                    {item.translok || '-'}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Kode {item.kd_translok || '-'} · Tim {item.tim || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatNumber(item.vol_awal)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {item.satuan || '-'}
                                            </td>

                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatNumber(item.rate)}
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                                                {formatNumber(item.jml_anggaran)}
                                            </td>

                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatNumber(item.volume_alokasi)}
                                            </td>

                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatNumber(item.sisa_vol)}
                                            </td>

                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {formatNumber(item.sisa_anggaran)}
                                            </td>

                                            {canManage && (
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                showEdit(item)
                                                            }
                                                            title="Edit Master"
                                                            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDeleteError('');
                                                                setDeleting(item);
                                                            }}
                                                            title="Hapus Master"
                                                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                        <p className="text-xs text-slate-500">
                            Menampilkan {filtered.length} dari {masters.length} data
                        </p>

                        <p className="text-xs font-medium text-slate-500">
                            Tahun {tahun}
                        </p>
                    </div>
                </div>
            </div>

            {modalOpen && canManage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    {editing === null
                                        ? 'Tambah Master Translok'
                                        : 'Edit Master Translok'}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Tahun anggaran {tahun}
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            className="space-y-4 overflow-y-auto p-5"
                        >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Kode Tim
                                    </label>

                                    <input
                                        required
                                        maxLength={2}
                                        disabled={editing !== null}
                                        value={data.tim}
                                        onChange={(event) =>
                                            setData('tim', event.target.value)
                                        }
                                        placeholder="Contoh: 02"
                                        className={inputClass}
                                    />

                                    {errors.tim && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.tim}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Satuan
                                    </label>

                                    <input
                                        required
                                        maxLength={100}
                                        disabled={editing !== null}
                                        value={data.satuan}
                                        onChange={(event) =>
                                            setData('satuan', event.target.value)
                                        }
                                        placeholder="Contoh: O-K"
                                        className={inputClass}
                                    />

                                    {errors.satuan && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.satuan}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Uraian Perjalanan Dinas
                                </label>

                                <textarea
                                    required
                                    rows={3}
                                    maxLength={255}
                                    disabled={editing !== null}
                                    value={data.translok}
                                    onChange={(event) =>
                                        setData('translok', event.target.value)
                                    }
                                    placeholder="Masukkan uraian kegiatan perjalanan dinas..."
                                    className={`${inputClass} resize-none`}
                                />

                                {errors.translok && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.translok}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Volume Awal
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        value={data.vol_awal}
                                        onChange={(event) =>
                                            setData('vol_awal', event.target.value)
                                        }
                                        className={inputClass}
                                    />

                                    {errors.vol_awal && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.vol_awal}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Rate (Rp)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={data.rate}
                                        onChange={(event) =>
                                            setData('rate', event.target.value)
                                        }
                                        className={inputClass}
                                    />

                                    {errors.rate && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.rate}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                                    <Calculator size={15} />
                                    Pratinjau Anggaran
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        ['Total Anggaran', formatCurrency(calculation.anggaran)],
                                        ['Volume Teralokasi', formatNumber(calculation.allocated)],
                                        ['Sisa Volume', formatNumber(calculation.remaining)],
                                        ['Sisa Anggaran', formatCurrency(calculation.sisaAnggaran)],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <p className="text-xs text-slate-500">
                                                {label}
                                            </p>

                                            <p className={`mt-1 text-sm font-bold ${
                                                calculation.remaining < 0
                                                    ? 'text-red-600'
                                                    : 'text-slate-900'
                                            }`}>
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {calculation.remaining < 0 && (
                                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                                    <AlertTriangle size={16} />
                                    Volume awal tidak boleh lebih kecil daripada total alokasi.
                                </div>
                            )}

                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                                    {Object.values(errors).join(' ')}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={closeModal}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing || calculation.remaining < 0}
                                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleting && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-3 flex items-center gap-2 text-red-600">
                            <AlertTriangle size={20} />
                            <h2 className="text-base font-bold text-slate-900">
                                Hapus Master Translok?
                            </h2>
                        </div>

                        <p className="text-sm leading-relaxed text-slate-600">
                            Kegiatan <strong>{deleting.kd_translok}</strong> akan dihapus.
                            Master yang sudah memiliki alokasi atau detail perjalanan
                            tidak dapat dihapus.
                        </p>

                        {deleteError && (
                            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={deleteProcessing}
                                onClick={() => setDeleting(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={deleteProcessing}
                                onClick={remove}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteProcessing ? 'Menghapus...' : 'Hapus Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
