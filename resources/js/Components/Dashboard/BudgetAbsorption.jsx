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
        const colors = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', blue: 'bg-blue-600' };
        return colors[colorName] || colors.blue;
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col min-h-0">
            <h2 className="text-base font-extrabold text-slate-800 mb-6 shrink-0 tracking-tight">Serapan Anggaran</h2>

            <div className="space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {dataAnggaran.length > 0 ? (
                    dataAnggaran.map((item) => (
                        <div key={item.id} className="group">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                                <span className="text-[13px] font-black text-slate-900">
                                    {isLoaded ? item.persentase : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`${getBarColor(item.color)} rounded-full h-2 transition-all duration-1000 ease-out`}
                                    style={{ width: isLoaded ? `${item.persentase}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-4">
                        <p className="text-sm font-medium">Data anggaran belum tersedia.</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2 text-slate-400">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-slate-300" />
                <p className="text-[11px] leading-relaxed font-medium">
                    Data diperbarui secara otomatis berdasarkan input transaksi operasional terakhir.
                </p>
            </div>
        </div>
    );
}
