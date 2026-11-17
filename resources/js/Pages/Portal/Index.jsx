import { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import PortalHeader from '../../Components/Portal/PortalHeader';
import PortalHero from '../../Components/Portal/PortalHero';
import InformationBanner from '../../Components/Portal/InformationBanner';
import ApplicationFilter from '../../Components/Portal/ApplicationFilter';
import ApplicationCard from '../../Components/Portal/ApplicationCard';
import PortalFooter from '../../Components/Portal/PortalFooter';

const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

function SectionHeading({ id, label, title, description, children }) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
            <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-600">{label}</p>
                <h2 id={id} className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
                {description && <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function ApplicationDirectory({ applications, categories }) {
    const trackRef = useRef(null);
    const [query, setQuery] = useState('');
    const [role, setRole] = useState('all');
    const [category, setCategory] = useState('all');
    const [isPaused, setIsPaused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const search = query.trim().toLocaleLowerCase('id');
    const filtered = applications.filter((item) => {
        const matchRole = role === 'all' || item.role === 'all' || item.role === role;
        const matchCategory = category === 'all' || item.category === category;
        const matchQuery = [item.name, item.description, item.audience, item.access_note]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('id')
            .includes(search);

        return matchRole && matchCategory && matchQuery;
    });

    const labels = Object.fromEntries(categories.map((item) => [item.id, item.label]));
    const hasFilters = query !== '' || role !== 'all' || category !== 'all';
    const reset = () => { setQuery(''); setRole('all'); setCategory('all'); };

    const getStepWidth = (track) => {
        const firstCard = track.querySelector('li');
        if (!firstCard) return 0;
        const gap = parseFloat(window.getComputedStyle(track).columnGap || '24') || 24;
        return firstCard.offsetWidth + gap;
    };

    const scrollToIndex = (nextIndex) => {
        const track = trackRef.current;
        if (!track || !filtered.length) return;

        const step = getStepWidth(track);
        if (!step) return;

        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const targetLeft = Math.min(nextIndex * step, maxScroll);

        track.scrollTo({ left: targetLeft, behavior: 'smooth' });
        setActiveIndex(nextIndex);
    };

    const handleNext = () => {
        const track = trackRef.current;
        if (!track || filtered.length <= 1) return;

        const maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 8) {
            scrollToIndex(0);
        } else {
            scrollToIndex(Math.min(activeIndex + 1, filtered.length - 1));
        }
    };

    const handlePrev = () => {
        const track = trackRef.current;
        if (!track || filtered.length <= 1) return;

        if (track.scrollLeft <= 8) {
            const step = getStepWidth(track);
            const visibleCards = step ? Math.max(1, Math.round(track.clientWidth / step)) : 1;
            const lastIndex = Math.max(0, filtered.length - visibleCards);
            scrollToIndex(lastIndex);
        } else {
            scrollToIndex(Math.max(activeIndex - 1, 0));
        }
    };

    useEffect(() => {
        setActiveIndex(0);
        if (trackRef.current) {
            trackRef.current.scrollTo({ left: 0, behavior: 'auto' });
        }
    }, [query, role, category]);

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (isPaused || reducedMotion.matches || filtered.length <= 3) return;

        const timer = window.setInterval(() => {
            const track = trackRef.current;
            if (!track) return;

            const maxScroll = track.scrollWidth - track.clientWidth;
            if (maxScroll <= 8) return;

            if (track.scrollLeft >= maxScroll - 8) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
                setActiveIndex(0);
            } else {
                const step = getStepWidth(track);
                const nextLeft = Math.min(track.scrollLeft + step, maxScroll);
                track.scrollTo({ left: nextLeft, behavior: 'smooth' });
                if (step > 0) setActiveIndex(Math.round(nextLeft / step));
            }
        }, 3800);

        return () => window.clearInterval(timer);
    }, [isPaused, filtered.length]);

    const handleTrackScroll = () => {
        const track = trackRef.current;
        if (!track) return;
        const step = getStepWidth(track);
        if (step > 0) {
            setActiveIndex(Math.round(track.scrollLeft / step));
        }
    };

    return (
        <section id="applications" aria-labelledby="applications-heading" className={`${container} scroll-mt-24 py-14 lg:py-20`}>
            <SectionHeading
                id="applications-heading"
                label="DIREKTORI TOOLS INTERNAL & MITRA"
                title="Pilih Aplikasi Kerja Anda"
                description="Saring berdasarkan peran (Pegawai Internal atau Mitra Statistik) maupun kategori kegiatan untuk membuka tools yang dibutuhkan."
            >
                <div className="flex items-center gap-2.5">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-900 sm:text-sm">
                        {applications.length} Tools Terdaftar
                    </span>

                    {filtered.length > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                aria-label="Geser aplikasi sebelumnya"
                                onClick={handlePrev}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:border-sky-600 hover:bg-sky-900 hover:text-white active:scale-95"
                            >
                                ←
                            </button>
                            <button
                                type="button"
                                aria-label="Geser aplikasi berikutnya"
                                onClick={handleNext}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:border-sky-600 hover:bg-sky-900 hover:text-white active:scale-95"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </SectionHeading>

            <div
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
            >
                <ApplicationFilter
                    query={query}
                    onQueryChange={setQuery}
                    role={role}
                    onRoleChange={setRole}
                    category={category}
                    onCategoryChange={setCategory}
                    categories={categories}
                    totalCount={applications.length}
                    filteredCount={filtered.length}
                />
            </div>

            {hasFilters && (
                <div className="mt-4 flex items-center justify-between text-sm">
                    <p role="status" aria-live="polite" className="text-slate-600">
                        Ditemukan <strong>{filtered.length}</strong> tools yang sesuai filter
                    </p>
                    <button type="button" onClick={reset} className="rounded-lg px-3 py-1.5 font-semibold text-orange-600 hover:bg-orange-50">
                        Reset Semua Filter
                    </button>
                </div>
            )}

            {filtered.length ? (
                <div
                    className="mt-8"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    <ul
                        ref={trackRef}
                        onScroll={handleTrackScroll}
                        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {filtered.map((item) => (
                            <li
                                key={item.id}
                                className="w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                            >
                                <ApplicationCard application={item} categoryLabel={labels[item.category] ?? 'Aplikasi'} />
                            </li>
                        ))}
                    </ul>

                    {filtered.length > 1 && (
                        <div className="mt-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                                {filtered.map((item, idx) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        aria-label={`Tampilkan ${item.name}`}
                                        onClick={() => scrollToIndex(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            idx === activeIndex
                                                ? 'w-7 bg-orange-500'
                                                : 'w-2 bg-slate-300 hover:bg-slate-400'
                                        }`}
                                    />
                                ))}
                            </div>

                            <span className="text-xs font-medium text-slate-400">
                                {isPaused ? 'Geser otomatis dijeda' : 'Geser otomatis aktif • Geser atau gunakan panah'}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <h3 className="text-lg font-bold text-slate-900">
                        {applications.length ? 'Tools tidak ditemukan' : 'Daftar tools belum tersedia'}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {applications.length ? 'Coba ubah kata kunci pencarian atau pilih peran "Semua Tools".' : 'Silakan kunjungi kembali halaman ini nanti.'}
                    </p>
                    {hasFilters && (
                        <button type="button" onClick={reset} className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                            Tampilkan Semua Tools
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}

export default function Index({ portal, applications = [], categories = [], banners = [], year }) {
    const mainRef = useRef(null);
    const { services = [], contact = {} } = portal;

    useEffect(() => {
        const root = document.documentElement;
        const added = ['scroll-smooth', 'motion-reduce:scroll-auto'].filter((name) => !root.classList.contains(name));
        root.classList.add(...added);

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const nodes = [...(mainRef.current?.querySelectorAll('[data-reveal]') ?? [])];
        const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) {
                    target.classList.remove('opacity-0', 'translate-y-4');
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.06 }) : null;

        const prepare = () => {
            observer?.disconnect();
            nodes.forEach((node) => {
                node.classList.remove('opacity-0', 'translate-y-4');
                if (observer && !motion.matches && node.getBoundingClientRect().top > window.innerHeight * 0.92) {
                    node.classList.add('opacity-0', 'translate-y-4');
                    observer.observe(node);
                }
            });
        };

        prepare();
        motion.addEventListener('change', prepare);

        return () => {
            root.classList.remove(...added);
            observer?.disconnect();
            motion.removeEventListener('change', prepare);
            nodes.forEach((node) => node.classList.remove('opacity-0', 'translate-y-4'));
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-sky-500 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-sky-500">
            <Head title={portal.title}><meta name="description" content={portal.description} /></Head>

            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-sky-900 focus:px-5 focus:py-3 focus:text-white">
                Lewati ke konten utama
            </a>

            <PortalHeader portal={portal} />

            <main ref={mainRef} id="main-content" tabIndex={-1} className="outline-none">
                <PortalHero portal={portal} />

                <ApplicationDirectory applications={applications} categories={categories} />

                {services.length > 0 && (
                    <section id="services" aria-labelledby="services-heading" className="scroll-mt-24 border-y border-slate-200/80 bg-white py-14 lg:py-20">
                        <div className={container}>
                            <SectionHeading
                                id="services-heading"
                                label="PUSAT BANTUAN & HELPDESK"
                                title="Dukungan Teknis & Administrasi"
                                description="Saluran bantuan resmi bagi pegawai dan mitra terkait akses akun, administrasi kontrak, maupun kendala aplikasi."
                            />
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {services.map((service, index) => (
                                    <article
                                        key={service.id}
                                        data-reveal
                                        style={{ transitionDelay: `${index * 80}ms` }}
                                        className="group flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-[transform,opacity,border-color,background-color] duration-500 hover:-translate-y-1 hover:border-sky-300 hover:bg-white sm:p-7"
                                    >
                                        <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-900 text-xs font-bold text-white">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <h3 className="mt-5 text-lg font-bold text-slate-900">{service.title}</h3>
                                        <p className="mb-6 mt-2.5 text-sm leading-6 text-slate-600">{service.description}</p>
                                        {service.url && (
                                            <a href={service.url} className="mt-auto inline-flex items-center justify-between border-t border-slate-200/80 pt-4 text-sm font-semibold text-sky-800 group-hover:text-orange-600">
                                                <span>{service.action || 'Hubungi Tim'}</span>
                                                <span aria-hidden="true">↗</span>
                                            </a>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {banners.length > 0 && (
                    <div data-reveal className={`${container} py-14 transition-[opacity,transform] duration-500 lg:py-20`}>
                        <InformationBanner banners={banners} />
                    </div>
                )}
            </main>

            <PortalFooter institution={portal.institution} year={year} contact={contact} />
        </div>
    );
}
