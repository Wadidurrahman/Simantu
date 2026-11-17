import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

function DummyBuilding() {
    return (
        <svg
            viewBox="0 0 1200 650"
            preserveAspectRatio="xMidYMax slice"
            className="h-full w-full object-cover"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="portal-sky" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c2d12" />
                    <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="portal-wall" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <pattern id="portal-windows" width="60" height="70" patternUnits="userSpaceOnUse">
                    <rect x="12" y="10" width="36" height="50" rx="4" fill="#f97316" opacity="0.35" />
                </pattern>
            </defs>
            <rect width="1200" height="650" fill="url(#portal-sky)" />
            <circle cx="1000" cy="150" r="140" fill="#fb923c" opacity="0.12" />
            <circle cx="220" cy="180" r="160" fill="#38bdf8" opacity="0.12" />
            <rect x="250" y="280" width="700" height="370" rx="8" fill="url(#portal-wall)" />
            <rect x="290" y="320" width="620" height="330" fill="url(#portal-windows)" />
        </svg>
    );
}

function DummyEmployees() {
    return (
        <svg viewBox="0 0 1200 390" className="h-full w-full object-cover" aria-hidden="true">
            <g fill="#9a3412" opacity="0.95">
                <circle cx="300" cy="200" r="50" />
                <path d="M220 380 Q300 270 380 380 Z" />
                <circle cx="450" cy="180" r="55" fill="#7c2d12" />
                <path d="M360 380 Q450 240 540 380 Z" fill="#7c2d12" />
                <circle cx="600" cy="160" r="60" fill="#c2410c" />
                <path d="M500 380 Q600 220 700 380 Z" fill="#c2410c" />
                <circle cx="750" cy="180" r="55" fill="#7c2d12" />
                <path d="M660 380 Q750 240 840 380 Z" fill="#7c2d12" />
                <circle cx="900" cy="200" r="50" />
                <path d="M820 380 Q900 270 980 380 Z" />
            </g>
        </svg>
    );
}

export default function PortalHero({ portal }) {
    const sectionRef = useRef(null);
    const hero = portal?.hero ?? {};

    const heroImage = hero.image || '/gedung-cutout.webp';
    const heroForeground = hero.foreground || '/Baliho.webp';

    const [backgroundFailed, setBackgroundFailed] = useState(false);
    const [foregroundFailed, setForegroundFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => { setBackgroundFailed(false); }, [heroImage]);
    useEffect(() => { setForegroundFailed(false); }, [heroForeground]);
    useEffect(() => {
        const timer = requestAnimationFrame(() => setLoaded(true));
        return () => cancelAnimationFrame(timer);
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frameId = 0;
        let isVisible = true;
        let currentScroll = 0;

        const applyStyles = (scrollVal, heightVal) => {
            const isMobile = window.innerWidth < 768;
            const factor = isMobile ? 0.45 : 1;
            const progress = Math.min(Math.max(scrollVal / Math.max(heightVal, 1), 0), 1);

            const bgY = scrollVal * 0.2 * factor;
            const bgScale = 1 + progress * 0.04;

            const titleY = scrollVal * 0.34 * factor;
            const titleOpacity = Math.max(0, 1 - progress * 1.75);

            const fgY = -scrollVal * 0.12 * factor;
            const fgScale = 1 + progress * 0.03;

            section.style.setProperty('--bg-y', `${bgY.toFixed(2)}px`);
            section.style.setProperty('--bg-scale', bgScale.toFixed(4));
            section.style.setProperty('--title-y', `${titleY.toFixed(2)}px`);
            section.style.setProperty('--title-opacity', titleOpacity.toFixed(3));
            section.style.setProperty('--fg-y', `${fgY.toFixed(2)}px`);
            section.style.setProperty('--fg-scale', fgScale.toFixed(4));
        };

        const tick = () => {
            frameId = 0;

            if (reducedMotion.matches) {
                currentScroll = 0;
                applyStyles(0, 1);
                return;
            }

            const rect = section.getBoundingClientRect();
            const targetScroll = Math.max(0, -rect.top);
            const diff = targetScroll - currentScroll;

            if (Math.abs(diff) > 0.1) {
                currentScroll += diff * 0.14;
                applyStyles(currentScroll, rect.height);
                if (isVisible) {
                    frameId = window.requestAnimationFrame(tick);
                }
            } else {
                currentScroll = targetScroll;
                applyStyles(currentScroll, rect.height);
            }
        };

        const requestTick = () => {
            if (!frameId) {
                frameId = window.requestAnimationFrame(tick);
            }
        };

        const onScroll = () => {
            if (isVisible) requestTick();
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible) requestTick();
            },
            { threshold: 0 }
        );

        observer.observe(section);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', requestTick);
        reducedMotion.addEventListener('change', requestTick);

        requestTick();

        return () => {
            observer.disconnect();
            if (frameId) window.cancelAnimationFrame(frameId);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', requestTick);
            reducedMotion.removeEventListener('change', requestTick);
        };
    }, []);

    return (
        <section
            id="portal-hero"
            ref={sectionRef}
            className="relative w-full overflow-hidden bg-[#08101e] text-white"
            aria-labelledby="portal-heading"
        >
            <div className="relative flex h-[72svh] min-h-[500px] max-h-[820px] w-full flex-col items-center overflow-hidden sm:h-[80svh] sm:min-h-[600px] lg:h-[88svh] lg:min-h-[700px]">

                <div
                    className="pointer-events-none absolute inset-0 z-[1] h-full w-full will-change-transform"
                    style={{
                        transform: 'translate3d(0, var(--bg-y, 0px), 0) scale(var(--bg-scale, 1))',
                    }}
                >
                    {heroImage && !backgroundFailed ? (
                        <img
                            src={heroImage}
                            alt={hero.alt || 'Gedung BPS Kota Probolinggo'}
                            className="h-full w-full object-cover object-[center_14%] sm:object-[center_18%]"
                            fetchPriority="high"
                            decoding="async"
                            onError={() => setBackgroundFailed(true)}
                        />
                    ) : (
                        <DummyBuilding />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-sky-900/10 to-[#08101e]/75" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(8,16,30,0.45)_100%)]" />
                </div>

                <div
                    className="pointer-events-none relative z-[2] flex w-full max-w-6xl flex-col items-center px-4 pt-[100px] text-center will-change-transform sm:px-6 sm:pt-[112px] lg:pt-[122px]"
                    style={{
                        transform: 'translate3d(0, var(--title-y, 0px), 0)',
                        opacity: 'var(--title-opacity, 1)',
                    }}
                >
                    <div
                        className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        }`}
                    >
                        <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.26em] text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-md sm:mb-3 sm:px-4 sm:py-1.5 sm:text-xs">
                            <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                            BADAN PUSAT STATISTIK
                        </span>
                        <h1
                            id="portal-heading"
                            className="m-0 bg-gradient-to-b from-white via-white to-sky-100 bg-clip-text text-[clamp(1.65rem,5vw,4.35rem)] font-black leading-none tracking-[0.04em] text-transparent drop-shadow-[0_6px_24px_rgba(8,16,30,0.75)]"
                        >
                            KOTA PROBOLINGGO
                        </h1>
                    </div>
                </div>

                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex h-full items-end justify-center will-change-transform"
                    style={{
                        transform: 'translate3d(0, var(--fg-y, 0px), 0) scale(var(--fg-scale, 1))',
                    }}
                >
                    {heroForeground && !foregroundFailed ? (
                        <img
                            src={heroForeground}
                            alt={hero.foreground_alt || 'Pegawai BPS Kota Probolinggo'}
                            className={`-mb-2 h-auto max-h-[88%] w-[130%] max-w-[850px] object-contain object-bottom transition-all duration-1000 delay-150 ease-[cubic-bezier(0.22,1,0.36,1)] filter drop-shadow-[0_-6px_14px_rgba(0,0,0,0.25)] sm:-mb-3 sm:max-h-[91%] sm:w-[125%] sm:max-w-[1100px] md:max-h-[93%] md:w-[118%] md:max-w-[1350px] lg:max-h-[95%] lg:w-[112%] lg:max-w-[1550px] xl:max-w-[1650px] ${
                                loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                            }`}
                            fetchPriority="auto"
                            decoding="async"
                            onError={() => setForegroundFailed(true)}
                        />
                    ) : (
                        <DummyEmployees />
                    )}
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-20 bg-gradient-to-t from-[#08101e] via-[#08101e]/70 to-transparent sm:h-28" />
            </div>

            <div className="relative z-[5] mx-auto -mt-8 max-w-7xl px-4 pb-14 sm:-mt-12 sm:px-6 sm:pb-16 lg:px-8">
                <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-[#0f172a]/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:gap-10 lg:p-11">
                    <div className="max-w-2xl">
                        <span className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400 sm:text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]" />
                            PORTAL APLIKASI &amp; LAYANAN
                        </span>
                        <h2 className="m-0 mb-2.5 text-[clamp(1.35rem,2.8vw,2.15rem)] font-bold leading-tight text-white">
                            Terhubung lebih mudah, dalam satu tempat.
                        </h2>
                        <p className="m-0 text-sm leading-relaxed text-slate-300 sm:text-base">
                            {portal?.description}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(249,115,22,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 sm:px-7 sm:py-4"
                        >
                            <span>Masuk SIMANTU</span>
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>

                        <a
                            href="#applications"
                            className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-sky-400/30 bg-sky-500/15 px-6 py-3.5 text-sm font-semibold text-sky-100 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-500/25 hover:text-white active:scale-95 sm:px-7 sm:py-4"
                        >
                            <span>Jelajahi Aplikasi</span>
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
