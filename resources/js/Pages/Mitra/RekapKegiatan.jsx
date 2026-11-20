import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Search } from 'lucide-react';

const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0));

export default function RekapKegiatan({ filters, rekap = [] }) {
    const [search, setSearch] = useState('');
    const filtered = rekap.filter((r) =>
        [r.nama_tim, r.kd_giat, r.ur_giat].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout header={<h1 className="text-lg font-bold text-slate-900">Rekap Kegiatan Mitra — Tahun {filters.tahun}</h1>}>
            <Head title="Rekap Kegiatan" />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <select
                        value={filters.bulan}
                        onChange={(e) => router.get(route('mitra.rekap-kegiatan'), { tahun: filters.tahun, bulan: e.target.value }, { preserveState: true })}
                        className="rounded-xl border-slate-300 text-sm font-medium"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>Bulan {String(m).padStart(2, '0')}</option>
                        ))}
                    </select>
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari tim atau kegiatan..." className="w-full rounded-xl border-slate-300 py-1.5 pl-9 pr-3 text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                                <th className="px-4 py-3">Tim Kerja</th>
                                <th className="px-4 py-3">Kegiatan</th>
                                <th className="px-4 py-3">Jml Petugas</th>
                                <th className="px-4 py-3">Total Honor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((row) => (
                                <tr key={row.kegiatan_id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">{row.nama_tim || '-'}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900">[{row.kd_giat}] {row.ur_giat}</td>
                                    <td className="px-4 py-3 font-bold">{row.jml_petugas} Orang</td>
                                    <td className="px-4 py-3 font-bold text-blue-700">{formatRupiah(row.total_honor)}</td>
                                </tr>
                            ))}
                            {!filtered.length && (
                                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Belum ada kegiatan mitra pada bulan ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
