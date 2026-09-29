import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, PanelLeftClose, PanelLeftOpen, ChevronDown, UserCircle, LogOut, Maximize, Minimize } from 'lucide-react';

export default function Topbar({ user, isCollapsed, setIsCollapsed, setIsMobileOpen }) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();

    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(/:/g, '.');

    const [isFullscreen, setIsFullscreen] = useState(false);
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => console.log(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 shadow-sm">

            <div className="flex items-center">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <Menu className="h-35px w-35px" />
                </button>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:inline-flex items-center justify-center p-2 mr-4 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                    {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">

                <button
                    onClick={toggleFullscreen}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-md transition-colors focus:outline-none"
                    title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                >
                    {isFullscreen ? <Minimize className="w-[18px] h-[18px]" strokeWidth={2.5} /> : <Maximize className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                </button>

                {/* Divider 1 */}
                <div className="hidden lg:block h-7 w-px bg-slate-200"></div>

                {/* 2. Cluster Informasional Waktu (Tengah) */}
                <div className="hidden lg:flex flex-col items-end justify-center text-right px-1">
                    <span className="text-[13px] font-bold text-slate-800 leading-none mb-1 tracking-tight">
                        {formattedTime} <span className="text-[10px] text-slate-500 font-semibold ml-0.5">WIB</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {formattedDate}
                    </span>
                </div>

                {/* Divider 2 */}
                <div className="hidden sm:block h-7 w-px bg-slate-200"></div>

                {/* 3. Cluster Identitas Profil (Paling Kanan / Ujung) */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center rounded-full focus:outline-none transition-all gap-3 group px-1 py-1 hover:bg-slate-50"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-[13px] font-bold text-slate-800 leading-none group-hover:text-blue-600 transition-colors">
                                {user.nama}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                                {user.level === 'admin' ? 'Administrator' : 'Pegawai'}
                            </p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100 shadow-sm transition-colors group-hover:bg-blue-100 group-hover:border-blue-200 shrink-0">
                            {user.nama.charAt(0)}
                        </div>
                        <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                            <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-slate-200 z-50">
                                <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                                    <p className="text-sm font-bold text-slate-800">{user.nama}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{user.nip_baru}</p>
                                </div>
                                <Link href={route('profile.edit')} className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                    <UserCircle className="w-4 h-4 mr-3 text-slate-400" /> Profil Saya
                                </Link>
                                <div className="border-t border-slate-100 my-1"></div>
                                <Link href={route('logout')} method="post" as="button" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                    <LogOut className="w-4 h-4 mr-3 text-red-500" /> Keluar Sistem
                                </Link>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
}
