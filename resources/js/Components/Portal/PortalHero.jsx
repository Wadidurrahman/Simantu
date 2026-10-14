import { useEffect, useRef, useState } from 'react';

function DummyBuilding() {
    return (
        <svg
            viewBox="0 0 1200 650"
            preserveAspectRatio="xMidYMax slice"
            className="layered-hero-building"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="portal-dummy-sky" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dceaf2" />
                    <stop offset="100%" stopColor="#f1f5f3" />
                </linearGradient>

                <linearGradient id="portal-dummy-wall" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f8fafb" />
                    <stop offset="100%" stopColor="#d4dfe6" />
                </linearGradient>

                <pattern
                    id="portal-dummy-windows"
                    width="72"
                    height="84"
                    patternUnits="userSpaceOnUse"
                >
                    <rect
                        x="14"
                        y="12"
                        width="42"
                        height="54"
                        rx="2"
                        fill="#7096ac"
                    />
                    <path
                        d="M35 12v54M14 39h42"
                        stroke="#d8e6ee"
                        strokeWidth="3"
                    />
                </pattern>
            </defs>

            <rect width="1200" height="650" fill="url(#portal-dummy-sky)" />

            <circle cx="995" cy="130" r="65" fill="#f6e8bc" opacity=".6" />

            <path
                d="M0 510Q150 425 310 493T650 480T960 490T1200 455V650H0Z"
                fill="#bdd0c4"
            />

            <rect x="260" y="315" width="680" height="310" fill="#c8d5de" />

            <rect
                x="310"
                y="285"
                width="580"
                height="340"
                fill="url(#portal-dummy-wall)"
            />

            <rect x="340" y="335" width="520" height="252" fill="url(#portal-dummy-windows)" />

            <rect x="486" y="275" width="228" height="350" fill="#f5f7f7" />
            <rect x="520" y="335" width="160" height="290" fill="#40677e" />
            <rect x="550" y="365" width="100" height="260" fill="#284b60" />

            <rect x="300" y="275" width="600" height="18" fill="#7895a7" />

            <rect x="465" y="310" width="270" height="48" rx="4" fill="#234f6b" />

            <text
                x="600"
                y="341"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="system-ui, sans-serif"
                fontSize="18"
                fontWeight="700"
                letterSpacing="3"
            >
                BADAN PUSAT STATISTIK
            </text>

            <path d="M180 625h840l55 25H125Z" fill="#aebec8" />

            <g fill="#799c83">
                <circle cx="205" cy="485" r="70" />
                <circle cx="155" cy="525" r="60" />
                <circle cx="1020" cy="500" r="76" />
                <circle cx="1080" cy="540" r="60" />
            </g>

            <path
                d="M195 530v95M1040 540v85"
                stroke="#6c8275"
                strokeWidth="14"
            />
        </svg>
    );
}

function DummyEmployees() {
    const people = [
        { x: 150, y: 118, scale: 0.87, skin: '#c69273', shirt: '#edf2f4' },
        { x: 300, y: 83, scale: 1, skin: '#d5a386', shirt: '#dce7ef' },
        { x: 450, y: 107, scale: 0.93, skin: '#ba8668', shirt: '#f4f6f7' },
        { x: 600, y: 64, scale: 1.1, skin: '#d6a180', shirt: '#edf2f4' },
        { x: 750, y: 107, scale: 0.93, skin: '#c38c6d', shirt: '#dce7ef' },
        { x: 900, y: 83, scale: 1, skin: '#d8aa8d', shirt: '#f4f6f7' },
        { x: 1050, y: 118, scale: 0.87, skin: '#b98364', shirt: '#edf2f4' },
    ];

    return (
        <svg
            viewBox="0 0 1200 390"
            className="layered-hero-employees"
            aria-hidden="true"
        >
            <ellipse
                cx="600"
                cy="370"
                rx="530"
                ry="17"
                fill="#163c52"
                opacity=".12"
            />

            {people.map((person) => (
                <g
                    key={person.x}
                    transform={`translate(${person.x} ${person.y}) scale(${person.scale})`}
                >
                    <path
                        d="M-45 175h90l13 140H8L0 219l-8 96h-50Z"
                        fill="#2a4355"
                    />

                    <path
                        d="M-69 72Q-62 51-24 47h48q38 4 45 25l13 108H-82Z"
                        fill={person.shirt}
                    />

                    <path
                        d="M-67 81-80 184M67 81l13 103"
                        stroke={person.skin}
                        strokeWidth="18"
                        strokeLinecap="round"
                    />

                    <rect
                        x="-13"
                        y="26"
                        width="26"
                        height="30"
                        rx="8"
                        fill={person.skin}
                    />

                    <ellipse
                        cx="0"
                        cy="0"
                        rx="30"
                        ry="37"
                        fill={person.skin}
                    />

                    <path
                        d="M-30-5q-6-37 30-38 37 1 30 38l-8-15q-23 10-44 0Z"
                        fill="#253c49"
                    />

                    <path
                        d="M-24 49 0 75l24-26M0 75v92"
                        stroke="#a8bac6"
                        strokeWidth="2"
                        fill="none"
                    />

                    <rect
                        x="23"
                        y="91"
                        width="18"
                        height="22"
                        rx="2"
                        fill="#c6d6e0"
                    />

                    <path
                        d="m-14 66 14 65 14-65"
                        stroke="#587b93"
                        strokeWidth="3"
                        fill="none"
                    />

                    <rect
                        x="-10"
                        y="123"
                        width="20"
                        height="27"
                        rx="3"
                        fill="#ffffff"
                        stroke="#b6c8d3"
                    />
                </g>
            ))}
        </svg>
    );
}

export default function PortalHero({ portal }) {
    const sectionRef = useRef(null);

    const hero = portal.hero ?? {};

    const [backgroundFailed, setBackgroundFailed] = useState(false);
    const [foregroundFailed, setForegroundFailed] = useState(false);

    useEffect(() => {
        setBackgroundFailed(false);
    }, [hero.image]);

    useEffect(() => {
        setForegroundFailed(false);
    }, [hero.foreground]);

    useEffect(() => {
        const section = sectionRef.current;

        if (!section) {
            return;
        }

        const motionQuery = window.matchMedia(
            '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        );

        let frame = 0;
        let visible = true;

        const reset = () => {
            section.style.setProperty('--hero-background-y', '0px');
            section.style.setProperty('--hero-title-y', '0px');
            section.style.setProperty('--hero-foreground-y', '0px');
        };

        const update = () => {
            frame = 0;

            if (!motionQuery.matches) {
                reset();
                return;
            }

            const rect = section.getBoundingClientRect();
            const distance = Math.min(
                Math.max(-rect.top, 0),
                rect.height,
            );

            section.style.setProperty(
                '--hero-background-y',
                `${Math.min(distance * 0.04, 20)}px`,
            );

            section.style.setProperty(
                '--hero-title-y',
                `${Math.min(distance * 0.07, 32)}px`,
            );

            section.style.setProperty(
                '--hero-foreground-y',
                `${-Math.min(distance * 0.09, 42)}px`,
            );
        };

        const schedule = () => {
            if (!frame) {
                frame = window.requestAnimationFrame(update);
            }
        };

        const onScroll = () => {
            if (visible && motionQuery.matches) {
                schedule();
            }
        };

        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;

            if (visible) {
                schedule();
            }
        });

        observer.observe(section);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', schedule);
        motionQuery.addEventListener('change', schedule);

        schedule();

        return () => {
            observer.disconnect();
            window.cancelAnimationFrame(frame);

            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', schedule);
            motionQuery.removeEventListener('change', schedule);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="layered-hero"
            aria-labelledby="portal-heading"
        >
            <div className="layered-hero-stage">
                <div className="layered-hero-background">
                    {hero.image && !backgroundFailed ? (
                        <img
                            src={hero.image}
                            alt=""
                            className="layered-hero-background-photo"
                            fetchPriority="high"
                            decoding="async"
                            onError={() => setBackgroundFailed(true)}
                        />
                    ) : (
                        <DummyBuilding />
                    )}
                </div>

                <div className="layered-hero-tint" />

                <div className="layered-hero-title">
                    <p className="layered-hero-eyebrow">
                        BADAN PUSAT STATISTIK
                    </p>

                    <h1 id="portal-heading">
                        <span>KOTA</span>
                        <span>PROBOLINGGO</span>
                    </h1>
                </div>

                <div className="layered-hero-foreground">
                    {hero.foreground && !foregroundFailed ? (
                        <img
                            src={hero.foreground}
                            alt={hero.foreground_alt || 'Pegawai BPS Kota Probolinggo'}
                            className="layered-hero-foreground-photo"
                            fetchPriority="high"
                            decoding="async"
                            onError={() => setForegroundFailed(true)}
                        />
                    ) : (
                        <DummyEmployees />
                    )}
                </div>

                <div className="layered-hero-bottom-fade" />

                {(!hero.image || backgroundFailed || !hero.foreground || foregroundFailed) && (
                    <span className="layered-hero-demo-label">
                        Ilustrasi sementara
                    </span>
                )}
            </div>

            <div className="layered-hero-content">
                <div>
                    <p className="layered-hero-content-label">
                        PORTAL APLIKASI & LAYANAN
                    </p>

                    <h2>Terhubung lebih mudah, dalam satu tempat.</h2>

                    <p>{portal.description}</p>
                </div>

                <a href="#applications" className="portal-button">
                    Jelajahi aplikasi
                    <span aria-hidden="true">↗</span>
                </a>
            </div>
        </section>
    );
}
