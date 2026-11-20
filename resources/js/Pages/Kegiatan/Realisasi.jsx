import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ClipboardList, Plus, Copy, Printer, X } from 'lucide-react';
import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';

export default function Realisasi({ petugasList = [] }) {
    const { flash, errors: pageErrors } = usePage().props;
    const [showInputModal, setShowInputModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showBastModal, setShowBastModal] = useState(false);
    const [selectedPetugas, setSelectedPetugas] = useState(null);

    const { data: inputData, setData: setInputData, post: postInput, processing: inputProcessing, errors: inputErrors, reset: resetInput } = useForm({
        tahun: new Date().getFullYear(),
        kd_bulan: '',
        id_sobat: '',
        nama: '',
        kd_tim: '',
        nm_tim: '',
        kd_giat: '',
        ur_giat: '',
        satuan: '',
        hr_satuan: '',
        vol: '',
        jml_hr: ''
    });

    const { data: copyData, setData: setCopyData, post: postCopy, processing: copyProcessing, errors: copyErrors, reset: resetCopy } = useForm({
        tahun: new Date().getFullYear(),
        dari_bulan: '',
        ke_bulan: '',
        kd_tim: '',
        kd_giat: ''
    });

    const { data: bastData, setData: setBastData } = useForm({
        hari: '',
        tanggalindo: '',
        ur_bulan: '',
        tgl_bast: '',
        no_spt: '',
        tgl_spt: '',
        nm_katim: '',
        nm_ppk: '',
        nip_ppk: ''
    });

    const handleInputSubmit = (e) => {
        e.preventDefault();
        postInput(route('kegiatan-petugas.store'), {
            onSuccess: () => {
                setShowInputModal(false);
                resetInput();
            }
        });
    };

    const handleCopySubmit = (e) => {
        e.preventDefault();
        postCopy(route('kegiatan-petugas.copy'), {
            onSuccess: () => {
                setShowCopyModal(false);
                resetCopy();
            }
        });
    };

    const handleBastSubmit = (e) => {
        e.preventDefault();
        if (!selectedPetugas) return;

        const params = new URLSearchParams(bastData).toString();
        window.location.href = `/bast/${selectedPetugas}/cetak?${params}`;
        setShowBastModal(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Realisasi Kinerja" />

            <div className="flex min-h-full flex-col gap-3 lg:h-full lg:min-h-0 lg:gap-4 p-4">

                {flash?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {flash.success}
                    </div>
                )}
                {pageErrors?.jml_hr && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {pageErrors.jml_hr}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Realisasi Honor Mitra</h2>
                            <p className="text-xs text-slate-500">Kelola penugasan, cetak BAST, dan duplikasi data</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowCopyModal(true)} className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                            <Copy className="mr-2 h-4 w-4" /> Copy Penugasan
                        </button>
                        <button onClick={() => setShowInputModal(true)} className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Petugas
                        </button>
                    </div>
                </div>

                <div className="flex-1 rounded-lg border border-slate-200 bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Mitra</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bulan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kegiatan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Honor</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {petugasList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                                            Belum ada data petugas.
                                        </td>
                                    </tr>
                                ) : (
                                    petugasList.map((item) => (
                                        <tr key={item.id_a}>
                                            <td className="px-4 py-3 text-sm text-slate-900">{item.nama}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{item.kd_bulan}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{item.ur_giat}</td>
                                            <td className="px-4 py-3 text-sm text-slate-900">Rp {Number(item.jml_hr).toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <button onClick={() => { setSelectedPetugas(item.id_a); setShowBastModal(true); }} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                                                    <Printer className="mr-1 h-4 w-4" /> BAST
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showInputModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Input Penugasan Mitra</h3>
                                <button onClick={() => setShowInputModal(false)}><X className="h-5 w-5 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleInputSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Tahun</label>
                                        <input type="number" value={inputData.tahun} onChange={e => setInputData('tahun', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Kode Bulan</label>
                                        <input type="text" placeholder="01" value={inputData.kd_bulan} onChange={e => setInputData('kd_bulan', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">ID Sobat / NIK</label>
                                        <input type="text" value={inputData.id_sobat} onChange={e => setInputData('id_sobat', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Nama Mitra</label>
                                        <input type="text" value={inputData.nama} onChange={e => setInputData('nama', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Kode Tim</label>
                                        <input type="text" value={inputData.kd_tim} onChange={e => setInputData('kd_tim', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Nama Tim</label>
                                        <input type="text" value={inputData.nm_tim} onChange={e => setInputData('nm_tim', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Kode Kegiatan</label>
                                        <input type="text" value={inputData.kd_giat} onChange={e => setInputData('kd_giat', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Uraian Kegiatan</label>
                                        <input type="text" value={inputData.ur_giat} onChange={e => setInputData('ur_giat', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Satuan</label>
                                        <input type="text" value={inputData.satuan} onChange={e => setInputData('satuan', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Volume</label>
                                        <input type="number" value={inputData.vol} onChange={e => setInputData('vol', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Honor Satuan</label>
                                        <input type="number" value={inputData.hr_satuan} onChange={e => setInputData('hr_satuan', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Total Honor</label>
                                        <input type="number" value={inputData.jml_hr} onChange={e => setInputData('jml_hr', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                        {inputErrors.jml_hr && <p className="mt-1 text-xs text-red-600">{inputErrors.jml_hr}</p>}
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowInputModal(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Batal</button>
                                    <button type="submit" disabled={inputProcessing} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showCopyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Copy Penugasan Bulan Lalu</h3>
                                <button onClick={() => setShowCopyModal(false)}><X className="h-5 w-5 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleCopySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Tahun</label>
                                    <input type="number" value={copyData.tahun} onChange={e => setCopyData('tahun', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Dari Bulan (01-12)</label>
                                    <input type="text" value={copyData.dari_bulan} onChange={e => setCopyData('dari_bulan', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Ke Bulan (01-12)</label>
                                    <input type="text" value={copyData.ke_bulan} onChange={e => setCopyData('ke_bulan', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Kode Tim</label>
                                    <input type="text" value={copyData.kd_tim} onChange={e => setCopyData('kd_tim', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Kode Kegiatan</label>
                                    <input type="text" value={copyData.kd_giat} onChange={e => setCopyData('kd_giat', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                </div>
                                <div className="mt-5 flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowCopyModal(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Batal</button>
                                    <button type="submit" disabled={copyProcessing} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">Proses Copy</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showBastModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Cetak BAST (Word)</h3>
                                <button onClick={() => setShowBastModal(false)}><X className="h-5 w-5 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleBastSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Hari (contoh: Senin)</label>
                                        <input type="text" value={bastData.hari} onChange={e => setBastData('hari', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Tgl Terbilang (contoh: lima belas)</label>
                                        <input type="text" value={bastData.tanggalindo} onChange={e => setBastData('tanggalindo', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Bulan Terbilang (contoh: Agustus)</label>
                                        <input type="text" value={bastData.ur_bulan} onChange={e => setBastData('ur_bulan', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Tgl BAST (YYYY-MM-DD)</label>
                                        <input type="date" value={bastData.tgl_bast} onChange={e => setBastData('tgl_bast', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">No SPT</label>
                                        <input type="text" value={bastData.no_spt} onChange={e => setBastData('no_spt', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Tgl SPT (YYYY-MM-DD)</label>
                                        <input type="date" value={bastData.tgl_spt} onChange={e => setBastData('tgl_spt', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">Nama Ketua Tim</label>
                                        <input type="text" value={bastData.nm_katim} onChange={e => setBastData('nm_katim', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">Nama PPK</label>
                                        <input type="text" value={bastData.nm_ppk} onChange={e => setBastData('nm_ppk', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700">NIP PPK</label>
                                        <input type="text" value={bastData.nip_ppk} onChange={e => setBastData('nip_ppk', e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" required />
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowBastModal(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Batal</button>
                                    <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Unduh Dokumen</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
