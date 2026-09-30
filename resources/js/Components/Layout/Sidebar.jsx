import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid, Activity, Map, Wallet, Users, Database, FileText, Settings, X, ChevronDown, Circle, PanelLeftClose, PanelLeftOpen, ClipboardList
} from 'lucide-react';

const navigationItems = [
    {
        name: 'Dashboard',
        routeName: 'dashboard',
        icon: LayoutGrid,
        roles: ['admin', 'pegawai', 'mitra']
    },
    {
        name: 'Manajemen Giat', icon: Activity, roles: ['admin', 'pegawai'],
        children: [
            { name: 'Daftar Kegiatan', routeName: 'giat.index', roles: ['admin', 'pegawai'] },
            { name: 'Realisasi Kinerja', routeName: 'giat.realisasi', roles: ['admin', 'pegawai'] },
        ]
    },
    {
        // Menu Khusus Mitra
        name: 'Tugas Saya', icon: ClipboardList, roles: ['mitra'],
        children: [
            { name: 'Daftar Tugas', routeName: 'mitra.tugas', roles: ['mitra'] },
        ]
    },
    {
        name: 'Perjalanan Dinas', icon: Map, roles: ['admin', 'pegawai'],
        children: [
            { name: 'Master Translok', routeName: 'translok.master.index', roles: ['admin'] },
            { name: 'Alokasi Translok', routeName: 'translok.alokasi', roles: ['admin'] },
            { name: 'Detail Perjalanan', routeName: 'translok.detail', roles: ['admin', 'pegawai'] },
            { name: 'Tanggal Off', routeName: 'translok.off', roles: ['admin', 'pegawai'] },
        ]
    },
    {
        name: 'Honorarium & Mitra', icon: Users, roles: ['admin'],
        children: [
            { name: 'Data Mitra BPS', routeName: 'mitra.index', roles: ['admin'] },
            { name: 'Alokasi Honor', routeName: 'honor.index', roles: ['admin'] },
        ]
    },
    {
        // Menu Khusus Mitra
        name: 'Honorarium Saya', icon: Wallet, roles: ['mitra'],
        children: [
            { name: 'Riwayat Honor', routeName: 'mitra.honor', roles: ['mitra'] },
        ]
    },
    {
        name: 'Master Data', icon: Database, roles: ['admin'],
        children: [
            { name: 'Pegawai Organik', routeName: 'pegawai.index', roles: ['admin'] },
            { name: 'Master Wilayah', routeName: 'wilayah.index', roles: ['admin'] },
        ]
    },
    {
        name: 'Laporan', icon: FileText, roles: ['admin'],
        children: [
            { name: 'Rekapitulasi', routeName: 'laporan.rekap', roles: ['admin'] },
            { name: 'Monitoring Anggaran', routeName: 'laporan.anggaran', roles: ['admin'] },
        ]
    }
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    // 2. Ambil data user dari session Inertia
    const { auth } = usePage().props;
    // Asumsi: Anda sudah menggunakan kolom 'role' dengan value 'admin', 'pegawai', 'mitra'
    // Jika masih pakai angka level lama, ubah const userRole = auth.user.level == 1 ? 'admin' : (auth.user.level == 2 ? 'pegawai' : 'mitra');
    const userRole = auth.user?.role || 'pegawai';

    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        const initialOpenState = {};
        navigationItems.forEach((item, index) => {
            // Lewati jika role user tidak diizinkan melihat menu ini
            if (!item.roles.includes(userRole)) return;

            if (item.children) {
                const visibleChildren = item.children.filter(child => child.roles.includes(userRole));
                const hasActiveChild = visibleChildren.some(child => route().current(child.routeName) || route().current(child.routeName + '.*'));
                if (hasActiveChild) initialOpenState[index] = true;
            }
        });
        setOpenMenus(initialOpenState);
    }, [userRole]);

    const toggleMenu = (index) => {
        if (isCollapsed) return;
        setOpenMenus(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const renderNavigation = (isMobile = false) => {
        const collapsedState = isMobile ? false : isCollapsed;

        // 3. Filter Navigasi Utama berdasarkan Role
        const filteredNavItems = navigationItems.filter(item => item.roles.includes(userRole));

        return (
            <ul className={`space-y-1.5 py-5 relative z-10 ${collapsedState ? 'px-2.5' : 'pl-3 pr-0'}`}>
                {filteredNavItems.map((item, index) => {

                    // 4. Filter Submenu berdasarkan Role
                    const visibleChildren = item.children
                        ? item.children.filter(child => child.roles.includes(userRole))
                        : null;

                    // Jika menu punya submenu, tapi setelah difilter kosong (misal pegawai lihat menu yang submenunya admin semua), sembunyikan parent-nya
                    if (item.children && visibleChildren.length === 0) return null;

                    const hasActiveChild = visibleChildren
                        ? visibleChildren.some(child => route().current(child.routeName) || route().current(child.routeName + '.*'))
                        : (route().current(item.routeName) || route().current(item.routeName + '.*'));

                    const liClasses = hasActiveChild && !collapsedState
                        ? "bg-slate-50 rounded-l-xl w-full relative z-20"
                        : "w-full pr-3 relative z-10";

                    return (
                        <li key={index} className={liClasses}>
                            {hasActiveChild && !collapsedState && (
                                <>
                                    <div className="absolute -top-4 right-0 w-4 h-4 bg-transparent rounded-br-xl shadow-[4px_4px_0_4px_#f8fafc] pointer-events-none z-20"></div>
                                    <div className="absolute -bottom-4 right-0 w-4 h-4 bg-transparent rounded-tr-xl shadow-[4px_-4px_0_4px_#f8fafc] pointer-events-none z-20"></div>
                                </>
                            )}

                            {visibleChildren ? (
                                <button
                                    onClick={() => toggleMenu(index)}
                                    className={`w-full flex items-center justify-between py-2 transition-colors duration-150 ease-out focus:outline-none ${
                                        hasActiveChild && !collapsedState ? 'px-3 text-blue-700' : collapsedState ? 'justify-center px-0' : 'px-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-[32px] h-[32px] shrink-0 rounded-md flex items-center justify-center transition-colors duration-300 ${hasActiveChild && !collapsedState ? 'bg-blue-600 text-white shadow-md' : hasActiveChild && collapsedState ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400'}`}>
                                            <item.icon className="w-[18px] h-[18px]" strokeWidth={2} />
                                        </div>
                                        <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out ${collapsedState ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-2.5'} text-[13px] ${hasActiveChild ? 'font-bold' : 'font-medium'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    {!collapsedState && (
                                        <ChevronDown className={`w-[14px] h-[14px] shrink-0 transition-transform duration-200 ease-in-out ${openMenus[index] ? 'rotate-180' : 'rotate-0'} ${hasActiveChild ? 'text-blue-600' : 'text-slate-500'}`} strokeWidth={2.5} />
                                    )}
                                </button>
                            ) : (
                                <Link
                                    href={route().has(item.routeName) ? route(item.routeName) : '#'}
                                    className={`flex items-center py-2 transition-colors duration-150 ease-out focus:outline-none ${
                                        hasActiveChild && !collapsedState ? 'px-3 text-blue-700' : collapsedState ? 'justify-center px-0' : 'px-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg'
                                    }`}
                                    onClick={() => isMobile && setIsMobileOpen(false)}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-[32px] h-[32px] shrink-0 rounded-md flex items-center justify-center transition-colors duration-300 ${hasActiveChild && !collapsedState ? 'bg-blue-600 text-white shadow-md' : hasActiveChild && collapsedState ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400'}`}>
                                            <item.icon className="w-[18px] h-[18px]" strokeWidth={2} />
                                        </div>
                                        <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out ${collapsedState ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-2.5'} text-[13px] ${hasActiveChild ? 'font-bold' : 'font-medium'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {!collapsedState && visibleChildren && (
                                <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${openMenus[index] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <ul className="mt-1 mb-2 space-y-0.5 pl-11 pr-4 relative z-10 w-full">
                                            {visibleChildren.map((child) => {
                                                const isChildActive = route().current(child.routeName) || route().current(child.routeName + '.*');

                                                return (
                                                    <li key={child.name}>
                                                        <Link
                                                            href={route().has(child.routeName) ? route(child.routeName) : '#'}
                                                            className={`flex items-center py-1.5 text-[12px] transition-colors duration-150 ease-out ${
                                                                isChildActive
                                                                    ? hasActiveChild ? 'text-blue-700 font-bold' : 'text-white font-semibold'
                                                                    : hasActiveChild ? 'text-slate-500 hover:text-blue-600 font-medium' : 'text-slate-400 hover:text-white font-medium'
                                                            }`}
                                                            onClick={() => isMobile && setIsMobileOpen(false)}
                                                        >
                                                            <Circle className={`w-[5px] h-[5px] mr-2.5 shrink-0 transition-colors duration-150 ease-out ${
                                                                isChildActive
                                                                    ? hasActiveChild ? 'fill-blue-600 text-blue-600' : 'fill-white text-white'
                                                                    : hasActiveChild ? 'fill-slate-300 text-slate-300' : 'fill-slate-500 text-slate-500'
                                                            }`} strokeWidth={2.5} />
                                                            {child.name}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {collapsedState && visibleChildren && (
                                <div className="absolute left-full top-0 ml-3 w-48 bg-slate-900 text-white rounded-lg transition-[opacity,transform,visibility] duration-200 ease-out delay-75 opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 z-[100] shadow-2xl border border-slate-700 py-1.5 pointer-events-auto">
                                    <div className="absolute top-4 -left-1.5 border-t-4 border-r-4 border-b-4 border-transparent border-r-slate-900"></div>
                                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.name}</span>
                                    </div>
                                    <ul className="px-1.5 space-y-0.5">
                                        {visibleChildren.map((child) => {
                                            const isChildActive = route().current(child.routeName) || route().current(child.routeName + '.*');
                                            return (
                                                <li key={child.name}>
                                                    <Link
                                                        href={route().has(child.routeName) ? route(child.routeName) : '#'}
                                                        className={`block px-3 py-2 text-[12px] rounded-md transition-colors duration-150 ease-out ${
                                                            isChildActive ? 'text-blue-400 bg-slate-800 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800 font-medium'
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
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-[12px] font-semibold rounded-md transition-[opacity,transform,visibility] duration-150 ease-out delay-75 opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 whitespace-nowrap z-[100] shadow-2xl border border-slate-700 pointer-events-none">
                                    {item.name}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-r-4 border-b-4 border-transparent border-r-slate-900"></div>
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
            <style>{`
                @keyframes drawerEnter {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>

            <aside
                className={`hidden md:flex flex-col bg-[#0F172A] transition-[width] duration-300 ease-in-out z-40 shrink-0 h-full relative ${
                    isCollapsed ? 'w-[76px]' : 'w-[240px]'
                }`}
            >
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-slate-800 pointer-events-none z-0"></div>

                <div className="h-16 flex items-center justify-between px-3 shrink-0 relative z-20 bg-[#0F172A] border-b border-slate-800">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`shrink-0 transition-[margin] duration-300 ease-in-out ${isCollapsed ? 'mx-auto' : ''}`}>
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                <img src="/logoBPS.webp" alt="Logo BPS" className="w-full h-full object-contain p-0.5" />
                            </div>
                        </div>

                        <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-0.5">Badan Pusat Statistik</span>
                            <span className="text-[13px] font-bold text-white tracking-tight leading-none">KOTA PROBOLINGGO</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-150 ease-out focus:outline-none shrink-0 ${isCollapsed ? 'absolute left-1/2 -translate-x-1/2 mt-12' : ''}`}
                    >
                        {isCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={2.5} /> : <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {renderNavigation(false)}
                </nav>

                <div className="border-t border-slate-800 shrink-0 relative z-20 bg-[#0F172A]">
                    <ul className="py-4 pl-3 pr-0 w-full">
                        <li className={`relative w-full ${route().current('profile.edit') && !isCollapsed ? 'bg-slate-50 rounded-l-xl z-20' : 'pr-3 z-10'}`}>
                            {route().current('profile.edit') && !isCollapsed && (
                                <>
                                    <div className="absolute -top-4 right-0 w-4 h-4 bg-transparent rounded-br-xl shadow-[4px_4px_0_4px_#f8fafc] pointer-events-none z-20"></div>
                                    <div className="absolute -bottom-4 right-0 w-4 h-4 bg-transparent rounded-tr-xl shadow-[4px_-4px_0_4px_#f8fafc] pointer-events-none z-20"></div>
                                </>
                            )}
                            <Link
                                href={route('profile.edit')}
                                className={`flex items-center py-1.5 transition-colors duration-150 ease-out focus:outline-none ${
                                    route().current('profile.edit') && !isCollapsed
                                    ? 'px-3 text-blue-700'
                                    : isCollapsed
                                    ? 'justify-center px-0'
                                    : 'px-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg'
                                }`}
                            >
                                <div className={`w-[32px] h-[32px] shrink-0 rounded-md flex items-center justify-center transition-colors duration-300 ${route().current('profile.edit') && !isCollapsed ? 'bg-blue-600 text-white shadow-md' : route().current('profile.edit') && isCollapsed ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
                                </div>
                                <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-2.5'} text-[13px] ${route().current('profile.edit') ? 'font-bold' : 'font-medium'}`}>
                                    Pengaturan
                                </span>
                            </Link>

                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-[12px] font-semibold rounded-md transition-[opacity,transform,visibility] duration-150 ease-out delay-75 opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 whitespace-nowrap z-[100] shadow-2xl border border-slate-700 pointer-events-none">
                                    Pengaturan
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-r-4 border-b-4 border-transparent border-r-slate-900"></div>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </aside>

            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                        style={{ animation: 'fadeIn 250ms ease-out forwards' }}
                        onClick={() => setIsMobileOpen(false)}
                    ></div>
                    <aside
                        className="fixed inset-y-0 left-0 w-[240px] bg-[#0F172A] shadow-2xl flex flex-col z-[70]"
                        style={{ animation: 'drawerEnter 280ms cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
                    >
                        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 relative z-10 bg-[#0F172A]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                    <img src="/logoBPS.webp" alt="Logo BPS" className="w-full h-full object-contain p-0.5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-0.5">BPS</span>
                                    <span className="text-[13px] font-bold text-white tracking-tight leading-none">KOTA PROBOLINGGO</span>
                                </div>
                            </div>
                            <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors duration-150 ease-out focus:outline-none">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {renderNavigation(true)}
                        </nav>
                        <div className="border-t border-slate-800 shrink-0 relative z-10 bg-[#0F172A]">
                            <ul className="py-4 pl-3 pr-3 w-full">
                                <li className="w-full">
                                    <Link href={route('profile.edit')} className="flex items-center py-2 px-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-150 ease-out">
                                        <div className="w-[32px] h-[32px] shrink-0 flex items-center justify-center">
                                            <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
                                        </div>
                                        <span className="ml-2.5 text-[13px] font-medium">
                                            Pengaturan
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
