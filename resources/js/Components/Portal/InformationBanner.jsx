import { useState } from 'react';

export default function InformationBanner({ banners = [] }) {
    const [index, setIndex] = useState(0);
    const [failedImage, setFailedImage] = useState(null);

    if (!banners.length) return null;

    const active = index % banners.length;
    const banner = banners[active];
    const hasImage = banner.image && failedImage !== banner.image;

    return (
        <section
            id="information"
            aria-label="Informasi terbaru"
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-sky-900/20 bg-gradient-to-br from-[#0b1f3a] via-[#0f294a] to-[#081529] text-white shadow-xl"
        >
            <div aria-live="polite" aria-atomic="true" className={`grid items-center ${hasImage ? 'lg:grid-cols-[1.2fr_1fr]' : ''}`}>
                <div className="p-6 sm:p-9 lg:p-12">
                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        {banner.label || 'INFORMASI PORTAL'}
                    </span>

                    <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                        {banner.title}
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                        {banner.description}
                    </p>

                    {banner.url && (
                        <a
                            href={banner.url}
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
                        >
                            <span>{banner.button || 'Selengkapnya'}</span>
                            <span aria-hidden="true">→</span>
                        </a>
                    )}
                </div>

                {hasImage && (
                    <div className="relative h-full min-h-[220px] overflow-hidden bg-slate-900">
                        <img
                            key={banner.image}
                            src={banner.image}
                            alt={banner.image_alt || ''}
                            width="800"
                            height="500"
                            loading="lazy"
                            decoding="async"
                            onError={() => setFailedImage(banner.image)}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
            </div>

            {banners.length > 1 && (
                <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/20 px-6 py-3.5 sm:px-9">
                    <div className="flex items-center gap-2">
                        {banners.map((item, idx) => (
                            <button
                                key={item.id ?? idx}
                                type="button"
                                aria-label={`Informasi ${idx + 1}`}
                                onClick={() => setIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === active ? 'w-7 bg-orange-400' : 'w-2 bg-white/30 hover:bg-white/60'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Informasi sebelumnya"
                            onClick={() => setIndex((active - 1 + banners.length) % banners.length)}
                            className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-sm transition-colors hover:bg-white/15 active:scale-95"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            aria-label="Informasi berikutnya"
                            onClick={() => setIndex((active + 1) % banners.length)}
                            className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-sm transition-colors hover:bg-white/15 active:scale-95"
                        >
                            →
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
