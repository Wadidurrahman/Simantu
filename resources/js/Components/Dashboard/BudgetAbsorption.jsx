import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function BudgetAbsorption({ anggaran = [] }) {
    const dataAnggaran = Array.isArray(anggaran) ? anggaran : [];
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 150);
        return () => clearTimeout(timer);
    }, []);

    const getBarColor = (colorName) => {
        const colors = { emerald: 'bg-emerald-600', amber: 'bg-amber-500', blue: 'bg-blue-600' };
        return colors[colorName] || colors.blue;
    };

    const clamp = (value) => Math.min(Math.max(Number(value) || 0, 0), 100);

    return (
        <div className="bg-white border border-slate-200 rounded-lg flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 shrink-0">
                <h2 className="text-sm font-semibold text-slate-900">Serapan Anggaran</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col justify-evenly gap-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {dataAnggaran.length > 0 ? (
                    dataAnggaran.map((item, index) => {
                        const persen = clamp(item.persentase);
                        return (
                            <div key={item.id ?? index}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
                                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums">
                                        {isLoaded ? persen : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`${getBarColor(item.color)} rounded-full h-2 transition-all duration-1000 ease-out motion-reduce:transition-none`}
                                        style={{ width: isLoaded ? `${persen}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-4">
                        <p className="text-sm">Data anggaran belum tersedia.</p>
                    </div>
                )}
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-start gap-2 text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                <p className="text-[11px] leading-relaxed">
                    Data diperbarui otomatis berdasarkan input transaksi operasional terakhir.
                </p>
            </div>
        </div>
    );
}
