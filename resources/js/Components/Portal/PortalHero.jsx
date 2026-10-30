import { useEffect, useRef, useState } from 'react';

function DummyBuilding() {
    return (
        <svg
            viewBox="0 0 1200 650"
            preserveAspectRatio="xMidYMax slice"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
        <svg viewBox="0 0 1200 390" style={{ width: '100%', height: '100%', objectFit: 'cover' }} aria-hidden="true">
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

        const motionQuery = window.matchMedia(
            '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
        );

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

    const styles = {
        section: {
            position: 'relative',
            width: '100%',
            backgroundColor: '#0b1320',
            color: '#ffffff',
            overflow: 'hidden'
        },
        viewport: {
            position: 'relative',
            width: '100%',
            height: '85vh',
            minHeight: '600px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        layerBg: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            transform: 'translateY(var(--bg-y, 0px)) scale(var(--bg-scale, 1))',
            transition: 'transform 0.1s cubic-bezier(0, 0, 0.2, 1)',
            pointerEvents: 'none'
        },
        imgBg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%'
        },
        overlay: {
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11, 19, 32, 0.4) 0%, rgba(11, 19, 32, 0.2) 40%, rgba(11, 19, 32, 0.7) 100%)'
        },
        layerTitle: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '8vh',
            transform: 'translateY(var(--title-y, 0px))',
            opacity: 'var(--title-opacity, 1)',
            transition: 'transform 0.1s cubic-bezier(0, 0, 0.2, 1), opacity 0.1s linear',
            pointerEvents: 'none'
        },
        titleContainer: {
            textAlign: 'center',
            padding: '0 1.5rem',
            filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))'
        },
        eyebrow: {
            display: 'inline-block',
            fontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: '#60a5fa',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
        },
        heading: {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 0.95
        },
        headingSub: {
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#f8fafc'
        },
        headingMain: {
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            background: 'linear-gradient(180deg, #ffffff 30%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        layerFg: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 3,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            transform: 'translateY(var(--fg-y, 0px)) scale(var(--fg-scale, 1))',
            transition: 'transform 0.1s cubic-bezier(0, 0, 0.2, 1)',
            pointerEvents: 'none'
        },
        imgFg: {
            width: '100%',
            maxWidth: '1400px',
            height: 'auto',
            maxHeight: '70%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            filter: 'drop-shadow(0 -10px 25px rgba(0, 0, 0, 0.3))'
        },
        bottomFade: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to top, #0b1320 10%, transparent 100%)',
            zIndex: 4,
            pointerEvents: 'none'
        },
        badge: {
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            fontSize: '0.75rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px'
        },
        contentWrapper: {
            position: 'relative',
            zIndex: 5,
            maxWidth: '1200px',
            margin: '-3rem auto 0 auto',
            padding: '0 1.5rem 4rem 1.5rem'
        },
        contentCard: {
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        },
        contentTag: {
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#38bdf8',
            marginBottom: '0.5rem'
        },
        contentTextH2: {
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 0.75rem 0',
            lineHeight: 1.2
        },
        contentTextP: {
            color: '#94a3b8',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '650px'
        },
        btnPrimary: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            fontWeight: 600,
            padding: '1rem 1.75rem',
            borderRadius: '9999px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 20px rgba(2, 132, 199, 0.3)',
            transition: 'all 0.3s ease'
        },
        btnIcon: {
            width: '1.25rem',
            height: '1.25rem'
        }
    };

    return (
        <section
            ref={sectionRef}
            style={styles.section}
            aria-labelledby="portal-heading"
        >
            <div style={styles.viewport}>
                <div style={styles.layerBg}>
                    {hero.image && !backgroundFailed ? (
                        <img
                            src={hero.image}
                            alt="Gedung BPS Kota Probolinggo"
                            style={styles.imgBg}
                            fetchPriority="high"
                            decoding="async"
                            onError={() => setBackgroundFailed(true)}
                        />
                    ) : (
                        <DummyBuilding />
                    )}
                    <div style={styles.overlay} />
                </div>

                <div style={styles.layerTitle}>
                    <div style={styles.titleContainer}>
                        <span style={styles.eyebrow}>
                            BADAN PUSAT STATISTIK
                        </span>
                        <h1 id="portal-heading" style={styles.heading}>
                            <span style={styles.headingSub}>KOTA</span>
                            <span style={styles.headingMain}>PROBOLINGGO</span>
                        </h1>
                    </div>
                </div>

                <div style={styles.layerFg}>
                    {hero.foreground && !foregroundFailed ? (
                        <img
                            src={hero.foreground}
                            alt={hero.foreground_alt || 'Pegawai BPS Kota Probolinggo'}
                            style={styles.imgFg}
                            fetchPriority="high"
                            decoding="async"
                            onError={() => setForegroundFailed(true)}
                        />
                    ) : (
                        <DummyEmployees />
                    )}
                </div>

                <div style={styles.bottomFade} />

                {(!hero.image || backgroundFailed || !hero.foreground || foregroundFailed) && (
                    <span style={styles.badge}>
                        Ilustrasi sementara
                    </span>
                )}
            </div>

            <div style={styles.contentWrapper}>
                <div className="hero-content-card" style={styles.contentCard}>
                    <div>
                        <span style={styles.contentTag}>
                            PORTAL APLIKASI & LAYANAN
                        </span>
                        <h2 style={styles.contentTextH2}>Terhubung lebih mudah, dalam satu tempat.</h2>
                        <p style={styles.contentTextP}>{portal?.description}</p>
                    </div>

                    <div>
                        <a href="#applications" style={styles.btnPrimary}>
                            <span>Jelajahi Aplikasi</span>
                            <svg style={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .hero-content-card {
                        flex-direction: row !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        padding: 3rem !important;
                    }
                }
            `}</style>
        </section>
    );
}
