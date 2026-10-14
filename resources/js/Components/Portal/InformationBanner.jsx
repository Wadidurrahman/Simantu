import { useState } from 'react';

function BannerImage({ src, alt }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return null;
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="portal-banner-image"
        />
    );
}

export default function InformationBanner({ banners = [] }) {
    const [index, setIndex] = useState(0);

    const items = banners.length
        ? banners
        : [
              {
                  id: 'default',
                  label: 'LAYANAN DIGITAL',
                  title: 'Temukan aplikasi sesuai kebutuhan Anda.',
                  description:
                      'Jelajahi sistem dan layanan yang tersedia melalui direktori aplikasi.',
                  url: '#applications',
                  button: 'Lihat aplikasi',
              },
          ];

    const activeIndex = index % items.length;
    const current = items[activeIndex];

    const previous = () => {
        setIndex((value) => (
            (value % items.length - 1 + items.length) % items.length
        ));
    };

    const next = () => {
        setIndex((value) => (value + 1) % items.length);
    };

    return (
        <section
            id="information"
            className="portal-information"
            aria-labelledby="information-heading"
        >
            <div className="portal-information-heading">
                <p className="portal-section-kicker">INFORMASI PILIHAN</p>

                <h2 id="information-heading">
                    Kabar & layanan BPS
                </h2>

                <p>Informasi yang membantu aktivitas Anda.</p>

                {items.length > 1 && (
                    <div className="portal-banner-controls">
                        <button
                            type="button"
                            onClick={previous}
                            aria-label="Informasi sebelumnya"
                        >
                            <span aria-hidden="true">←</span>
                        </button>

                        <span aria-label={`Informasi ${activeIndex + 1} dari ${items.length}`}>
                            {activeIndex + 1} / {items.length}
                        </span>

                        <button
                            type="button"
                            onClick={next}
                            aria-label="Informasi berikutnya"
                        >
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                )}
            </div>

            <div
                className="portal-banner"
                aria-live="polite"
                aria-atomic="true"
            >
                <BannerImage
                    key={current.image || current.id}
                    src={current.image}
                    alt={current.image_alt || ''}
                />

                <div className="portal-banner-copy">
                    <p className="portal-banner-tag">{current.label}</p>

                    <h3>{current.title}</h3>

                    <p className="portal-banner-description">
                        {current.description}
                    </p>

                    {current.url && (
                        <a href={current.url} className="portal-banner-link">
                            {current.button || 'Selengkapnya'}
                            <span aria-hidden="true">→</span>
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}
