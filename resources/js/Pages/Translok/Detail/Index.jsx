import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    CalendarPlus,
    Clock3,
    Search,
    Trash2,
    X,
    AlertTriangle,
    RefreshCcw,
    Loader2,
} from 'lucide-react';

const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const dateText = value => value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
    : '-';

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-slate-400 focus:ring-slate-100';

export default function Index({ alokasi = [], tahun, bulan, canManage = false }) {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [cancelItem, setCancelItem] = useState(null);
    const [cancelError, setCancelError] = useState('');
    const [cancelBusy, setCancelBusy] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        translok_alokasi_id: '',
        tanggal: '',
        catatan: '',
    });

    const items = Array.isArray(alokasi) ? alokasi : [];
    const selected = items.find(item => item.id === selectedId) || null;

    const filtered = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter(item =>
            [item.nama, item.uraian, item.nip, item.kd_translok]
                .some(value => String(value || '').toLowerCase().includes(keyword))
        );
    }, [items, search]);

    const dateLookup = useMemo(
        () => new Map(availability.map(item => [item.date, item.taken])),
        [availability]
    );

    const firstDay = new Date(Number(tahun), Number(bulan) - 1, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const countDays = new Date(Number(tahun), Number(bulan), 0).getDate();

    const days = [
        ...Array(offset).fill(null),
        ...Array.from({ length: countDays }, (_, index) => index + 1),
    ];

    const remaining = selected
        ? Number(selected.volume) - Number(selected.jumlah_detail)
        : 0;

    const refresh = async id => {
        setLoading(true);
        setLoadError('');

        try {
            const url = new URL(
                route('translok.detail.availability'),
                window.location.origin
            );

            url.searchParams.set('translok_alokasi_id', id);

            const response = await fetch(url.toString(), {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal memuat ketersediaan tanggal.');
            }

            const result = await response.json();

            setAvailability(result.dates || []);
        } catch (error) {
            setAvailability([]);
            setLoadError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const showModal = item => {
        setSelectedId(item.id);
        setSelectedDate('');
        clearErrors();

        setData({
            translok_alokasi_id: item.id,
            tanggal: '',
            catatan: '',
        });

        refresh(item.id);
    };

    const closeModal = () => {
        if (processing) return;

        setSelectedId(null);
        setAvailability([]);
        setSelectedDate('');
        clearErrors();
    };

    const chooseDate = date => {
        setSelectedDate(date);

        setData({
            translok_alokasi_id: selected.id,
            tanggal: date,
            catatan: selected.uraian || '',
        });
    };

    const book = event => {
        event.preventDefault();

        if (!selected || !selectedDate || remaining <= 0) {
            return;
        }

        post(route('translok.detail.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedId(null);
                setAvailability([]);
                setSelectedDate('');
            },
            onError: () => refresh(selected.id),
        });
    };

    const cancel = () => {
        if (!cancelItem || cancelBusy) return;

        setCancelBusy(true);
        setCancelError('');

        router.delete(route('translok.detail.destroy', cancelItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setCancelItem(null);
                setSelectedId(null);
            },
            onError: response => {
                setCancelError(
                    Object.values(response || {}).join(' ') ||
                    'Gagal membatalkan detail.'
                );
            },
            onFinish: () => setCancelBusy(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Detail Perjalanan" />

            <div className="space-y-5 pb-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Detail Perjalanan
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pilih tanggal pelaksanaan perjalanan dinas pegawai tahun {tahun}
                        </p>
                    </div>

                    <select
                        value={bulan}
                        onChange={event => router.get(
                            route('translok.detail.index'),
                            { bulan: event.target.value },
                            { preserveScroll: true }
                        )}
                        className={`${field} w-48`}
                    >
                        {months.map((month, index) => (
                            <option key={month} value={String(index + 1).padStart(2, '0')}>
                                {month} {tahun}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {[
                        ['Total Alokasi', items.length],
                        ['Total Volume', items.reduce((sum, item) => sum + Number(item.volume), 0)],
                        ['Realisasi Tercatat', items.reduce((sum, item) => sum + Number(item.jumlah_detail), 0)],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="relative border-b border-slate-100 p-4">
                        <Search
                            size={16}
                            className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Cari pegawai atau kegiatan Translok..."
                            className={`${field} pl-10`}
                        />
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filtered.length === 0 && (
                            <p className="p-10 text-center text-sm text-slate-400">
                                Belum ada alokasi pada bulan ini.
                            </p>
                        )}

                        {filtered.map(item => (
                            <div
                                key={item.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900">
                                        {item.nama} <span className="text-xs font-normal text-slate-400">({item.nip})</span>
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {item.uraian} <span className="text-xs font-semibold text-slate-400">[{item.kd_translok}]</span>
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Periode: {dateText(item.tanggal_mulai)} s.d. {dateText(item.tanggal_selesai)}
                                        {' · '}Realisasi: {item.jumlah_detail} / {item.volume} volume
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => showModal(item)}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <CalendarPlus size={16} />
                                    Pilih Tanggal
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm">
                    <div className="flex max-h-[94vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-100 p-4">
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Pilih Tanggal Perjalanan Dinas
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {selected.nama} · Sisa kuota: {Math.max(0, remaining)} volume
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={closeModal}
                                className="rounded-lg p-2 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 overflow-y-auto p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">
                                    Kalender {months[Number(bulan) - 1]} {tahun}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => refresh(selected.id)}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
                                >
                                    <RefreshCcw size={14} />
                                    Muat Ulang
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {weekdays.map(day => (
                                    <span
                                        key={day}
                                        className="py-2 text-center text-xs font-semibold text-slate-400"
                                    >
                                        {day}
                                    </span>
                                ))}

                                {days.map((day, index) => {
                                    if (!day) {
                                        return <span key={`blank-${index}`} />;
                                    }

                                    const date = `${tahun}-${bulan}-${String(day).padStart(2, '0')}`;
                                    const isTaken = dateLookup.get(date) || false;
                                    const isWeekend = index % 7 >= 5; // Sabtu & Minggu
                                    const enabled = !isWeekend && !isTaken && remaining > 0;

                                    return (
                                        <button
                                            type="button"
                                            key={date}
                                            disabled={!enabled || loading}
                                            onClick={() => chooseDate(date)}
                                            className={`aspect-square rounded-xl border text-sm font-semibold transition ${
                                                selectedDate === date
                                                    ? 'border-slate-900 bg-slate-900 text-white'
                                                    : enabled
                                                    ? 'border-slate-200 text-slate-800 hover:bg-slate-100'
                                                    : 'border-slate-100 bg-slate-50 text-slate-300'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            {loadError && (
                                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                    {loadError}
                                </p>
                            )}

                            {Object.keys(errors).length > 0 && (
                                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                    {Object.values(errors).join(' ')}
                                </p>
                            )}

                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="mb-2 text-xs font-bold text-slate-500">
                                    Daftar Tanggal Perjalanan Tercatat
                                </h3>

                                <div className="space-y-2">
                                    {(selected.details || []).length ? (
                                        selected.details.map(detail => (
                                            <div
                                                key={detail.id}
                                                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                                            >
                                                <div className="text-xs">
                                                    <span className="font-semibold text-slate-800">
                                                        {dateText(detail.tanggal)}
                                                    </span>
                                                    {detail.catatan && (
                                                        <span className="ml-2 text-slate-500">
                                                            ({detail.catatan})
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCancelItem(detail);
                                                        setCancelError('');
                                                    }}
                                                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                    title="Batalkan Tanggal"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400">
                                            Belum ada tanggal perjalanan yang dipilih pada bulan ini.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={book}
                            className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white p-4"
                        >
                            <p className="text-xs text-slate-500">
                                {selectedDate
                                    ? `Dipilih: ${dateText(selectedDate)}`
                                    : 'Belum memilih tanggal'}
                            </p>

                            <button
                                type="submit"
                                disabled={
                                    !selectedDate ||
                                    processing ||
                                    loading ||
                                    remaining <= 0
                                }
                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perjalanan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {cancelItem && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                        <h2 className="flex items-center gap-2 font-bold text-slate-900">
                            <AlertTriangle size={18} className="text-red-600" />
                            Batalkan Tanggal Perjalanan?
                        </h2>

                        <p className="mt-3 text-sm text-slate-600">
                            Tanggal <strong>{dateText(cancelItem.tanggal)}</strong> akan dihapus dan volume alokasi akan dikembalikan.
                        </p>

                        {cancelError && (
                            <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-600">
                                {cancelError}
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={cancelBusy}
                                onClick={() => setCancelItem(null)}
                                className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                                Kembali
                            </button>

                            <button
                                type="button"
                                disabled={cancelBusy}
                                onClick={cancel}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {cancelBusy ? 'Memproses...' : 'Ya, Batalkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
