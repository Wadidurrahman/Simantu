import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';

export default function MonitoringAnggaran({ anggaran = [], tahun }) {
    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Anggaran" />

            <div className="space-y-5 p-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h1 className="text-lg font-bold text-slate-900">Monitoring Serapan Anggaran ({tahun})</h1>
                    <p className="text-xs text-slate-500">Ringkasan pagu anggaran, realisasi, dan sisa anggaran kegiatan</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {anggaran.map((item, idx) => (
                        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-slate-800 text-sm">{item.label}</h2>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">{item.persentase}% Terserap</span>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(item.persentase, 100)}%` }}></div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-100">
                                <div>
                                    <span className="text-slate-400 block">Pagu</span>
                                    <span className="font-semibold text-slate-900">Rp {Number(item.pagu).toLocaleString('id-ID')}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Realisasi</span>
                                    <span className="font-semibold text-blue-600">Rp {Number(item.realisasi).toLocaleString('id-ID')}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Sisa</span>
                                    <span className="font-semibold text-emerald-600">Rp {Number(item.sisa).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
