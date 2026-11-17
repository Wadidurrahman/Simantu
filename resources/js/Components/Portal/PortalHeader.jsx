import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const links = [
    ['applications', 'Aplikasi & Tools'],
    ['information', 'Informasi'],
    ['contact', 'Kontak'],
];

export default function PortalHeader({ portal }) {
    const headerRef = useRef(null);
    const buttonRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const [open, setOpen] = useState(false);
    const [failedLogo, setFailedLogo] = useState(null);

    const isExpanded = scrolled || open;
    const logoSrc = portal?.logo || '/logoBPS.webp';

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            const y = window.scrollY;
            setScrolled(y > 24);

            for (const [id] of [...links].reverse()) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= 180) {
                    setActiveSection(id);
                    break;
                }
            }
        };

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        const resize = () => {
            if (window.innerWidth >= 1024) setOpen(false);
            schedule();
        };

        const outside = (event) => {
            if (!headerRef.current?.contains(event.target)) setOpen(false);
        };

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', resize);
        if (open) document.addEventListener('pointerdown', outside);
        update();

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', resize);
            document.removeEventListener('pointerdown', outside);
        };
    }, [open]);

    const closeOnEscape = (event) => {
        if (event.key === 'Escape' && open) {
            setOpen(false);
            buttonRef.current?.focus();
        }
    };

    return (
        <header
            ref={headerRef}
            onKeyDown={closeOnEscape}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
            className="pointer-events-none fixed inset-x-0 top-0 z-50"
        >
            {/* 1. TOP BAR: Teks Bergerak (Selalu Tampil di Paling Atas) */}
            <div className="pointer-events-auto relative overflow-hidden border-b border-white/10 bg-[#081529]/90 px-4 py-1.5 text-[11px] text-slate-100 shadow-sm backdrop-blur-md sm:py-2 sm:text-xs">
                <div className="flex w-max animate-marquee items-center gap-12 font-medium tracking-wide">
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]" />
                        Selamat Datang di Portal Resmi <strong className="font-semibold text-orange-300">{portal?.institution || 'BPS Kota Probolinggo'}</strong> — Data Statistik Akurat &amp; Terpercaya
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 shrink-0 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        WhatsApp / Telepon: <span className="text-sky-200">{portal?.contact?.phone || '(0335) 421234'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 shrink-0 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email: <span className="text-sky-200">{portal?.contact?.email || 'bps3574@bps.go.id'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 shrink-0 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Jam Operasional: <span className="text-orange-300">{portal?.contact?.hours || 'Senin - Jumat, 08.00 - 16.00 WIB'}</span>
                    </span>
                    <span className="flex items-center gap-2" aria-hidden="true">
                        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]" />
                        Selamat Datang di Portal Resmi <strong className="font-semibold text-orange-300">{portal?.institution || 'BPS Kota Probolinggo'}</strong> — Data Statistik Akurat &amp; Terpercaya
                    </span>
                </div>
            </div>

            {/* 2. MAIN NAVBAR CONTAINER (Overlay di atas hero tanpa ruang ekstra) */}
            <div className="mx-auto max-w-7xl px-3 pt-2 sm:px-6 lg:px-8">
                <div
                    className={`pointer-events-auto relative flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isExpanded
                            ? 'h-14 rounded-tl-[2rem] rounded-tr-2xl rounded-b-2xl border border-sky-400/25 bg-gradient-to-r from-[#0284c7]/90 via-[#0369a1]/85 to-[#0f172a]/90 px-4 shadow-[0_14px_34px_rgba(2,132,199,0.28)] backdrop-blur-xl sm:h-[68px] sm:px-7'
                            : 'h-16 border border-transparent bg-transparent px-1'
                    }`}
                >
                    {/* LOGO + PUTARAN CAHAYA: Awal di Tengah -> Scroll Geser ke Samping KIRI */}
                    <a
                        href="#portal-hero"
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isExpanded
                                ? 'relative left-0 translate-x-0 flex-row text-left'
                                : 'absolute left-1/2 top-1 -translate-x-1/2 flex-col'
                        }`}
                    >
                        <div
                            className={`relative flex items-center justify-center rounded-2xl p-[2.5px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                isExpanded
                                    ? 'h-9 w-9 sm:h-11 sm:w-11 shadow-md'
                                    : 'h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shadow-[0_0_30px_rgba(251,146,60,0.35)]'
                            }`}
                        >
                            {/* Putaran Cahaya Conic Gradient */}
                            <span
                                aria-hidden="true"
                                className={`absolute inset-0 rounded-2xl animate-spin-slow transition-opacity duration-500 ${
                                    isExpanded ? 'opacity-75' : 'opacity-100'
                                }`}
                                style={{
                                    background: 'conic-gradient(from 0deg, transparent 0%, #fb923c 25%, #ffffff 50%, #38bdf8 75%, transparent 100%)',
                                }}
                            />

                            {/* Pendaran Cahaya Lembut saat Logo di Tengah */}
                            {!isExpanded && (
                                <span
                                    aria-hidden="true"
                                    className="absolute -inset-2 -z-10 animate-pulse rounded-3xl bg-gradient-to-tr from-sky-400/30 via-orange-400/25 to-cyan-300/30 blur-md"
                                />
                            )}

                            {/* Kotak Logo Utama */}
                            <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-[13px] bg-white">
                                {logoSrc && failedLogo !== logoSrc ? (
                                    <img
                                        src={logoSrc}
                                        alt="Logo BPS"
                                        onError={() => setFailedLogo(logoSrc)}
                                        className="h-full w-full object-contain p-1"
                                    />
                                ) : (
                                    <span
                                        aria-hidden="true"
                                        className={`bg-gradient-to-br from-sky-700 to-blue-900 bg-clip-text font-black tracking-tight text-transparent transition-all duration-500 ${
                                            isExpanded ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
                                        }`}
                                    >
                                        BPS
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Teks Instansi di samping kanan logo (Muncul saat di-scroll) */}
                        <div
                            className={`overflow-hidden transition-all duration-500 ${
                                isExpanded
                                    ? 'max-w-[210px] opacity-100'
                                    : 'pointer-events-none max-w-0 opacity-0'
                            }`}
                        >
                            <strong className="block truncate text-xs font-bold leading-tight text-white sm:text-sm">
                                {portal?.institution || 'BPS Kota Probolinggo'}
                            </strong>
                            <span className="block truncate text-[10px] font-medium text-orange-200 sm:text-[11px]">
                                Portal Data &amp; Layanan
                            </span>
                        </div>
                    </a>

                    {/* DERETAN MENU HORIZONTAL DI SEBELAH KANAN (Muncul saat di-scroll) */}
                    <nav
                        id="portal-navigation"
                        aria-label="Navigasi utama"
                        className={`ml-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            open
                                ? 'visible absolute inset-x-0 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-2xl border border-sky-400/25 bg-[#0f172a]/95 p-3 opacity-100 shadow-2xl backdrop-blur-xl lg:static lg:flex-row lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none'
                                : isExpanded
                                ? 'invisible pointer-events-none opacity-0 lg:visible lg:pointer-events-auto lg:flex lg:translate-x-0 lg:items-center lg:gap-1.5 lg:opacity-100'
                                : 'invisible pointer-events-none translate-x-4 opacity-0'
                        }`}
                    >
                        {links.map(([id, label]) => {
                            const active = activeSection === id;
                            return (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    onClick={() => {
                                        setActiveSection(id);
                                        setOpen(false);
                                    }}
                                    className={`group relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                                        active
                                            ? 'text-white'
                                            : 'text-sky-100/80 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {label}
                                    <span
                                        className={`absolute bottom-1 left-3.5 right-3.5 h-[2.5px] rounded-full bg-gradient-to-r from-orange-400 to-amber-300 transition-transform duration-300 ${
                                            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'
                                        }`}
                                    />
                                </a>
                            );
                        })}

                        <Link
                            href="/login"
                            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold tracking-wide text-white shadow-md shadow-orange-500/30 transition hover:brightness-110 lg:ml-3 lg:mt-0"
                        >
                            <span>SIMANTU</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </nav>
                    <button
                        ref={buttonRef}
                        type="button"
                        aria-expanded={open}
                        aria-controls="portal-navigation"
                        onClick={() => setOpen(!open)}
                        className={`ml-auto min-h-9 shrink-0 rounded-xl px-3 text-xs font-bold tracking-wide transition-all lg:hidden ${
                            isExpanded
                                ? 'border border-white/20 bg-white/15 text-white hover:bg-white/25'
                                : 'border border-white/20 bg-slate-950/60 text-white backdrop-blur-md'
                        }`}
                    >
                        {open ? 'Tutup' : 'Menu'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translate3d(0%, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 32s linear infinite;
                    will-change: transform;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3.5s linear infinite;
                }
            `}</style>
        </header>
    );
}
