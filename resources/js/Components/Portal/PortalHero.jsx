import { useEffect, useRef, useState } from 'react';

function DummyBuilding() {
    return (
        <svg
            viewBox="0 0 1200 650"
            preserveAspectRatio="xMidYMax slice"
            className="w-full h-full object-cover"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="portal-sky" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f2b48" />
                    <stop offset="100%" stopColor="#1a436e" />
                </linearGradient>
                <linearGradient id="portal-wall" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <pattern id="portal-windows" width="60" height="70" patternUnits="userSpaceOnUse">
                    <rect x="12" y="10" width="36" height="50" rx="4" fill="#3b82f6" opacity="0.3" />
                </pattern>
            </defs>
            <rect width="1200" height="650" fill="url(#portal-sky)" />
            <circle cx="1000" cy="150" r="120" fill="#38bdf8" opacity="0.15" />
            <rect x="250" y="280" width="700" height="370" rx="8" fill="url(#portal-wall)" />
            <rect x="290" y="320" width="620" height="330" fill="url(#portal-windows)" />
            <rect x="450" y="240" width="300" height="60" rx="6" fill="#1e293b" />
            <text x="600" y="278" textAnchor="middle" fill="#ffffff" fontFamily="sans-serif" fontSize="18" fontWeight="800" letterSpacing="4">
                BADAN PUSAT STATISTIK
            </text>
        </svg>
    );
}

function DummyEmployees() {
    return (
        <svg viewBox="0 0 1200 390" className="w-full h-full object-cover" aria-hidden="true">
            <g fill="#334155" opacity="0.9">
                <circle cx="300" cy="200" r="50" />
                <path d="M220 380 Q300 270 380 380 Z" />
                <circle cx="450" cy="180" r="55" fill="#1e293b" />
                <path d="M360 380 Q450 240 540 380 Z" fill="#1e293b" />
                <circle cx="600" cy="160" r="60" fill="#0f172a" />
                <path d="M500 380 Q600 220 700 380 Z" fill="#0f172a" />
                <circle cx="750" cy="180" r="55" fill="#1e293b" />
                <path d="M660 380 Q750 240 840 380 Z" fill="#1e293b" />
                <circle cx="900" cy="200" r="50" />
                <path d="M820 380 Q900 270 980 380 Z" />
            </g>
        </svg>
    );
}

export default function PortalHero({ portal }) {
    const sectionRef = useRef(null);
    const hero = portal?.hero ?? {};

    const [backgroundFailed, setBackgroundFailed] = useState(false);
    const [foregroundFailed, setForegroundFailed] = useState(false);

    useEffect(() => { setBackgroundFailed(false); }, [hero.image]);
    useEffect(() => { setForegroundFailed(false); }, [hero.foreground]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const motionQuery = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');

        let frameId = 0;
        let isVisible = true;

        const reset = () => {
            section.style.setProperty('--scroll-progress', '0');
            section.style.setProperty('--bg-y', '0px');
            section.style.setProperty('--bg-scale', '1');
            section.style.setProperty('--title-y', '0px');
            section.style.setProperty('--title-opacity', '1');
            section.style.setProperty('--fg-y', '0px');
            section.style.setProperty('--fg-scale', '1');
        };

        const updateParallax = () => {
            frameId = 0;

            if (!motionQuery.matches) {
                reset();
                return;
            }

            const rect = section.getBoundingClientRect();
            const scrolledDistance = Math.max(0, -rect.top);
            const totalScrollable = rect.height;
            const progress = Math.min(Math.max(scrolledDistance / totalScrollable, 0), 1);

            const bgY = scrolledDistance * 0.25;
            const bgScale = 1 + progress * 0.05;

            const titleY = scrolledDistance * 0.45;
            const titleOpacity = Math.max(0, 1 - progress * 1.8);

            const fgY = -scrolledDistance * 0.18;
            const fgScale = 1 + progress * 0.03;

            section.style.setProperty('--scroll-progress', progress.toFixed(3));
            section.style.setProperty('--bg-y', `${bgY.toFixed(1)}px`);
            section.style.setProperty('--bg-scale', bgScale.toFixed(3));
            section.style.setProperty('--title-y', `${titleY.toFixed(1)}px`);
            section.style.setProperty('--title-opacity', titleOpacity.toFixed(2));
            section.style.setProperty('--fg-y', `${fgY.toFixed(1)}px`);
            section.style.setProperty('--fg-scale', fgScale.toFixed(3));
        };

        const requestUpdate = () => {
            if (!frameId) {
                frameId = window.requestAnimationFrame(updateParallax);
            }
        };

        const onScroll = () => {
            if (isVisible && motionQuery.matches) {
                requestUpdate();
            }
        };

        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible) requestUpdate();
        }, { threshold: 0 });

        observer.observe(section);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', requestUpdate);
        motionQuery.addEventListener('change', requestUpdate);

        requestUpdate();

        return () => {
            observer.disconnect();
            if (frameId) window.cancelAnimationFrame(frameId);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', requestUpdate);
            motionQuery.removeEventListener('change', requestUpdate);
        };
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full bg-[#0b1320] text-white overflow-hidden" aria-labelledby="portal-heading">
            <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden flex items-center justify-center">

                <div
                    className="absolute inset-0 w-full h-full z-[1] pointer-events-none transition-transform duration-100 ease-out"
                    style={{ transform: 'translateY(var(--bg-y, 0px)) scale(var(--bg-scale, 1))' }}
                >
                    {hero.image && !backgroundFailed ? (
                        <img
                            src={hero.image}
                            alt="Gedung BPS Kota Probolinggo"
                            className="w-full h-full object-cover object-[center_30%]"
                            fetchPriority="high"
                            decoding="async"
                            onError={() => setBackgroundFailed(true)}
                        />
                    ) : (
                        <DummyBuilding />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0b1320]/40 via-[#0b1320]/20 to-[#0b1320]/70" />
                </div>

                <div
                    className="absolute inset-0 w-full h-full z-[2] flex items-center justify-center pb-[8vh] pointer-events-none transition-[transform,opacity] duration-100 ease-out"
                    style={{
                        transform: 'translateY(var(--title-y, 0px))',
                        opacity: 'var(--title-opacity, 1)'
                    }}
                >
                    <div className="text-center px-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                        <span className="inline-block text-xs sm:text-sm md:text-lg font-bold tracking-[0.35em] text-[#60a5fa] uppercase mb-2">
                            BADAN PUSAT STATISTIK
                        </span>
                        <h1 id="portal-heading" className="m-0 flex flex-col items-center leading-[0.95]">
                            <span className="text-[clamp(2rem,5vw,4rem)] font-light tracking-[0.2em] text-[#f8fafc]">KOTA</span>
                            <span className="text-[clamp(3rem,8vw,7rem)] font-black tracking-[0.05em] bg-gradient-to-b from-white via-white to-[#cbd5e1] bg-clip-text text-transparent">
                                PROBOLINGGO
                            </span>
                        </h1>
                    </div>
                </div>

                <div
                    className="absolute inset-0 w-full h-full z-[3] flex items-end justify-center pointer-events-none transition-transform duration-100 ease-out"
                    style={{ transform: 'translateY(var(--fg-y, 0px)) scale(var(--fg-scale, 1))' }}
                >
                    {hero.foreground && !foregroundFailed ? (
                        <img
                            src={hero.foreground}
                            alt={hero.foreground_alt || 'Pegawai BPS Kota Probolinggo'}
                            className="w-full max-w-[1400px] h-auto max-h-[70%] object-contain object-bottom filter drop-shadow-[0_-10px_25px_rgba(0,0,0,0.3)]"
                            fetchPriority="high"
                            decoding="async"
                            onError={() => setForegroundFailed(true)}
                        />
                    ) : (
                        <DummyEmployees />
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-[#0b1320] via-[#0b1320]/50 to-transparent z-[4] pointer-events-none" />

                {(!hero.image || backgroundFailed || !hero.foreground || foregroundFailed) && (
                    <span className="absolute top-6 right-6 z-10 bg-[#0f172a]/75 backdrop-blur-md border border-white/10 text-[#94a3b8] text-xs px-3 py-1.5 rounded-full">
                        Ilustrasi sementara
                    </span>
                )}
            </div>

            <div className="relative z-[5] max-w-7xl mx-auto -mt-12 px-6 pb-16">
                <div className="bg-[#0f172a]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                    <div>
                        <span className="inline-block text-xs font-bold tracking-[0.15em] text-[#38bdf8] mb-2">
                            PORTAL APLIKASI & LAYANAN
                        </span>
                        <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white m-0 mb-3 leading-tight">
                            Terhubung lebih mudah, dalam satu tempat.
                        </h2>
                        <p className="text-[#94a3b8] text-base leading-relaxed m-0 max-w-2xl">
                            {portal?.description}
                        </p>
                    </div>

                    <div>
                        <a
                            href="#applications"
                            className="inline-flex items-center gap-3 bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white font-semibold px-7 py-4 rounded-full no-underline whitespace-nowrap shadow-[0_10px_20px_rgba(2,132,199,0.3)] hover:brightness-110 transition-all duration-300"
                        >
                            <span>Jelajahi Aplikasi</span>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
