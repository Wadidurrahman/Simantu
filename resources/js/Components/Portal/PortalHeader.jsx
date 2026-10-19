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
        let previousY = Math.max(0, window.scrollY), frame = 0;

        const update = () => {
            frame = 0;
            const y = Math.max(0, window.scrollY);
            const next = open || !hero || hero.getBoundingClientRect().bottom > 0
                ? false
                : y === previousY ? hiddenRef.current : y > previousY;

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

    const onKeyDown = (event) => {
        if (event.key === 'Escape' && open) { setOpen(false); buttonRef.current?.focus(); }
    };

    return (
        <header ref={headerRef} onFocusCapture={show} onKeyDown={onKeyDown} className={`fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-transform duration-200 motion-reduce:transition-none ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <a href="#main-content" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3 rounded-lg">
                    {portal.logo && failedLogo !== portal.logo
                        ? <img src={portal.logo} alt="" width="44" height="44" className="h-11 w-11 shrink-0 object-contain" onError={() => setFailedLogo(portal.logo)} />
                        : <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-900 text-sm font-black text-white">BPS</span>}
                    <span className="min-w-0">
                        <strong className="block text-sm leading-snug text-slate-900 sm:text-base">{portal.institution}</strong>
                        <span className="block truncate text-xs text-slate-600">Portal informasi dan layanan</span>
                    </span>
                </a>

                <button ref={buttonRef} type="button" aria-expanded={open} aria-controls="portal-navigation" onClick={() => setOpen(!open)} className="min-h-11 shrink-0 rounded-xl border border-slate-300 px-4 text-sm font-semibold lg:hidden">
                    {open ? 'Tutup' : 'Menu'}
                </button>

                <nav id="portal-navigation" aria-label="Navigasi utama" className={`${open ? 'flex' : 'hidden'} absolute inset-x-4 top-full mt-2 flex-col rounded-2xl border border-slate-200 bg-white p-2 shadow-lg lg:static lg:mt-0 lg:flex lg:flex-row lg:gap-1 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
                    {links.map(([id, label]) => (
                        <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-800">{label}</a>
                    ))}
                </nav>
            </div>
        </header>
    );
}
