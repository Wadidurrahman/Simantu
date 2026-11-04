import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CalendarRange, CalendarClock, Plus, Trash2, X, CheckCircle2, CalendarPlus } from 'lucide-react';

const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500';
const labelClass = 'mb-1 block text-xs font-semibold text-slate-700';

export default function Index({ windows = [], legacyOff = [], mySlots = [], tahun, bulan, canManage = false }) {
    const [openModalWindow, setOpenModalWindow] = useState(false);
    const [openModalSlot, setOpenModalSlot] = useState(false);
    const [activeWindow, setActiveWindow] = useState(null);

    const windowForm = useForm({
        date_start: '',
        date_end: '',
        time_start: '08:00',
        time_end: '16:00',
        deadline: '',
        description: '',
    });

    const slotForm = useForm({
        window_id: '',
        tanggal: '',
        jam_mulai: '08:00',
        jam_selesai: '16:00',
    });

    const changeMonth = (val) => {
        router.get(route('translok.booking.index'), { bulan: val }, { preserveScroll: true, replace: true });
    };

    const submitWindow = (e) => {
        e.preventDefault();
        windowForm.post(route('translok.booking.window.store'), {
            onSuccess: () => {
                setOpenModalWindow(false);
                windowForm.reset();
            },
        });
    };

    const hapusWindow = (id) => {
        if (confirm('Yakin ingin menghapus periode ini? Pastikan belum ada pegawai yang booking.')) {
            router.delete(route('translok.booking.window.destroy', id), { preserveScroll: true });
        }
    };

    const bukaModalSlot = (windowItem) => {
        setActiveWindow(windowItem);
        slotForm.reset();
        slotForm.clearErrors();
        slotForm.setData({
            window_id: windowItem.id,
            tanggal: windowItem.date_start,
            jam_mulai: windowItem.time_start.substring(0, 5),
            jam_selesai: windowItem.time_end.substring(0, 5),
        });
        setOpenModalSlot(true);
    };

    const submitSlot = (e) => {
        e.preventDefault();
        slotForm.post(route('translok.booking.slot.store'), {
            onSuccess: () => {
                setOpenModalSlot(false);
                slotForm.reset();
                setActiveWindow(null);
            },
        });
    };

    const hapusSlot = (id) => {
        if (confirm('Yakin ingin membatalkan jadwal perjalanan dinas ini?')) {
            router.delete(route('translok.booking.slot.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Jadwal & Periode Booking Translok" />

            <div className="space-y-5 pb-8 relative z-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Jadwal & Periode Booking Translok</h1>
                        <p className="mt-1 text-sm text-slate-500">Kelola tanggal off, rentang waktu, dan pemilihan jadwal perjalanan dinas.</p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() => { windowForm.clearErrors(); windowForm.reset(); setOpenModalWindow(true); }}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Plus size={16} /> Buat jadwal baru
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <CalendarRange size={17} /> Periode Bulan {months[Number(bulan) - 1]} {tahun}
                    </div>
                    <select value={bulan} onChange={(e) => changeMonth(e.target.value)} className={`${fieldClass} w-44`}>
                        {months.map((m, idx) => (
                            <option key={m} value={String(idx + 1).padStart(2, '0')}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <CalendarClock size={18} /> Daftar Periode & Jam Aktif
                        </h2>
                        
                        {windows.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4 text-center">Belum ada periode booking yang dibuka.</p>
                        ) : (
                            windows.map((w) => (
                                <div key={w.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900">{w.description}</p>
                                            <p className="text-xs text-slate-600 mt-1">Rentang: {w.date_start} s/d {w.date_end}</p>
                                            <p className="text-xs text-slate-600">Jam Operasional: {w.time_start.substring(0, 5)} - {w.time_end.substring(0, 5)}</p>
                                        </div>
                                        {canManage && (
                                            <button type="button" onClick={() => hapusWindow(w.id)} className="text-red-500 hover:text-red-700 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {!canManage && (
                                        <button 
                                            type="button" 
                                            onClick={() => bukaModalSlot(w)}
                                            className="mt-2 inline-flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                        >
                                            <CalendarPlus size={14} /> Pilih Jadwal pada Periode Ini
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <CheckCircle2 size={18} /> Jadwal Translok Pilihan Saya
                        </h2>
                        
                        {mySlots.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4 text-center">Anda belum memilih slot jadwal perjalanan dinas bulan ini.</p>
                        ) : (
                            mySlots.map((slot) => (
                                <div key={slot.id} className="p-4 rounded-xl border border-blue-200 bg-blue-50 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm text-blue-900">Tanggal: {slot.tanggal}</p>
                                        <p className="text-xs text-blue-700 mt-1">Pukul: {slot.jam_mulai.substring(0, 5)} s/d {slot.jam_selesai.substring(0, 5)}</p>
                                    </div>
                                    <button type="button" onClick={() => hapusSlot(slot.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition" title="Batalkan Jadwal">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {openModalWindow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <h2 className="font-bold text-slate-900">Buat Periode Booking Baru</h2>
                            <button type="button" onClick={() => setOpenModalWindow(false)} className="rounded-lg p-2 hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={submitWindow} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Tanggal Mulai</label>
                                    <input type="date" required value={windowForm.data.date_start} onChange={e => windowForm.setData('date_start', e.target.value)} className={fieldClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Tanggal Akhir</label>
                                    <input type="date" required value={windowForm.data.date_end} onChange={e => windowForm.setData('date_end', e.target.value)} className={fieldClass} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Jam Mulai (Cth: 08:00)</label>
                                    <input type="time" required step="3600" value={windowForm.data.time_start} onChange={e => windowForm.setData('time_start', e.target.value)} className={fieldClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Jam Selesai (Cth: 16:00)</label>
                                    <input type="time" required step="3600" value={windowForm.data.time_end} onChange={e => windowForm.setData('time_end', e.target.value)} className={fieldClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Batas Waktu Booking (Deadline)</label>
                                <input type="datetime-local" required value={windowForm.data.deadline} onChange={e => windowForm.setData('deadline', e.target.value)} className={fieldClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Keterangan</label>
                                <textarea required rows="2" value={windowForm.data.description} onChange={e => windowForm.setData('description', e.target.value)} placeholder="Contoh: Periode booking minggu pertama" className={`${fieldClass} resize-none`}></textarea>
                            </div>
                            {Object.keys(windowForm.errors).length > 0 && (
                                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{Object.values(windowForm.errors).join(', ')}</div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setOpenModalWindow(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                                <button type="submit" disabled={windowForm.processing} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">Simpan Periode</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openModalSlot && activeWindow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <h2 className="font-bold text-slate-900">Pilih Jadwal Translok</h2>
                            <button type="button" onClick={() => { setOpenModalSlot(false); setActiveWindow(null); }} className="rounded-lg p-2 hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={submitSlot} className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Pilih Tanggal</label>
                                <input 
                                    type="date" 
                                    required 
                                    min={activeWindow.date_start}
                                    max={activeWindow.date_end}
                                    value={slotForm.data.tanggal} 
                                    onChange={e => slotForm.setData('tanggal', e.target.value)} 
                                    className={fieldClass} 
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Pilih antara {activeWindow.date_start} s/d {activeWindow.date_end}.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Jam Mulai</label>
                                    <input 
                                        type="time" 
                                        required 
                                        step="3600" 
                                        min={activeWindow.time_start.substring(0, 5)}
                                        max={activeWindow.time_end.substring(0, 5)}
                                        value={slotForm.data.jam_mulai} 
                                        onChange={e => slotForm.setData('jam_mulai', e.target.value)} 
                                        className={fieldClass} 
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Jam Selesai</label>
                                    <input 
                                        type="time" 
                                        required 
                                        step="3600" 
                                        min={activeWindow.time_start.substring(0, 5)}
                                        max={activeWindow.time_end.substring(0, 5)}
                                        value={slotForm.data.jam_selesai} 
                                        onChange={e => slotForm.setData('jam_selesai', e.target.value)} 
                                        className={fieldClass} 
                                    />
                                </div>
                            </div>
                            {Object.keys(slotForm.errors).length > 0 && (
                                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{Object.values(slotForm.errors).join(', ')}</div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => { setOpenModalSlot(false); setActiveWindow(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                                <button type="submit" disabled={slotForm.processing} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Booking Jadwal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}