import { Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function DashboardHeader() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 w-full shrink-0">
            <div>
                <h1 className="text-lg font-semibold text-slate-900 tracking-tight leading-none">Ringkasan Operasional</h1>
                <p className="text-xs text-slate-500 mt-1.5">Kegiatan, perjalanan dinas, dan realisasi anggaran</p>
            </div>
            <div className="flex items-center gap-2.5">
                <Link
                    href={route('kegiatan.index')}
                    className="inline-flex items-center justify-center px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-[13px] font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> Kegiatan Baru
                </Link>
                <Link
                    href={route('translok.master.index')}
                    className="inline-flex items-center justify-center px-3.5 py-2 bg-blue-700 border border-blue-700 text-white rounded-md text-[13px] font-semibold hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> Translok Baru
                </Link>
            </div>
        </div>
    );
}
