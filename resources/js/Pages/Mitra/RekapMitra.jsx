import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Search } from 'lucide-react';

const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0));

export default function RekapMitra({ filters, rekap = [] }) {
    const [search, setSearch] = useState('');
    const filtered = rekap.filter((r) =>
        [r.nama, r.id_sobat, r.asal_kecamatan].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout header={<h1 className="text-lg font-bold text-slate-900">Rekap Honor per Mitra — Tahun {filters.tahun}</h1>}>
            <Head title="Rekap Mitra" />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <select
                        value={filters.bulan}
                        onChange={(e) => router.get(route('mitra.rekap-mitra'), { tahun: filters.tahun, bulan: e.target.value }, { preserveState: true })}
                        className="rounded-xl border-slate-300 text-sm font-medium"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>Bulan {String(m).padStart(2, '0')}</option>
                        ))}
                    </select>
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama mitra..." className="w-full rounded-xl border-slate-300 py-1.5 pl-9 pr-3 text-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                                <th className="px-4 py-3">ID SOBAT</th>
                                <th className="px-4 py-3">Nama Mitra</th>
                                <th className="px-4 py-3">Asal Kecamatan</th>
                                <th className="px-4 py-3">Jml Kegiatan</th>
                                <th className="px-4 py-3">Total Honor</th>
                                <th className="px-4 py-3">Status SBM (Maks 3,3 Jt)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((row) => {
                                const persen = Math.min(100, Math.round((Number(row.total_honor) / 3300000) * 100));
                                return (
                                    <tr key={row.mitra_id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-xs">{row.id_sobat || '-'}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-900">{row.nama}</td>
                                        <td className="px-4 py-3 text-slate-600">{row.asal_kecamatan || '-'}</td>
                                        <td className="px-4 py-3 font-bold">{row.jml_kegiatan}</td>
                                        <td className="px-4 py-3 font-bold text-blue-700">{formatRupiah(row.total_honor)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${persen >= 90 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                {persen}% SBM
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!filtered.length && (
                                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Belum ada data rekap mitra pada bulan ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
