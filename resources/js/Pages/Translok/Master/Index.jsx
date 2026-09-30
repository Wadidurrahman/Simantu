import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, X, Calculator, AlertCircle } from 'lucide-react';

export default function Index({ giat, masterKegiatan, tahun }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');

    const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        kd_translok: '',
        kegiatan_id: '',
        vol_awal: 0,
        satuan: '',
        rate: 0,
        jml_anggaran: 0,
        realisasi_vol: 0,
        sisa_vol: 0,
        sisa_anggaran: 0,
    });

    useEffect(() => {
        const volAwal = parseFloat(data.vol_awal) || 0;
        const rateSatuan = parseFloat(data.rate) || 0;
        const realisasiVol = parseFloat(data.realisasi_vol) || 0;

        const jmlAnggaran = volAwal * rateSatuan;
        const sisaVolume = volAwal - realisasiVol;
        const sisaAnggaran = sisaVolume * rateSatuan;

        setData((prevData) => ({
            ...prevData,
            jml_anggaran: jmlAnggaran,
            sisa_vol: sisaVolume,
            sisa_anggaran: sisaAnggaran,
        }));
    }, [data.vol_awal, data.rate, data.realisasi_vol]);

    const openAddModal = () => {
        clearErrors();
        reset();
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        clearErrors();
        setData({
            id: item.id,
            kd_translok: item.kd_translok,
            kegiatan_id: item.kegiatan_id || '',
            vol_awal: item.vol_awal,
            satuan: item.satuan,
            rate: item.rate,
            jml_anggaran: item.jml_anggaran,
            realisasi_vol: item.realisasi_vol,
            sisa_vol: item.sisa_vol,
            sisa_anggaran: item.sisa_anggaran,
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => reset(), 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post(route('translok.master.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('translok.master.update', data.id), {
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

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Master Translok</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                        Daftar Volume dan Rate Perjalanan Dinas Dalam Kota Tahun {tahun}
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Tambah Kegiatan
                </button>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Kegiatan Translok</th>
                                <th className="px-4 py-3 font-semibold text-right">Volume</th>
                                <th className="px-4 py-3 font-semibold">Satuan</th>
                                <th className="px-4 py-3 font-semibold text-right">Rate (Rp)</th>
                                <th className="px-4 py-3 font-semibold text-right">Total Anggaran (Rp)</th>
                                <th className="px-4 py-3 font-semibold text-center w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {giat.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-slate-400 font-medium text-sm">
                                        Tidak ada data kegiatan di tahun {tahun}.
                                    </td>
                                </tr>
                            ) : (
                                giat.map((keg) => (
                                    <tr key={keg.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-2.5 font-medium text-slate-800">
                                            <span className="text-slate-400 mr-2 text-xs">{keg.kd_translok}.</span>
                                            {keg.kegiatan?.ur_giat || '-'}
                                        </td>
                                        <td className="px-4 py-2.5 text-right">{formatNumber(keg.vol_awal)}</td>
                                        <td className="px-4 py-2.5">{keg.satuan}</td>
                                        <td className="px-4 py-2.5 text-right">{formatNumber(keg.rate)}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{formatNumber(keg.jml_anggaran)}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(keg)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(keg.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl relative z-10 flex flex-col max-h-[90vh] animate-[slideDown_0.2s_ease-out]">

                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">
                                {modalMode === 'add' ? 'Tambah Kegiatan Translok' : 'Edit Kegiatan Translok'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto custom-scrollbar">
                            <form id="translokForm" onSubmit={handleSubmit} className="space-y-4">

                                {modalMode === 'edit' && (
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase">Kode Translok</label>
                                        <input type="text" value={data.kd_translok} disabled className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium" />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Uraian Kegiatan <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.kegiatan_id}
                                        onChange={e => setData('kegiatan_id', e.target.value)}
                                        className={`w-full h-9 px-3 rounded-md border text-sm font-medium focus:ring-2 outline-none transition-all ${
                                            errors.kegiatan_id ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/10'
                                        }`}
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Kegiatan --</option>
                                        {masterKegiatan.map((mk) => (
                                            <option key={mk.id} value={mk.id}>
                                                [{mk.kd_giat}] {mk.ur_giat}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.kegiatan_id && <span className="text-xs text-red-500 font-medium">{errors.kegiatan_id}</span>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase">Volume Awal <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={data.vol_awal}
                                            onChange={e => setData('vol_awal', e.target.value)}
                                            className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            required
                                            min="0"
                                        />
                                        {errors.vol_awal && <span className="text-xs text-red-500 font-medium">{errors.vol_awal}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase">Satuan <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={data.satuan}
                                            onChange={e => setData('satuan', e.target.value)}
                                            className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            required
                                        />
                                        {errors.satuan && <span className="text-xs text-red-500 font-medium">{errors.satuan}</span>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase">Rate (Rp) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            value={data.rate}
                                            onChange={e => setData('rate', e.target.value)}
                                            className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            required
                                            min="0"
                                        />
                                        {errors.rate && <span className="text-xs text-red-500 font-medium">{errors.rate}</span>}
                                    </div>
                                </div>

                                {/* PREVIEW KALKULASI */}
                                <div className="bg-slate-50 rounded-md p-3 border border-slate-200 mt-2 space-y-3">
                                    <h4 className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                        <Calculator className="w-3.5 h-3.5" /> Pratinjau Kalkulasi Sistem
                                    </h4>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Ttl Anggaran</label>
                                            <input type="text" value={formatNumber(data.jml_anggaran)} disabled className="w-full h-8 px-2.5 rounded border border-slate-200 bg-slate-100/50 text-slate-700 text-xs font-semibold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Realisasi Vol</label>
                                            <input type="text" value={formatNumber(data.realisasi_vol)} disabled className="w-full h-8 px-2.5 rounded border border-slate-200 bg-slate-100/50 text-slate-700 text-xs font-semibold" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Sisa Vol</label>
                                            <input type="text" value={formatNumber(data.sisa_vol)} disabled className={`w-full h-8 px-2.5 rounded border text-xs font-semibold ${data.sisa_vol < 0 ? 'bg-red-50 border-red-200 text-red-600' : 'border-slate-200 bg-slate-100/50 text-slate-700'}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Sisa Anggaran</label>
                                            <input type="text" value={formatNumber(data.sisa_anggaran)} disabled className={`w-full h-8 px-2.5 rounded border text-xs font-semibold ${data.sisa_anggaran < 0 ? 'bg-red-50 border-red-200 text-red-600' : 'border-slate-200 bg-slate-100/50 text-slate-700'}`} />
                                        </div>
                                    </div>
                                    {data.sisa_vol < 0 && (
                                        <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Volume Awal lebih kecil dari Realisasi!
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 rounded-b-lg flex justify-end gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={processing}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="translokForm"
                                disabled={processing || data.sisa_vol < 0}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
