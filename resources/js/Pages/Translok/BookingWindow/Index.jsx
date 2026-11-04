import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Plus, Pencil, Trash2, CalendarClock, Clock, ShieldCheck } from 'lucide-react';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100';

const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700';

export default function Index({ windows = [], tims = [], tahun }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        tim_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        jam_mulai: '08:00',
        jam_selesai: '16:00',
    });

    const openCreateModal = () => {
        setEditingId(null);
        clearErrors();
        reset();
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        clearErrors();
        setData({
            tim_id: item.tim_id,
            tanggal_mulai: item.tanggal_mulai,
            tanggal_selesai: item.tanggal_selesai,
            jam_mulai: item.jam_mulai,
            jam_selesai: item.jam_selesai,
        });
        setModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('booking-window.update', editingId), {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post(route('booking-window.store'), {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const remove = (id) => {
        if (confirm('Yakin ingin menghapus pengaturan rentang waktu ini?')) {
            destroy(route('booking-window.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Kalender & Jam" />

            <div className="space-y-5 pb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Pengaturan Kalender & Jam Akses
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Batasi rentang tanggal dan jam pengisian tugas/translok bagi anggota tim.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800"
                    >
                        <Plus size={16} />
                        Atur Rentang Waktu
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Tim</th>
                                    <th className="px-4 py-3">Tanggal Mulai</th>
                                    <th className="px-4 py-3">Tanggal Selesai</th>
                                    <th className="px-4 py-3">Jam Operasional</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {windows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                                            Belum ada pengaturan rentang waktu kalender yang dibuat.
                                        </td>
                                    </tr>
                                ) : (
                                    windows.map((item) => (
                                        <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                Tim {item.tim?.nama || item.tim_id}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{item.tanggal_mulai}</td>
                                            <td className="px-4 py-3 text-slate-600">{item.tanggal_selesai}</td>
                                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                                                {item.jam_mulai} - {item.jam_selesai}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => remove(item.id)}
                                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <h2 className="text-base font-bold text-slate-900">
                        {editingId ? 'Edit Rentang Kalender & Jam' : 'Tambah Rentang Kalender & Jam'}
                    </h2>

                    <div>
                        <label className={labelClass}>Pilih Tim</label>
                        <select
                            value={data.tim_id}
                            onChange={(e) => setData('tim_id', e.target.value)}
                            className={inputClass}
                            required
                        >
                            <option value="">-- Pilih Tim --</option>
                            {tims.map((t) => (
                                <option key={t.id} value={t.id}>
                                    Tim {t.nama || t.id}
                                </option>
                            ))}
                        </select>
                        {errors.tim_id && <p className="mt-1 text-xs text-red-600">{errors.tim_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Tanggal Mulai</label>
                            <input
                                type="date"
                                value={data.tanggal_mulai}
                                onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Tanggal Selesai</label>
                            <input
                                type="date"
                                value={data.tanggal_selesai}
                                onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Jam Mulai</label>
                            <input
                                type="time"
                                value={data.jam_mulai}
                                onChange={(e) => setData('jam_mulai', e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Jam Selesai</label>
                            <input
                                type="time"
                                value={data.jam_selesai}
                                onChange={(e) => setData('jam_selesai', e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
