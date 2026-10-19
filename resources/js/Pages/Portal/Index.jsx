import { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import PortalHeader from '../../Components/Portal/PortalHeader';
import PortalHero from '../../Components/Portal/PortalHero';
import InformationBanner from '../../Components/Portal/InformationBanner';
import ApplicationFilter from '../../Components/Portal/ApplicationFilter';
import ApplicationCard from '../../Components/Portal/ApplicationCard';
import PortalFooter from '../../Components/Portal/PortalFooter';

const container = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';
const reveal = 'transition-[opacity,transform] duration-700 motion-reduce:transition-none focus-within:opacity-100 focus-within:translate-y-0';

function SectionHeading({ id, label, title, description, children }) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
            <div className="max-w-2xl">
                <p className="text-xs font-bold tracking-widest text-sky-700">{label}</p>
                <h2 id={id} className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
                {description && <p className="mt-4 leading-7 text-slate-600">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function Media({ src, alt = '', className = '', fit = 'object-cover', fallback = 'Foto belum tersedia' }) {
    const [failed, setFailed] = useState(null);

    return (
        <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
            {src && failed !== src
                ? <img src={src} alt={alt} width="640" height="480" loading="lazy" decoding="async" onError={() => setFailed(src)} className={`absolute inset-0 h-full w-full ${fit}`} />
                : <span className="absolute inset-0 grid place-items-center p-6 text-center text-sm font-semibold text-slate-500">{fallback}</span>}
        </div>
    );
}

function YouTubeVideo({ video }) {
    const [playing, setPlaying] = useState(null);
    const id = /^[A-Za-z0-9_-]{11}$/.test(video?.video_id ?? '') ? video.video_id : null;
    const title = video?.title || 'Video BPS';

    if (!id) return <div className="grid aspect-video place-items-center rounded-3xl bg-slate-100 p-6 text-center text-slate-500">Video belum tersedia.</div>;

    return (
        <div>
            <div className="aspect-video overflow-hidden rounded-3xl bg-slate-950">
                {playing === id ? (
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
                        title={title} ref={(frame) => frame?.focus()} allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="h-full w-full border-0"
                    />
                ) : (
                    <button type="button" aria-label={`Putar ${title}`} onClick={() => setPlaying(id)} className="group relative block h-full w-full text-white">
                        <Media src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full" fallback={title} />
                        <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-slate-950/30 transition-colors group-hover:bg-slate-950/50">
                            <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-2xl text-sky-900 shadow-lg">▶</span>
                        </span>
                    </button>
                )}
            </div>
            <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block py-2 text-sm font-semibold text-sky-800 hover:underline">
                Buka di YouTube ↗<span className="sr-only"> (tab baru)</span>
            </a>
        </div>
    );
}

function TeamSection({ members }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <section id="team" aria-labelledby="team-heading" className="scroll-mt-20 bg-slate-50 py-16 lg:py-24">
            <div className={container}>
                <SectionHeading id="team-heading" label="TIM KAMI" title="Kenali orang di balik pelayanan." description="Pegawai BPS Kota Probolinggo yang mendukung penyediaan data dan pelayanan statistik." />

                <ul id="portal-team-list" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {members.slice(0, expanded ? members.length : 6).map((member) => (
                        <li key={member.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <Media src={member.photo} alt={`Foto ${member.name}`} className="aspect-[4/5]" fit="object-cover object-top" />
                            <div className="p-5">
                                {member.is_leader && <p className="mb-2 text-xs font-bold tracking-widest text-sky-700">KEPALA KANTOR</p>}
                                <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                                <p className="mt-1 text-sm leading-6 text-slate-600">{member.position}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                {!members.length && <p className="text-slate-500">Informasi pegawai belum tersedia.</p>}

                {members.length > 6 && (
                    <button type="button" aria-expanded={expanded} aria-controls="portal-team-list" onClick={() => setExpanded(!expanded)} className="mt-8 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-50">
                        {expanded ? 'Tampilkan lebih sedikit' : `Lihat semua pegawai (${members.length})`}
                    </button>
                )}
            </div>
        </section>
    );
}

function ApplicationDirectory({ applications, categories }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const search = query.trim().toLocaleLowerCase('id');
    const filtered = applications.filter((item) =>
        (category === 'all' || item.category === category) &&
        [item.name, item.description, item.audience].filter(Boolean).join(' ').toLocaleLowerCase('id').includes(search),
    );
    const labels = Object.fromEntries(categories.map((item) => [item.id, item.label]));
    const hasFilters = query !== '' || category !== 'all';
    const reset = () => { setQuery(''); setCategory('all'); };

    return (
        <section id="applications" aria-labelledby="applications-heading" className={`${container} scroll-mt-20 py-16 lg:py-24`}>
            <SectionHeading id="applications-heading" label="DIREKTORI APLIKASI" title="Pilih layanan Anda." description="Akses layanan publik, sistem internal, dan aplikasi resmi sesuai kebutuhan.">
                <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800">{applications.length} aplikasi</span>
            </SectionHeading>

            <ApplicationFilter query={query} onQueryChange={setQuery} category={category} onCategoryChange={setCategory} categories={categories} />

            <div className="my-5 flex min-h-11 flex-wrap items-center justify-between gap-3 text-sm">
                <p role="status" aria-live="polite" aria-atomic="true" className="text-slate-600">Menampilkan {filtered.length} dari {applications.length} aplikasi</p>
                {hasFilters && <button type="button" onClick={reset} className="rounded-lg px-3 py-3 font-semibold text-sky-800 hover:bg-sky-50">Reset filter</button>}
            </div>

            {filtered.length ? (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((item) => <li key={item.id} className="min-w-0"><ApplicationCard application={item} categoryLabel={labels[item.category] ?? 'Aplikasi'} /></li>)}
                </ul>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <h3 className="text-lg font-bold text-slate-900">{applications.length ? 'Aplikasi tidak ditemukan' : 'Daftar aplikasi belum tersedia'}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{applications.length ? 'Coba kata kunci lain atau pilih semua kategori.' : 'Silakan kunjungi kembali halaman ini nanti.'}</p>
                    {hasFilters && <button type="button" onClick={reset} className="mt-5 rounded-full bg-sky-900 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800">Tampilkan semua aplikasi</button>}
                </div>
            )}
        </section>
    );
}

export default function Index({ portal, applications = [], categories = [], banners = [], year }) {
    const mainRef = useRef(null);
    const { profile = {}, team = [], services = [], tour = {}, gallery = [], contact = {} } = portal;

    useEffect(() => {
        const root = document.documentElement;
        const added = ['scroll-smooth', 'motion-reduce:scroll-auto'].filter((name) => !root.classList.contains(name));
        root.classList.add(...added);

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const nodes = [...mainRef.current.querySelectorAll('[data-reveal]')];
        const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) {
                    target.classList.remove('opacity-0', 'translate-y-4');
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.05 }) : null;

        const prepare = () => {
            observer?.disconnect();
            nodes.forEach((node) => {
                node.classList.remove('opacity-0', 'translate-y-4');
                if (observer && !motion.matches && node.getBoundingClientRect().top > window.innerHeight) {
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
        <div className="min-h-screen bg-white font-sans text-slate-900 antialiased [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-sky-500 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-sky-500">
            <Head title={portal.title}><meta name="description" content={portal.description} /></Head>

            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-sky-900 focus:px-5 focus:py-3 focus:text-white">Lewati ke konten utama</a>

            <PortalHeader portal={portal} />

            <main ref={mainRef} id="main-content" tabIndex={-1} className="outline-none">
                <PortalHero portal={portal} />

                <section id="profile" aria-labelledby="profile-heading" className={`${container} scroll-mt-20 py-16 lg:py-24`}>
                    <div data-reveal className={`grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20 ${reveal}`}>
                        <div>
                            <SectionHeading id="profile-heading" label="MENGENAL BPS" title={profile.title || 'Apa Itu Badan Pusat Statistik?'} description={profile.description} />
                            <a href="#team" className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-50">Kenali tim kami <span aria-hidden="true" className="ml-3">↓</span></a>
                        </div>
                        <div className="group rounded-3xl bg-gradient-to-br from-sky-50 to-emerald-50 p-8 text-center sm:p-12">
                            <Media src={portal.logo} alt="Logo Badan Pusat Statistik" className="mx-auto aspect-square w-40 !bg-transparent transition-transform duration-700 motion-safe:group-hover:-translate-y-2 sm:w-48" fit="object-contain" fallback="BPS" />
                            <p className="mt-6 text-lg font-bold text-sky-950">{portal.institution}</p>
                            <p className="mt-2 text-sm text-slate-600">Lebih dekat dengan data dan pelayanan.</p>
                        </div>
                    </div>
                    {profile.video_id && <div className="mx-auto mt-12 max-w-4xl"><YouTubeVideo video={profile} /></div>}
                </section>

                <TeamSection members={team} />

                <section id="services" aria-labelledby="services-heading" className={`${container} scroll-mt-20 py-16 lg:py-24`}>
                    <div data-reveal className={reveal}>
                        <SectionHeading id="services-heading" label="PELAYANAN STATISTIK" title="Apa yang bisa kami bantu?" description="Pilih layanan berdasarkan informasi yang Anda perlukan." />
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service, index) => (
                                <article key={service.id} className="flex flex-col rounded-2xl border border-slate-200 p-6 sm:p-8">
                                    <span aria-hidden="true" className="text-sm font-bold text-sky-600">{String(index + 1).padStart(2, '0')}</span>
                                    <h3 className="mt-5 text-xl font-bold">{service.title}</h3>
                                    <p className="mb-6 mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                                    {service.url && <a href={service.url} className="mt-auto inline-flex items-center justify-between rounded-lg py-3 text-sm font-semibold text-sky-800 hover:underline">{service.action}<span aria-hidden="true">↗</span></a>}
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {banners.length > 0 && <div className={container}><InformationBanner banners={banners} /></div>}

                <ApplicationDirectory applications={applications} categories={categories} />

                <section id="tour" aria-labelledby="tour-heading" className="scroll-mt-20 bg-sky-50 py-16 lg:py-24">
                    <div className={container}>
                        <SectionHeading id="tour-heading" label="SEBELUM ANDA BERKUNJUNG" title={tour.title || 'Jelajahi Kantor Kami'} description={tour.description} />
                        <div className="mx-auto max-w-5xl"><YouTubeVideo video={tour} /></div>
                    </div>
                </section>

                <section id="gallery" aria-labelledby="gallery-heading" className={`${container} scroll-mt-20 py-16 lg:py-24`}>
                    <div data-reveal className={reveal}>
                        <SectionHeading id="gallery-heading" label="CERITA DALAM GAMBAR" title="BPS dalam kegiatan." description="Mengenal aktivitas, pelayanan, dan keseharian kami lebih dekat." />
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {gallery.map((item) => (
                                <figure key={item.id}>
                                    <Media src={item.image} alt={item.title} className="aspect-[4/3] rounded-2xl" />
                                    <figcaption className="mt-4">
                                        <h3 className="font-bold">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.caption}</p>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                        {!gallery.length && <p className="text-slate-500">Galeri kegiatan belum tersedia.</p>}
                    </div>
                </section>
            </main>

            <PortalFooter institution={portal.institution} year={year} contact={contact} />
        </div>
    );
}
