import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const months = [
    { id: 'all', name: 'Semua Bulan' },
    { id: '01', name: 'Januari' }, { id: '02', name: 'Februari' }, { id: '03', name: 'Maret' },
    { id: '04', name: 'April' }, { id: '05', name: 'Mei' }, { id: '06', name: 'Juni' },
    { id: '07', name: 'Juli' }, { id: '08', name: 'Agustus' }, { id: '09', name: 'September' },
    { id: '10', name: 'Oktober' }, { id: '11', name: 'November' }, { id: '12', name: 'Desember' },
];

export default function RekapHonor({ rekap = [], tahun, bulan }) {
    const handleBulanChange = (e) => {
        router.get(route('laporan.rekap'), { bulan: e.target.value }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Rekapitulasi Honor Mitra" />

            <div className="space-y-5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Rekapitulasi Honorarium Petugas / Mitra ({tahun})</h1>
                        <p className="text-xs text-slate-500">Akumulasi penerimaan honor per mitra berdasarkan periode</p>
                    </div>
                    <select value={bulan} onChange={handleBulanChange} className="rounded-xl border-slate-300 text-sm py-2">
                        {months.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nama Mitra</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Jumlah Kegiatan</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total Volume</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total Honor (Rp)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white text-sm">
                            {rekap.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-6 text-center text-slate-400">Belum ada data rekapitulasi untuk periode ini.</td>
                                </tr>
                            ) : (
                                rekap.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{row.nama}</td>
                                        <td className="px-4 py-3 text-center text-slate-600">{row.jumlah_kegiatan}</td>
                                        <td className="px-4 py-3 text-right text-slate-600">{row.total_vol}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900">Rp {Number(row.total_honor).toLocaleString('id-ID')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}