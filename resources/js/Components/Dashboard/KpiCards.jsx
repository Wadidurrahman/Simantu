import { useState, useEffect } from 'react';
import { Activity, Wallet, Map, Users, ArrowUpRight, AlertCircle } from 'lucide-react';

const useAnimatedNumber = (endValue, duration = 1000) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setValue(Math.floor(progress * endValue));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [endValue, duration]);

    return value;
};

export default function KpiCards({ kpi }) {
    const aktif = useAnimatedNumber(kpi?.kegiatan_aktif ?? 0);
    const baru = useAnimatedNumber(kpi?.kegiatan_baru_bulan_ini ?? 0);
    const translok = useAnimatedNumber(kpi?.translok_berjalan ?? 0);
    const pending = useAnimatedNumber(kpi?.translok_pending ?? 0);
    const honor = useAnimatedNumber(kpi?.realisasi_honor ?? 0);
    const mitra = useAnimatedNumber(kpi?.mitra_terlibat ?? 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">

            {/* CARD 1 */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kegiatan Aktif</span>
                    <div className="p-1.5 bg-blue-50 rounded-md text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Activity className="w-4 h-4" strokeWidth={2.2} />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{aktif}</h3>
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" /> +{baru} bln ini
                    </span>
                </div>
            </div>

            {/* CARD 2: Translok Berjalan */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Translok Berjalan</span>
                    <div className="p-1.5 bg-amber-50 rounded-md text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Map className="w-4 h-4" strokeWidth={2.2} />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{translok}</h3>
                    <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3 h-3 mr-1" /> {pending} pending
                    </span>
                </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Realisasi Honor</span>
                    <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Wallet className="w-4 h-4" strokeWidth={2.2} />
                    </div>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{honor}%</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pagu</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 rounded-full h-1.5 transition-all duration-1000 ease-out" style={{ width: `${honor}%` }}></div>
                </div>
            </div>

            {/* CARD 4 */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mitra Terlibat</span>
                    <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Users className="w-4 h-4" strokeWidth={2.2} />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{mitra}</h3>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Aktif Total
                    </span>
                </div>
            </div>

        </div>
    );
}
