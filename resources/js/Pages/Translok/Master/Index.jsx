import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, X, Calculator, AlertCircle } from 'lucide-react';

export default function Index({ giat, tahun }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'

    // Format angka ke format Rupiah/Ribuan
    const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id_translok: '',
        kd_translok: '',
        translok: '',
        vol_a: 0,
        sat: '',
        rate: 0,
        jml_a: 0,
        r_v: 0,
        sisa_v: 0,
        sisa_a: 0,
    });

    // Auto-Kalkulasi (Menggantikan fungsi hitung() di JS lama)
    useEffect(() => {
        const volAwal = parseFloat(data.vol_a) || 0;
        const rateSatuan = parseFloat(data.rate) || 0;
        const realisasiVol = parseFloat(data.r_v) || 0;

        const jmlAnggaran = volAwal * rateSatuan;
        const sisaVolume = volAwal - realisasiVol;
        const sisaAnggaran = sisaVolume * rateSatuan;

        setData((prevData) => ({
            ...prevData,
            jml_a: jmlAnggaran,
            sisa_v: sisaVolume,
            sisa_a: sisaAnggaran,
        }));
    }, [data.vol_a, data.rate, data.r_v]);

    const openAddModal = () => {
        clearErrors();
        reset();
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        clearErrors();
        setData({
            id_translok: item.id_translok,
            kd_translok: item.kd_translok,
            translok: item.translok,
            vol_a: item.vol_a,
            sat: item.sat,
            rate: item.rate,
            jml_a: item.jml_a,
            r_v: item.r_v,
            sisa_v: item.sisa_v,
            sisa_a: item.sisa_a,
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => reset(), 300); // Reset form setelah animasi modal selesai
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('translok.master.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('translok.master.update', data.id_translok), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            destroy(route('translok.master.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Master Translok ${tahun}`} />

            {/* HEADER PAGE */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Master Translok</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Daftar Volume dan Rate Perjalanan Dinas Dalam Kota Tahun {tahun}
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Tambah Kegiatan
                </button>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">Kegiatan Translok</th>
                                <th className="px-6 py-4 font-bold text-right">Volume Awal</th>
                                <th className="px-6 py-4 font-bold">Satuan</th>
                                <th className="px-6 py-4 font-bold text-right">Rate (Rp)</th>
                                <th className="px-6 py-4 font-bold text-right">Total Anggaran (Rp)</th>
                                <th className="px-6 py-4 font-bold text-center w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {giat.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium">
                                        Tidak ada data kegiatan di tahun {tahun}.
                                    </td>
                                </tr>
                            ) : (
                                giat.map((keg) => (
                                    <tr key={keg.id_translok} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <span className="text-slate-400 mr-2">{keg.kd_translok}.</span>
                                            {keg.translok}
                                        </td>
                                        <td className="px-6 py-4 text-right">{formatNumber(keg.vol_a)}</td>
                                        <td className="px-6 py-4">{keg.sat}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(keg.rate)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700">{formatNumber(keg.jml_a)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(keg)}
                                                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(keg.id_translok)}
                                                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* MODAL FORM (ADD & EDIT) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh] animate-[slideDown_0.3s_ease-out]">

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {modalMode === 'add' ? 'Tambah Kegiatan Translok' : 'Edit Kegiatan Translok'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="translokForm" onSubmit={handleSubmit} className="space-y-5">

                                {modalMode === 'edit' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 uppercase">Kode Kegiatan</label>
                                            <input type="text" value={data.kd_translok} disabled className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase">Uraian Kegiatan <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.translok}
                                        onChange={e => setData('translok', e.target.value)}
                                        disabled={modalMode === 'edit'} // Sesuai legacy: readonly saat edit
                                        className={`w-full h-10 px-3 rounded-lg border text-sm font-medium focus:ring-4 outline-none transition-all ${
                                            modalMode === 'edit' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/10'
                                        }`}
                                        required
                                    />
                                    {errors.translok && <span className="text-xs text-red-500 font-medium">{errors.translok}</span>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Volume Awal <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={data.vol_a}
                                            onChange={e => setData('vol_a', e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            required
                                            min="0"
                                        />
                                        {errors.vol_a && <span className="text-xs text-red-500 font-medium">{errors.vol_a}</span>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Satuan <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={data.sat}
                                            onChange={e => setData('sat', e.target.value)}
                                            disabled={modalMode === 'edit'} // Sesuai legacy: readonly saat edit
                                            className={`w-full h-10 px-3 rounded-lg border text-sm font-medium focus:ring-4 outline-none transition-all ${
                                                modalMode === 'edit' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/10'
                                            }`}
                                            required
                                        />
                                        {errors.sat && <span className="text-xs text-red-500 font-medium">{errors.sat}</span>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Rate (Rp) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={data.rate}
                                            onChange={e => setData('rate', e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            required
                                            min="0"
                                        />
                                        {errors.rate && <span className="text-xs text-red-500 font-medium">{errors.rate}</span>}
                                    </div>
                                </div>

                                {/* KOTAK KALKULASI OTOMATIS */}
                                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mt-4 space-y-4">
                                    <h4 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
                                        <Calculator className="w-4 h-4" /> Pratinjau Kalkulasi Sistem
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Total Anggaran (Otomatis)</label>
                                            <input type="text" value={formatNumber(data.jml_a)} disabled className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-100 text-slate-700 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Realisasi Vol (Otomatis)</label>
                                            <input type="text" value={formatNumber(data.r_v)} disabled className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-100 text-slate-700 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Sisa Volume (Otomatis)</label>
                                            <input type="text" value={formatNumber(data.sisa_v)} disabled className={`w-full h-9 px-3 rounded-md border text-sm font-bold ${data.sisa_v < 0 ? 'bg-red-100 border-red-200 text-red-700' : 'border-slate-200 bg-slate-100 text-slate-700'}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Sisa Anggaran (Otomatis)</label>
                                            <input type="text" value={formatNumber(data.sisa_a)} disabled className={`w-full h-9 px-3 rounded-md border text-sm font-bold ${data.sisa_a < 0 ? 'bg-red-100 border-red-200 text-red-700' : 'border-slate-200 bg-slate-100 text-slate-700'}`} />
                                        </div>
                                    </div>
                                    {data.sisa_v < 0 && (
                                        <p className="text-xs text-red-600 font-bold flex items-center gap-1 mt-2">
                                            <AlertCircle className="w-3.5 h-3.5" /> Peringatan: Volume Awal lebih kecil dari Realisasi!
                                        </p>
                                    )}
                                </div>

                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={processing}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="translokForm"
                                disabled={processing || data.sisa_v < 0}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
