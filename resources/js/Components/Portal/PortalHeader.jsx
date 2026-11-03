import { useEffect, useRef, useState } from 'react';

const links = [['profile', 'Tentang BPS'], ['team', 'Tim Kami'], ['services', 'Layanan'], ['applications', 'Aplikasi'], ['contact', 'Kontak']];

export default function PortalHeader({ portal }) {
    const headerRef = useRef(null);
    const buttonRef = useRef(null);
    const hiddenRef = useRef(false);
    const [hidden, setHidden] = useState(false);
    const [open, setOpen] = useState(false);
    const [failedLogo, setFailedLogo] = useState(null);
    const show = () => { hiddenRef.current = false; setHidden(false); };

    useEffect(() => {
        const hero = document.getElementById('portal-hero');
        const scrollY = () => Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
        let previousY = scrollY(), distance = 0, frame = 0;

        const update = () => {
            frame = 0;
            const y = scrollY();
            const delta = y - previousY;
            const keyboardFocus = headerRef.current?.querySelector(':focus-visible');
            let next = hiddenRef.current;

            if (open || keyboardFocus || !hero || hero.getBoundingClientRect().bottom > 0 || delta < 0) {
                next = false;
                distance = 0;
            } else if (delta > 0) {
                distance += delta;
                if (distance >= 12) next = true;
            }

            if (next !== hiddenRef.current) { hiddenRef.current = next; setHidden(next); }
            previousY = y;
        };

        const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
        const resize = () => { if (window.innerWidth >= 1024) setOpen(false); schedule(); };
        const outside = (event) => { if (!headerRef.current?.contains(event.target)) setOpen(false); };

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
        if (event.key === 'Escape' && open) { setOpen(false); buttonRef.current?.focus(); }
    };

    return (
        <header
            ref={headerRef} onFocusCapture={show} onKeyDown={closeOnEscape}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
            className={`fixed inset-x-0 top-0 z-50 border-b border-sky-100/80 bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 transition-transform duration-300 ease-out motion-reduce:transition-none ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 text-white text-xs py-2 px-4 overflow-hidden shadow-md shadow-sky-900/10 relative">
                <div className="flex w-max animate-marquee items-center gap-12 font-medium tracking-wide drop-shadow-sm">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-200 shrink-0 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        📢 Selamat Datang di Portal Resmi Badan Pusat Statistik. Dapatkan data statistik yang akurat, cepat, dan terpercaya untuk negeri!
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-200 shrink-0 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        📞 Layanan Pelanggan / WhatsApp: 0812-3456-7890 (Jam Kerja: 08.00 - 16.00 WIB)
                    </span>
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-200 shrink-0 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        ✉️ Email: bps@probolinggokota.go.id
                    </span>
                    <span className="flex items-center gap-2" aria-hidden="true">
                        <svg className="w-4 h-4 text-sky-200 shrink-0 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        📢 Selamat Datang di Portal Resmi Badan Pusat Statistik. Dapatkan data statistik yang akurat, cepat, dan terpercaya untuk negeri!
                    </span>
                </div>
            </div>

            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <a href="#main-content" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3 rounded-xl group transition-transform duration-300 hover:scale-[1.02]">
                    {portal.logo && failedLogo !== portal.logo
                        ? <img src={portal.logo} alt="" width="44" height="44" onError={() => setFailedLogo(portal.logo)} className="h-11 w-11 shrink-0 object-contain shadow-md rounded-lg transition-transform duration-300 group-hover:rotate-6" />
                        : <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-sm font-black text-white shadow-md shadow-sky-500/30 transition-transform duration-300 group-hover:rotate-6">BPS</span>}

                    <span className="min-w-0">
                        <strong className="block text-sm leading-snug text-slate-900 sm:text-base group-hover:text-sky-600 transition-colors drop-shadow-sm">{portal.institution}</strong>
                        <span className="block text-xs text-slate-500 font-medium">Portal informasi dan layanan</span>
                    </span>
                </a>

                <button ref={buttonRef} type="button" aria-expanded={open} aria-controls="portal-navigation" onClick={() => setOpen(!open)} className="min-h-11 shrink-0 rounded-xl border border-sky-200 bg-sky-50/50 px-4 text-sm font-semibold text-sky-700 shadow-sm transition-all duration-300 hover:bg-sky-100 hover:border-sky-300 hover:shadow active:scale-95 lg:hidden">
                    {open ? 'Tutup' : 'Menu'}
                </button>

                <nav
                    id="portal-navigation" aria-label="Navigasi utama"
                    className={`absolute inset-x-4 top-[calc(100%+0.5rem)] flex max-h-[calc(100svh-8rem)] flex-col overflow-y-auto rounded-2xl border border-sky-100 bg-white/95 backdrop-blur-xl p-2 shadow-2xl shadow-slate-900/10 transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none lg:visible lg:pointer-events-auto lg:static lg:mt-0 lg:max-h-none lg:translate-y-0 lg:flex-row lg:gap-1.5 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none ${open ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none -translate-y-2 opacity-0'}`}
                >
                    {links.map(([id, label]) => (
                        <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 hover:text-sky-600 hover:shadow-sm hover:translate-x-1 lg:hover:translate-x-0 lg:hover:-translate-y-0.5 active:scale-95 motion-reduce:transition-none">
                            {label}
                        </a>
                    ))}
                </nav>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 28s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </header>
    );
}
