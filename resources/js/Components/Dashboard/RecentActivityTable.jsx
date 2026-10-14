import { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 48;

const buildPages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total];
    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
};

export default function RecentActivityTable({ kegiatan = [] }) {
    const dataKegiatan = Array.isArray(kegiatan) ? kegiatan : [];
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [query, setQuery] = useState('');
    const areaRef = useRef(null);

    useLayoutEffect(() => {
        const el = areaRef.current;
        if (!el) return;
        const measure = () => {
            const fit = Math.floor((el.clientHeight - HEADER_HEIGHT) / ROW_HEIGHT);
            setPerPage(Math.max(1, fit));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const getColorClasses = (colorName) => {
        const colors = {
            emerald: { text: 'text-slate-700', dot: 'bg-emerald-600' },
            amber: { text: 'text-slate-700', dot: 'bg-amber-500' },
            blue: { text: 'text-slate-700', dot: 'bg-blue-600' },
        };
        return colors[colorName] || colors.blue;
    };

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return dataKegiatan;
        return dataKegiatan.filter((giat) =>
            [kegiatan.nama, kegiatan.tenggat, kegiatan.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword))
        );
    }, [dataKegiatan, query]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * perPage;
    const pageItems = filtered.slice(startIndex, startIndex + perPage);
    const fillerCount = total > 0 ? Math.max(0, perPage - pageItems.length) : 0;
    const from = total === 0 ? 0 : startIndex + 1;
    const to = startIndex + pageItems.length;

    const handleSearch = (e) => {
        setQuery(e.target.value);
        setPage(1);
    };

    const clearSearch = () => {
        setQuery('');
        setPage(1);
    };

    const cell = 'border-b border-r border-slate-200 last:border-r-0';
    const pageButton = 'inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-full text-[13px] font-medium tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1';

    return (
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg flex flex-col min-h-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 shrink-0 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Kegiatan Terkini</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="Cari kegiatan..."
                        aria-label="Cari kegiatan"
                        className="w-full h-9 pl-9 pr-8 rounded-md border border-slate-300 bg-white text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Hapus pencarian"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div ref={areaRef} className="flex-1 min-h-0 overflow-hidden">
                <table className="w-full table-fixed text-left text-sm text-slate-700 border-collapse">
                    <colgroup>
                        <col className="w-[8%]" />
                        <col className="w-[47%]" />
                        <col className="w-[22%]" />
                        <col className="w-[23%]" />
                    </colgroup>
                    <thead>
                        <tr className="bg-slate-50 text-[12px] text-slate-700" style={{ height: HEADER_HEIGHT }}>
                            <th className={`${cell} px-4 font-semibold text-center`}>No</th>
                            <th className={`${cell} px-4 font-semibold`}>Nama Kegiatan</th>
                            <th className={`${cell} px-4 font-semibold`}>Tenggat</th>
                            <th className={`${cell} px-4 font-semibold`}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {total > 0 ? (
                            <>
                                {pageItems.map((giat, i) => {
                                    const theme = getColorClasses(kegiatan.status_color);
                                    return (
                                        <tr
                                            key={kegiatan.id ?? startIndex + i}
                                            className="odd:bg-white even:bg-slate-50/70 hover:bg-slate-100 transition-colors"
                                            style={{ height: ROW_HEIGHT }}
                                        >
                                            <td className={`${cell} px-4 text-center text-xs text-slate-500 tabular-nums`}>{startIndex + i + 1}</td>
                                            <td className={`${cell} px-4 text-slate-900 text-[13px] truncate`} title={kegiatan.nama}>
                                                {kegiatan.nama}
                                            </td>
                                            <td className={`${cell} px-4 whitespace-nowrap text-[13px] tabular-nums`}>
                                                {kegiatan.tenggat}
                                            </td>
                                            <td className={`${cell} px-4 whitespace-nowrap`}>
                                                <span className={`inline-flex items-center text-[13px] ${theme.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${theme.dot}`}></span>
                                                    {kegiatan.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {Array.from({ length: fillerCount }).map((_, i) => {
                                    const rowIndex = pageItems.length + i;
                                    return (
                                        <tr
                                            key={`filler-${i}`}
                                            className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                                            style={{ height: ROW_HEIGHT }}
                                        >
                                            <td className={cell}></td>
                                            <td className={cell}></td>
                                            <td className={cell}></td>
                                            <td className={cell}></td>
                                        </tr>
                                    );
                                })}
                            </>
                        ) : (
                            <tr style={{ height: ROW_HEIGHT * 3 }}>
                                <td colSpan="4" className="border-b border-slate-200 text-center text-sm text-slate-400">
                                    {query ? 'Tidak ada kegiatan yang cocok dengan pencarian.' : 'Belum ada kegiatan operasional.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-5 py-3 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <p className="text-xs text-slate-600 font-medium tabular-nums">
                    Menampilkan {from} sampai {to} dari {total} data
                </p>
                <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
                    <button
                        type="button"
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        aria-label="Halaman sebelumnya"
                        className={`${pageButton} text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {buildPages(currentPage, totalPages).map((p, i) =>
                        p === '...' ? (
                            <span key={`gap-${i}`} className="px-1 text-slate-400 text-sm select-none">…</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                aria-current={p === currentPage ? 'page' : undefined}
                                className={`${pageButton} ${
                                    p === currentPage
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        type="button"
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Halaman berikutnya"
                        className={`${pageButton} text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </nav>
            </div>
        </div>
    );
}
