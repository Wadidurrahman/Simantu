
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    CalendarRange,
    Clock3,
    Pencil,
    Plus,
    Trash2,
    X,
    AlertTriangle,
    CalendarOff,
} from 'lucide-react';

const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-slate-500 focus:ring-slate-100';

const datePart = value => String(value || '').slice(0, 10);
const timePart = value => String(value || '').slice(11, 16);

const displayDate = value => datePart(value)
    ? new Date(`${datePart(value)}T00:00:00`).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
    : '-';

const initial = {
    date_start: '',
    date_end: '',
    time_start: '08:00',
    time_end: '16:00',
    deadline: '',
    description: '',
};

export default function Index({
    windows = [],
    legacyOff = [],
    tahun,
    bulan,
    canManage = false,
}) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deletingBusy, setDeletingBusy] = useState(false);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        clearErrors,
    } = useForm(initial);

    const showAdd = () => {
        setEditing(null);
        clearErrors();
        setData({ ...initial });
        setOpen(true);
    };

    const showEdit = item => {
        setEditing(item.id);
        clearErrors();

        setData({
            date_start: datePart(item.date_start),
            date_end: datePart(item.date_end),
            time_start: String(item.time_start).slice(0, 5),
            time_end: String(item.time_end).slice(0, 5),
            deadline: `${datePart(item.deadline)} ${timePart(item.deadline)}`,
            description: item.description,
        });

        setOpen(true);
    };

    const save = event => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setEditing(null);
            },
        };

        if (editing === null) {
            post(route('translok.off.window.store'), options);
        } else {
            put(route('translok.off.window.update', editing), options);
        }
    };

    const remove = () => {
        if (!deleting || deletingBusy) return;

        setDeletingBusy(true);
        setDeleteError('');

        router.delete(route('translok.off.window.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
            onError: response => {
                setDeleteError(
                    Object.values(response || {}).join(' ') ||
                    'Tidak dapat menghapus periode.'
                );
            },
            onFinish: () => setDeletingBusy(false),
        });
    };

    const changeMonth = value => {
        router.get(
            route('translok.off'),
            { bulan: value },
            {
                preserveState: false,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Jadwal Translok" />

            <div className="space-y-5 pb-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Tanggal Off & Periode Booking
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola tanggal tersedia, jam operasional, dan deadline pemesanan.
                        </p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={showAdd}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Plus size={16} />
                            Buat Periode
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <CalendarRange size={17} />
                        Periode {months[Number(bulan) - 1]} {tahun}
                    </div>

                    <select
                        value={bulan}
                        onChange={event => changeMonth(event.target.value)}
                        className={`${field} w-44`}
                    >
                        {months.map((month, index) => (
                            <option
                                key={month}
                                value={String(index + 1).padStart(2, '0')}
                            >
                                {month}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {[
                        ['Periode Terdaftar', windows.length],
                        ['Periode Aktif', windows.filter(window => window.active).length],
                        ['Tanggal Off Historis', legacyOff.length],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                            <p className="text-xs text-slate-500">
                                {label}
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 p-4">
                        <h2 className="text-sm font-bold">
                            Daftar Periode Booking
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Slot satu jam, maksimal satu pegawai per tanggal dan jam.
                        </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {windows.length === 0 && (
                            <p className="p-10 text-center text-sm text-slate-500">
                                Belum ada periode booking. Buat periode untuk membuka pilihan jadwal.
                            </p>
                        )}

                        {windows.map(window => (
                            <div
                                key={window.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="space-y-1">
                                    <p className="font-semibold text-slate-900">
                                        {displayDate(window.date_start)}
                                        {' – '}
                                        {displayDate(window.date_end)}
                                    </p>

                                    <p className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock3 size={14} />
                                        {String(window.time_start).slice(0, 5)}
                                        {' – '}
                                        {String(window.time_end).slice(0, 5)} WIB
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Deadline booking: {datePart(window.deadline)}
                                        {' '}
                                        {timePart(window.deadline)} WIB
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {window.description}
                                    </p>
                                </div>

                                {canManage && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => showEdit(window)}
                                            title="Edit periode"
                                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleting(window);
                                                setDeleteError('');
                                            }}
                                            title="Hapus periode"
                                            className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <CalendarOff size={17} />
                        Tanggal Off Lama
                    </div>

                    {legacyOff.length ? (
                        <div className="flex flex-wrap gap-2">
                            {legacyOff.map(item => (
                                <div
                                    key={item.tgl}
                                    className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
                                >
                                    {displayDate(item.tgl)} · {item.ket}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            Tidak ada Tanggal Off historis pada bulan ini.
                        </p>
                    )}
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm">
                    <div className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    {editing === null
                                        ? 'Buat Periode Booking'
                                        : 'Ubah Periode Booking'}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Rentang tanggal, jam, dan deadline
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={processing}
                                className="rounded-lg p-2 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={save} className="space-y-4 p-4">
                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-xs font-semibold text-slate-700">
                                    Tanggal Mulai
                                    <input
                                        required
                                        type="date"
                                        min={`${tahun}-01-01`}
                                        max={`${tahun}-12-31`}
                                        value={data.date_start}
                                        onChange={event => setData('date_start', event.target.value)}
                                        className={`${field} mt-1`}
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-700">
                                    Tanggal Akhir
                                    <input
                                        required
                                        type="date"
                                        min={data.date_start || `${tahun}-01-01`}
                                        max={`${tahun}-12-31`}
                                        value={data.date_end}
                                        onChange={event => setData('date_end', event.target.value)}
                                        className={`${field} mt-1`}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-xs font-semibold text-slate-700">
                                    Jam Mulai
                                    <input
                                        required
                                        type="time"
                                        step="3600"
                                        value={data.time_start}
                                        onChange={event => setData('time_start', event.target.value)}
                                        className={`${field} mt-1`}
                                    />
                                </label>

                                <label className="text-xs font-semibold text-slate-700">
                                    Jam Akhir
                                    <input
                                        required
                                        type="time"
                                        step="3600"
                                        value={data.time_end}
                                        onChange={event => setData('time_end', event.target.value)}
                                        className={`${field} mt-1`}
                                    />
                                </label>
                            </div>

                            <label className="block text-xs font-semibold text-slate-700">
                                Deadline Pemesanan
                                <input
                                    required
                                    type="datetime-local"
                                    value={data.deadline.replace(' ', 'T')}
                                    onChange={event =>
                                        setData('deadline', event.target.value.replace('T', ' '))
                                    }
                                    className={`${field} mt-1`}
                                />
                            </label>

                            <label className="block text-xs font-semibold text-slate-700">
                                Keterangan
                                <textarea
                                    required
                                    maxLength={255}
                                    rows={2}
                                    value={data.description}
                                    onChange={event => setData('description', event.target.value)}
                                    placeholder="Contoh: Periode pemilihan perjalanan dinas"
                                    className={`${field} mt-1 resize-none`}
                                />
                            </label>

                            {Object.keys(errors).length > 0 && (
                                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                    {Object.values(errors).join(' ')}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    disabled={processing}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Periode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleting && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5">
                        <div className="flex items-center gap-2 font-bold">
                            <AlertTriangle size={18} className="text-red-600" />
                            Hapus periode?
                        </div>

                        <p className="mt-3 text-sm text-slate-600">
                            Periode yang sudah digunakan untuk booking tidak dapat dihapus.
                        </p>

                        {deleteError && (
                            <p className="mt-3 text-xs text-red-600">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={deletingBusy}
                                onClick={() => setDeleting(null)}
                                className="rounded-lg border px-4 py-2 text-sm"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={deletingBusy}
                                onClick={remove}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
