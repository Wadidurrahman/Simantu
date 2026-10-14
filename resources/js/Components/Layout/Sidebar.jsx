import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid, Activity, Map, Wallet, Users, Database, FileText, Settings, X, ChevronDown, Circle, ChevronLeft, ChevronRight, ClipboardList
} from 'lucide-react';

const navigationItems = [
    {
        name: 'Dashboard',
        routeName: 'dashboard',
        icon: LayoutGrid,
        roles: ['admin', 'ketua', 'ketua_tim', 'pegawai', 'mitra']
    },
    {
        name: 'Manajemen Kegiatan',
        icon: Activity,
        roles: ['admin', 'ketua', 'ketua_tim', 'pegawai'],
        children: [
            { name: 'Daftar Kegiatan', routeName: 'kegiatan.index', roles: ['admin', 'ketua', 'ketua_tim', 'pegawai'] },
            { name: 'Realisasi Kinerja', routeName: 'kegiatan.realisasi', roles: ['admin', 'ketua', 'ketua_tim', 'pegawai'] },
        ]
    },
    {
        name: 'Tugas Saya',
        icon: ClipboardList,
        roles: ['mitra'],
        children: [
            { name: 'Daftar Tugas', routeName: 'mitra.tugas', roles: ['mitra'] },
        ]
    },
    {
        name: 'Perjalanan Dinas',
        icon: Map,
        roles: ['admin', 'ketua', 'ketua_tim', 'pegawai'],
        children: [
            { name: 'Master Translok', routeName: 'translok.master.index', roles: ['admin', 'ketua', 'ketua_tim'] },
            { name: 'Alokasi Translok', routeName: 'translok.alokasi', roles: ['admin', 'ketua', 'ketua_tim'] },
            { name: 'Detail Perjalanan', routeName: 'translok.detail', roles: ['admin', 'ketua', 'ketua_tim', 'pegawai'] },
            { name: 'Tanggal Off', routeName: 'translok.off', roles: ['admin', 'ketua', 'ketua_tim', 'pegawai'] },
        ]
    },
    {
        name: 'Honorarium & Mitra',
        icon: Users,
        roles: ['admin', 'ketua', 'ketua_tim'],
        children: [
            { name: 'Data Mitra BPS', routeName: 'mitra.index', roles: ['admin', 'ketua', 'ketua_tim'] },
            { name: 'Alokasi Honor', routeName: 'honor.index', roles: ['admin', 'ketua', 'ketua_tim'] },
        ]
    },
    {
        name: 'Honorarium Saya',
        icon: Wallet,
        roles: ['mitra'],
        children: [
            { name: 'Riwayat Honor', routeName: 'mitra.honor', roles: ['mitra'] },
        ]
    },
    {
        name: 'Master Data',
        icon: Database,
        roles: ['admin', 'ketua', 'ketua_tim'],
        children: [
            { name: 'Pegawai Organik', routeName: 'pegawai.index', roles: ['admin', 'ketua', 'ketua_tim'] },
            { name: 'Master Wilayah', routeName: 'wilayah.index', roles: ['admin', 'ketua', 'ketua_tim'] },
        ]
    },
    {
        name: 'Laporan',
        icon: FileText,
        roles: ['admin', 'ketua', 'ketua_tim'],
        children: [
            { name: 'Rekapitulasi', routeName: 'laporan.rekap', roles: ['admin', 'ketua', 'ketua_tim'] },
            { name: 'Monitoring Anggaran', routeName: 'laporan.anggaran', roles: ['admin', 'ketua', 'ketua_tim'] },
        ]
    }
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const { auth, url } = usePage().props;

    const rawRole = (
    auth.user?.effective_role ||
    auth.user?.role ||
    auth.user?.role_name ||
    ''
)
    .toString()
    .toLowerCase();

const userRole = ['ketua', 'ketua_tim'].includes(rawRole)
    ? 'ketua'
    : rawRole || 'pegawai';

    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        const initialOpenState = {};
        navigationItems.forEach((item, index) => {
            if (!item.roles.includes(userRole)) return;

            if (item.children) {
                const visibleChildren = item.children.filter(child => child.roles.includes(userRole));
                const hasActiveChild = visibleChildren.some(child =>
                    route().current(child.routeName) || route().current(child.routeName + '.*')
                );
                if (hasActiveChild) initialOpenState[index] = true;
            }
        });
        setOpenMenus(prev => ({ ...prev, ...initialOpenState }));
    }, [userRole, url]);

    const toggleMenu = (index) => {
        if (isCollapsed) return;
        setOpenMenus(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const renderNavigation = (isMobile = false) => {
        const collapsedState = isMobile ? false : isCollapsed;
        const filteredNavItems = navigationItems.filter(item => item.roles.includes(userRole));

        return (
            <ul className={`space-y-2 py-5 relative z-10 ${collapsedState ? 'px-3' : 'pl-3 pr-0'}`}>
                {filteredNavItems.map((item, index) => {
                    const visibleChildren = item.children
                        ? item.children.filter(child => child.roles.includes(userRole))
                        : null;

                    if (item.children && visibleChildren.length === 0) return null;

                    const hasActiveChild = visibleChildren
                        ? visibleChildren.some(child => route().current(child.routeName) || route().current(child.routeName + '.*'))
                        : (route().current(item.routeName) || route().current(item.routeName + '.*'));

                    const liClasses = `group/item relative ${
                        hasActiveChild && !collapsedState
                            ? 'bg-slate-50 rounded-l-2xl w-full relative z-20'
                            : 'w-full pr-3 relative z-10'
                    }`;

                    return (
                        <li key={item.name} className={liClasses}>
                            {hasActiveChild && !collapsedState && (
                                <>
                                    <div className="absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-2xl shadow-[6px_6px_0_6px_#f8fafc] pointer-events-none z-20" />
                                    <div className="absolute -bottom-5 right-0 w-5 h-5 bg-transparent rounded-tr-2xl shadow-[6px_-6px_0_6px_#f8fafc] pointer-events-none z-20" />
                                </>
                            )}

                            {visibleChildren ? (
                                <button
                                    onClick={() => toggleMenu(index)}
                                    className={`w-full flex items-center justify-between py-2 transition-all duration-200 ease-out focus:outline-none ${
                                        hasActiveChild && !collapsedState
                                            ? 'px-3 text-blue-700'
                                            : collapsedState
                                                ? 'justify-center px-0'
                                                : 'px-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center justify-center w-full lg:w-auto">
                                        <div className={`w-[38px] h-[38px] shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            hasActiveChild && !collapsedState
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : hasActiveChild && collapsedState
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 scale-110'
                                                : 'text-slate-400 group-hover/item:text-slate-200 group-hover/item:bg-slate-800'
                                        }`}>
                                            <item.icon className="w-[19px] h-[19px]" strokeWidth={2} />
                                        </div>

                                        <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out ${
                                            collapsedState ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'
                                        } text-[13px] ${hasActiveChild ? 'font-bold' : 'font-medium'}`}>
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
                                    className={`flex items-center py-2 transition-all duration-200 ease-out focus:outline-none ${
                                        hasActiveChild && !collapsedState
                                            ? 'px-3 text-blue-700'
                                            : collapsedState
                                                ? 'justify-center px-0'
                                                : 'px-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl'
                                    }`}
                                    onClick={() => isMobile && setIsMobileOpen(false)}
                                >
                                    <div className="flex items-center justify-center w-full lg:w-auto">
                                        <div className={`w-[38px] h-[38px] shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            hasActiveChild && !collapsedState
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : hasActiveChild && collapsedState
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 scale-110'
                                                : 'text-slate-400 group-hover/item:text-slate-200 group-hover/item:bg-slate-800'
                                        }`}>
                                            <item.icon className="w-[19px] h-[19px]" strokeWidth={2} />
                                        </div>

                                        <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out ${
                                            collapsedState ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'
                                        } text-[13px] ${hasActiveChild ? 'font-bold' : 'font-medium'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {collapsedState && visibleChildren && (
                                <div className="absolute left-full top-0 ml-3.5 w-52 bg-slate-900 text-white rounded-2xl transition-all duration-200 ease-out opacity-0 invisible -translate-x-2 group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0 z-[100] shadow-2xl border border-slate-700/80 py-2 pointer-events-auto">
                                    <div className="absolute top-4 -left-1.5 border-t-4 border-r-4 border-b-4 border-transparent border-r-slate-900" />
                                    <div className="px-3.5 py-1.5 border-b border-slate-800 mb-1">
                                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{item.name}</span>
                                    </div>
                                    <ul className="px-2 space-y-1">
                                        {visibleChildren.map((child) => {
                                            const isChildActive = route().current(child.routeName) || route().current(child.routeName + '.*');
                                            return (
                                                <li key={child.name}>
                                                    <Link
                                                        href={route().has(child.routeName) ? route(child.routeName) : '#'}
                                                        className={`block px-3 py-2 text-[12px] rounded-xl transition-colors duration-150 ease-out ${
                                                            isChildActive ? 'text-blue-400 bg-slate-800 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
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
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-xl transition-all duration-150 ease-out opacity-0 invisible -translate-x-2 group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0 whitespace-nowrap z-[100] shadow-2xl border border-slate-700/80 pointer-events-none">
                                    {item.name}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-r-4 border-b-4 border-transparent border-r-slate-900" />
                                </div>
                            )}

                            {!collapsedState && visibleChildren && (
                                <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${openMenus[index] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <ul className="mt-1 mb-2 space-y-1 pl-11 pr-4 relative z-10 w-full">
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
                className={`hidden lg:flex flex-col bg-[#0F172A] transition-[width] duration-300 ease-in-out z-40 shrink-0 h-screen sticky top-0 relative overflow-visible ${
                    isCollapsed ? 'w-[76px]' : 'w-[240px]'
                }`}
            >
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-5 z-50 w-6 h-6 bg-blue-800 border border--700 text-slate-200 hover:text-white hover:bg-blue-600 rounded-full flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none"
                    title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                </button>

                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-slate-800 pointer-events-none z-0" />

                <div className="h-16 flex items-center justify-between px-3 shrink-0 relative z-20 bg-[#0F172A] border-b border-slate-800">
                    <div className="flex items-center gap-2.5 overflow-hidden w-full justify-center lg:justify-start">
                        <div className="shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                <img src="/logoBPS.webp" alt="Logo BPS" className="w-full h-full object-contain p-0.5" />
                            </div>
                        </div>

                        <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out ${
                            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'
                        }`}>
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-0.5">Badan Pusat Statistik</span>
                            <span className="text-[13px] font-bold text-white tracking-tight leading-none">KOTA PROBOLINGGO</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto overflow-x-visible relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {renderNavigation(false)}
                </nav>

                <div className="border-t border-slate-800 shrink-0 relative z-20 bg-[#0F172A]">
                    <ul className={`py-4 ${isCollapsed ? 'px-3' : 'pl-3 pr-0'} w-full`}>
                        <li className={`group/item relative w-full ${route().current('profile.edit') && !isCollapsed ? 'bg-slate-50 rounded-l-2xl z-20' : 'pr-3 z-10'}`}>
                            {route().current('profile.edit') && !isCollapsed && (
                                <>
                                    <div className="absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-2xl shadow-[6px_6px_0_6px_#f8fafc] pointer-events-none z-20" />
                                    <div className="absolute -bottom-5 right-0 w-5 h-5 bg-transparent rounded-tr-2xl shadow-[6px_-6px_0_6px_#f8fafc] pointer-events-none z-20" />
                                </>
                            )}
                            <Link
                                href={route().has('profile.edit') ? route('profile.edit') : '#'}
                                className={`flex items-center py-1.5 transition-colors duration-150 ease-out focus:outline-none ${
                                    route().current('profile.edit') && !isCollapsed
                                        ? 'px-3 text-blue-700'
                                        : isCollapsed
                                        ? 'justify-center px-0'
                                        : 'px-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl'
                                }`}
                            >
                                <div className={`w-[38px] h-[38px] shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    route().current('profile.edit') && !isCollapsed
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : route().current('profile.edit') && isCollapsed
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 scale-110'
                                        : 'text-slate-400 group-hover/item:text-slate-200 group-hover/item:bg-slate-800'
                                }`}>
                                    <Settings className="w-[19px] h-[19px]" strokeWidth={2} />
                                </div>
                                <span className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out ${
                                    isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'
                                } text-[13px] ${route().current('profile.edit') ? 'font-bold' : 'font-medium'}`}>
                                    Pengaturan
                                </span>
                            </Link>

                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-xl transition-all duration-150 ease-out opacity-0 invisible -translate-x-2 group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0 whitespace-nowrap z-[100] shadow-2xl border border-slate-700/80 pointer-events-none">
                                    Pengaturan
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-r-4 border-b-4 border-transparent border-r-slate-900" />
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </aside>

            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        style={{ animation: 'fadeIn 250ms ease-out forwards' }}
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <aside
                        className="fixed inset-y-0 left-0 w-[240px] bg-[#0F172A] shadow-2xl flex flex-col z-[70]"
                        style={{ animation: 'drawerEnter 280ms cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
                    >
                        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 relative z-10 bg-[#0F172A]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
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
                                    <Link href={route().has('profile.edit') ? route('profile.edit') : '#'} className="flex items-center py-2 px-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors duration-150 ease-out">
                                        <div className="w-[38px] h-[38px] shrink-0 flex items-center justify-center">
                                            <Settings className="w-[19px] h-[19px]" strokeWidth={2} />
                                        </div>
                                        <span className="ml-3 text-[13px] font-medium">
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
