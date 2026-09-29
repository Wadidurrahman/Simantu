export default function RecentActivityTable({ kegiatan = [] }) {
    const dataKegiatan = Array.isArray(kegiatan) ? kegiatan : [];

    const getColorClasses = (colorName) => {
        const colors = {
            emerald: { text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-500', badge: 'bg-emerald-50' },
            amber: { text: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-500', badge: 'bg-amber-50' },
            blue: { text: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-500', badge: 'bg-blue-50' },
        };
        return colors[colorName] || colors.blue;
    };

    return (
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 py-4 flex justify-between items-center border-b border-slate-200 bg-white shrink-0">
                <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Kegiatan Terkini</h2>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    Lihat semua
                </button>
            </div>

            <div className="overflow-y-auto flex-1 bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 text-[11px] uppercase text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                            <th className="px-5 py-3.5 font-bold tracking-wider w-1/2">Nama Kegiatan</th>
                            <th className="px-5 py-3.5 font-bold tracking-wider">Tenggat</th>
                            <th className="px-5 py-3.5 font-bold tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {dataKegiatan.length > 0 ? (
                            dataKegiatan.map((giat) => {
                                const theme = getColorClasses(giat.status_color);
                                return (
                                    <tr key={giat.id} className="even:bg-slate-50/70 hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-5 py-4 text-slate-800 font-bold text-[13px] group-hover:text-blue-700 transition-colors">
                                            {giat.nama}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-[12px] font-medium">
                                            {giat.tenggat}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${theme.text} ${theme.badge} ${theme.border}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${theme.bg}`}></span>
                                                {giat.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-5 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <span className="text-sm font-medium">Belum ada kegiatan operasional.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
