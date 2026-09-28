import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    FileText,
    Map,
    Activity,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Settings,
    ShieldCheck
} from 'lucide-react';

export default function AuthenticatedLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const role = auth.role;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard Utama', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { name: 'Kinerja (Giat)', href: '#', icon: Activity, active: route().current('giat.*') },
        { name: 'Perjalanan Dinas', href: '#', icon: Map, active: route().current('translok.*') },
        { name: 'Honorarium (Mitra)', href: '#', icon: FileText, active: route().current('honor.*') },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
            {showingNavigationDropdown && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setShowingNavigationDropdown(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#2d3748] text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl ${
                    showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 shrink-0 items-center px-6 bg-[#1a202c] border-b border-slate-700/50">
                    <div className="flex items-center gap-3 w-full">
                        <div className="bg-white p-1 rounded-md shrink-0">
                            <img src="/logoBPS.webp" alt="Logo BPS" className="h-7 w-7 object-contain" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-lg font-bold text-white tracking-wide truncate">SIMANTU 2026</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowingNavigationDropdown(false)}
                        className="ml-auto lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-5 border-b border-slate-700/50 bg-[#2d3748]">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">{user.name}</span>
                            <span className="text-xs text-blue-400 font-medium mt-0.5 truncate flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                {role === 'super_admin' ? 'Super Admin' : role === 'pimpinan' ? 'Pimpinan' : 'Pegawai'}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <div className="space-y-1.5 px-3">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 mt-2">
                            Menu Navigasi
                        </div>

                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    item.active
                                        ? 'bg-blue-600 text-white shadow-md' // Warna biru aktif ala sistem lama
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }`}
                            >
                                <item.icon className={`h-5 w-5 shrink-0 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {role === 'super_admin' && (
                        <div className="mt-8 space-y-1.5 px-3">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
                                Konfigurasi Sistem
                            </div>
                            <Link
                                href={route('pegawai.index')}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    route().current('pegawai.*')
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }`}
                            >
                                <Users className={`h-5 w-5 shrink-0 ${route().current('pegawai.*') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                Manajemen Pengguna
                            </Link>
                            <Link
                                href={route('profile.edit')}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    route().current('profile.*')
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }`}
                            >
                                <Settings className={`h-5 w-5 shrink-0 ${route().current('profile.*') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                Pengaturan Profil
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>

            <div className="flex flex-1 flex-col h-screen overflow-hidden min-w-0">

                <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm relative z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowingNavigationDropdown(true)}
                            className="lg:hidden text-slate-500 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none border border-transparent focus:border-slate-200"
                            >
                                <div className="flex flex-col text-right hidden sm:flex">
                                    <span className="text-sm font-bold text-slate-700 leading-tight">{user.name}</span>
                                    <span className="text-[10px] font-semibold text-slate-500">{user.nip_baru}</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-40 transform origin-top-right transition-all">
                                        <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.nip_baru}</p>
                                        </div>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <LogOut className="h-4 w-4" /> Keluar Aplikasi
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8 relative custom-scrollbar">
                    {flash?.success && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-[slideDown_0.3s_ease-out]">
                            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                            <p className="text-sm font-bold">{flash.success}</p>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
