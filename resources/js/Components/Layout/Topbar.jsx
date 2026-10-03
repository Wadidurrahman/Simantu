import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, PanelLeftClose, PanelLeftOpen, ChevronDown, UserCircle, LogOut, Maximize, Minimize } from 'lucide-react';

export default function Topbar({ user, setIsMobileOpen }) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const displayName = user?.name || user?.nama || 'Pengguna';
    const displayRole = user?.role === 'mitra' ? 'Mitra BPS' : (user?.role === 'admin' || user?.level === 'admin' ? 'Administrator' : 'Pegawai BPS');
    const displayId = user?.nip_baru || user?.username || '-';
    const initial = displayName.charAt(0).toUpperCase();

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
        <>
            <style>{`
                @keyframes dropdownEnter {
                    from { opacity: 0; transform: translateY(-4px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150 ease-out"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={toggleFullscreen}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-md transition-colors duration-150 ease-out focus:outline-none"
                        title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                    >
                        {isFullscreen ? <Minimize className="w-[18px] h-[18px]" strokeWidth={2.5} /> : <Maximize className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                    </button>
                    <div className="hidden lg:block h-7 w-px bg-slate-200"></div>
                    <div className="hidden lg:flex flex-col items-end justify-center text-right px-1">
                        <span className="text-[13px] font-semibold text-slate-800 leading-none mb-1 tracking-tight">
                            {formattedTime} <span className="text-[10px] text-slate-500 font-medium ml-0.5">WIB</span>
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 tracking-wider">
                            {formattedDate}
                        </span>
                    </div>
                    <div className="hidden sm:block h-7 w-px bg-slate-200"></div>

                    <div className={`relative ${user?.must_change_password === 1 ? 'pointer-events-none' : ''}`}>
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center rounded-full focus:outline-none transition-colors duration-150 ease-out gap-3 group px-1 py-1 hover:bg-slate-50"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-semibold text-slate-800 leading-none group-hover:text-blue-600 transition-colors duration-150 ease-out">
                                    {displayName}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1.5">
                                    {displayRole}
                                </p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-slate-100 text-blue-700 flex items-center justify-center font-semibold border border-slate-200 transition-colors duration-150 ease-out group-hover:bg-blue-50 shrink-0">
                                {initial}
                            </div>
                            <ChevronDown
                                className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ease-in-out motion-reduce:transition-none group-hover:text-blue-600 shrink-0 ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'}`}
                            />
                        </button>
                        {isProfileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                                <div
                                    className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-slate-200 z-50"
                                    style={{ animation: 'dropdownEnter 180ms cubic-bezier(0.4, 0, 0.2, 1) forwards' }}
                                >
                                    <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                                        <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{displayId}</p>
                                    </div>
                                    <Link href={route('profile.edit')} className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors duration-150 ease-out">
                                        <UserCircle className="w-4 h-4 mr-3 text-slate-400" /> Profil Saya
                                    </Link>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <Link href={route('logout')} method="post" as="button" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 ease-out">
                                        <LogOut className="w-4 h-4 mr-3 text-red-500" /> Keluar Sistem
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}
