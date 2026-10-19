import { useState } from 'react';

export default function InformationBanner({ banners = [] }) {
    const [index, setIndex] = useState(0);
    const [failedImage, setFailedImage] = useState(null);

    if (!banners.length) return null;

    const active = index % banners.length;
    const banner = banners[active];
    const hasImage = banner.image && failedImage !== banner.image;

    return (
        <section id="information" aria-label="Informasi terbaru" className="scroll-mt-24 overflow-hidden rounded-3xl bg-sky-950 text-white">
            <div aria-live="polite" aria-atomic="true" className={`grid ${hasImage ? 'md:grid-cols-2' : ''}`}>
                <div className="p-6 sm:p-8 lg:p-10">
                    <p className="text-xs font-bold tracking-widest text-sky-200">{banner.label}</p>
                    <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{banner.title}</h2>
                    <p className="mt-3 leading-7 text-slate-200">{banner.description}</p>
                    {banner.url && <a href={banner.url} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-sky-950 hover:bg-sky-100">{banner.button}</a>}
                </div>
                {hasImage && <img key={banner.image} src={banner.image} alt={banner.image_alt || ''} width="800" height="500" loading="lazy" decoding="async" onError={() => setFailedImage(banner.image)} className="aspect-[8/5] h-full w-full object-cover" />}
            </div>

            {banners.length > 1 && (
                <div className="flex items-center justify-end gap-4 border-t border-white/10 px-6 py-4">
                    <span className="text-sm text-sky-100">{active + 1} / {banners.length}</span>
                    <button type="button" aria-label="Informasi sebelumnya" onClick={() => setIndex((active - 1 + banners.length) % banners.length)} className="h-11 w-11 rounded-full border border-white/30 hover:bg-white/10">←</button>
                    <button type="button" aria-label="Informasi berikutnya" onClick={() => setIndex((active + 1) % banners.length)} className="h-11 w-11 rounded-full border border-white/30 hover:bg-white/10">→</button>
                </div>
            )}
        </section>
    );
}
