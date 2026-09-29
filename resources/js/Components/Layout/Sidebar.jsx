import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid, Activity, Map, Wallet, Users, Database, FileText, Settings, X, ChevronDown, Circle, PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight
} from 'lucide-react';

const navigationItems = [
    { name: 'Dashboard', routeName: 'dashboard', icon: LayoutGrid },
    {
        name: 'Manajemen Giat', icon: Activity,
        children: [
            { name: 'Daftar Kegiatan', routeName: 'giat.index' },
            { name: 'Realisasi Kinerja', routeName: 'giat.realisasi' },
        ]
    },
    {
        name: 'Perjalanan Dinas', icon: Map,
        children: [
            { name: 'Master Translok', routeName: 'translok.master.index' },
            { name: 'Alokasi Translok', routeName: 'translok.alokasi' },
            { name: 'Detail Perjalanan', routeName: 'translok.detail' },
            { name: 'Tanggal Off', routeName: 'translok.off' },
        ]
    },
    {
        name: 'Honorarium & Mitra', icon: Wallet,
        children: [
            { name: 'Data Mitra BPS', routeName: 'mitra.index' },
            { name: 'Alokasi Honor', routeName: 'honor.index' },
        ]
    },
    {
        name: 'Master Data', icon: Database,
        children: [
            { name: 'Pegawai Organik', routeName: 'pegawai.index' },
            { name: 'Master Wilayah', routeName: 'wilayah.index' },
        ]
    },
    {
        name: 'Laporan', icon: FileText,
        children: [
            { name: 'Rekapitulasi', routeName: 'laporan.rekap' },
            { name: 'Monitoring Anggaran', routeName: 'laporan.anggaran' },
        ]
    }
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        const initialOpenState = {};
        navigationItems.forEach((item, index) => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => route().current(child.routeName) || route().current(child.routeName + '.*'));
                if (hasActiveChild) initialOpenState[index] = true;
            }
        });
        setOpenMenus(initialOpenState);
    }, []);

    const toggleMenu = (index) => {
        if (isCollapsed) return;
        setOpenMenus(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const renderNavigation = (isMobile = false) => {
        const collapsedState = isMobile ? false : isCollapsed;

        return (
            <ul className={`space-y-1 py-6 relative z-10 ${collapsedState ? 'px-3' : 'pl-4 pr-0'}`}>
                {navigationItems.map((item, index) => {
                    const hasActiveChild = item.children
                        ? item.children.some(child => route().current(child.routeName) || route().current(child.routeName + '.*'))
                        : (route().current(item.routeName) || route().current(item.routeName + '.*'));

                    const activeClasses = collapsedState
                        ? "bg-blue-600 text-white rounded-xl shadow-lg"
                        : "bg-slate-50 text-blue-700 rounded-l-2xl w-[calc(100%+1px)] z-20 shadow-[-5px_0_15px_-3px_rgba(0,0,0,0.1)]";
                    const inactiveClasses = collapsedState
                        ? "text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl mr-4";

                    return (
                        <li key={index} className="relative group">
                            {item.children ? (
                                <button
                                    onClick={() => toggleMenu(index)}
                                    className={`w-full flex items-center justify-between py-3 transition-all duration-300 focus:outline-none relative ${
                                        hasActiveChild ? activeClasses : inactiveClasses
                                    } ${collapsedState ? 'px-0 justify-center' : 'pl-4 pr-4'}`}
                                >
                                    <div className="flex items-center">
                                        <item.icon className={`w-5 h-5 shrink-0 transition-colors ${hasActiveChild && collapsedState ? 'text-white' : hasActiveChild ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-200'}`} strokeWidth={hasActiveChild ? 2.5 : 2} />
                                        <span className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsedState ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    {!collapsedState && (
                                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openMenus[index] ? 'rotate-180 text-blue-600' : 'text-slate-500'}`} />
                                    )}
                                </button>
                            ) : (
                                <Link
                                    href={route().has(item.routeName) ? route(item.routeName) : '#'}
                                    className={`flex items-center py-3 transition-all duration-300 relative ${
                                        hasActiveChild ? activeClasses : inactiveClasses
                                    } ${collapsedState ? 'px-0 justify-center' : 'pl-4 pr-4'}`}
                                    onClick={() => isMobile && setIsMobileOpen(false)}
                                >
                                    <div className="flex items-center">
                                        <item.icon className={`w-5 h-5 shrink-0 transition-colors ${hasActiveChild && collapsedState ? 'text-white' : hasActiveChild ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-200'}`} strokeWidth={hasActiveChild ? 2.5 : 2} />
                                        <span className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsedState ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {!collapsedState && item.children && openMenus[index] && (
                                <ul className="mt-1 mb-2 space-y-1 pl-7 pr-4 relative z-10">
                                    {item.children.map((child) => {
                                        const isChildActive = route().current(child.routeName) || route().current(child.routeName + '.*');
                                        return (
                                            <li key={child.name}>
                                                <Link
                                                    href={route().has(child.routeName) ? route(child.routeName) : '#'}
                                                    className={`flex items-center py-2.5 px-3 rounded-xl text-[13px] transition-all duration-200 ${
                                                        isChildActive
                                                            ? 'text-white bg-blue-600/90 font-bold shadow-md'
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                                                    }`}
                                                    onClick={() => isMobile && setIsMobileOpen(false)}
                                                >
                                                    <Circle className={`w-1.5 h-1.5 mr-3 shrink-0 ${isChildActive ? 'fill-white text-white' : 'text-slate-500'}`} strokeWidth={2.5} />
                                                    {child.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {collapsedState && item.children && (
                                <div className="absolute left-full top-0 ml-4 w-52 bg-[#0f172a] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] shadow-2xl border border-slate-700 py-2">
                                    <div className="absolute top-4 -left-1.5 border-t-4 border-r-4 border-b-4 border-transparent border-r-[#0f172a]"></div>
                                    <div className="px-4 py-2 border-b border-slate-800/80 mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.name}</span>
                                    </div>
                                    <ul className="px-2 space-y-1">
                                        {item.children.map((child) => {
                                            const isChildActive = route().current(child.routeName) || route().current(child.routeName + '.*');
                                            return (
                                                <li key={child.name}>
                                                    <Link
                                                        href={route().has(child.routeName) ? route(child.routeName) : '#'}
                                                        className={`flex items-center px-3 py-2.5 text-[13px] rounded-lg transition-colors ${
                                                            isChildActive ? 'text-white bg-blue-600 font-bold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {collapsedState && !item.children && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-[#0f172a] text-white text-[11px] uppercase tracking-wider font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-xl border border-slate-700">
                                    {item.name}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-r-4 border-b-4 border-transparent border-r-[#0f172a]"></div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <>
            <aside
                className={`hidden md:flex flex-col bg-gradient-to-b from-[#0f172a] to-[#020617] border-r border-slate-800 transition-all duration-300 ease-in-out z-40 shrink-0 h-full relative ${
                    isCollapsed ? 'w-[76px]' : 'w-64'
                }`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 relative z-10">
                    <div className={`flex items-center shrink-0 transition-all duration-300 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                        <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center overflow-hidden shadow-sm">
                            <img
                                src="/logoBPS.webp"
                                alt="Logo BPS Kota Probolinggo"
                                className="w-full h-full object-contain p-1"
                            />
                        </div>
                    </div>

                    <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Badan Pusat Statistik</span>
                        <span className="text-sm font-bold text-white tracking-tight leading-none">KOTA PROBOLINGGO</span>
                    </div>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3.5 top-5 p-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-md z-50 focus:outline-none"
                        title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                <nav className="flex-1 overflow-visible relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {renderNavigation(false)}
                </nav>

                <div className={`p-4 border-t border-slate-800 shrink-0 relative z-10 transition-all duration-300 ${isCollapsed ? 'px-3' : 'px-4'}`}>
                    <div className="relative group">
                        <Link href={route('profile.edit')} className={`flex items-center rounded-xl py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
                            <Settings className="w-5 h-5 shrink-0" strokeWidth={2} />
                            <span className={`font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}`}>Pengaturan</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)}></div>
                    <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#0f172a] to-[#020617] shadow-2xl flex flex-col z-[70] animate-[slideRight_0.2s_ease-out] relative">
                        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 relative z-10">
                            <div className="flex items-center">
                                <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center overflow-hidden shadow-sm mr-3">
                                    <img src="/logoBPS.webp" alt="Logo BPS" className="w-full h-full object-contain p-1" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-0.5">BPS</span>
                                    <span className="text-sm font-bold text-white tracking-tight leading-none">PROBOLINGGO</span>
                                </div>
                            </div>
                            <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {renderNavigation(true)}
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
}
