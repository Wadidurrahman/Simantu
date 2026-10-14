import { useState } from 'react';
import { Head } from '@inertiajs/react';

import PortalHeader from '../../Components/Portal/PortalHeader';
import PortalHero from '../../Components/Portal/PortalHero';
import InformationBanner from '../../Components/Portal/InformationBanner';
import ApplicationFilter from '../../Components/Portal/ApplicationFilter';
import ApplicationCard from '../../Components/Portal/ApplicationCard';
import PortalFooter from '../../Components/Portal/PortalFooter';

import '../../../css/portal.css';

export default function Index({
    portal,
    applications = [],
    categories = [],
    banners = [],
    year,
}) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');

    const search = query.trim().toLocaleLowerCase('id');

    const filteredApplications = applications.filter((application) => {
        const matchesCategory =
            category === 'all' || application.category === category;

        const searchableText = [
            application.name,
            application.description,
            application.audience,
        ]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('id');

        return matchesCategory && searchableText.includes(search);
    });

    const categoryLabels = Object.fromEntries(
        categories.map((item) => [item.id, item.label]),
    );

    const hasFilters = query !== '' || category !== 'all';

    const resetFilters = () => {
        setQuery('');
        setCategory('all');
    };

    return (
        <div className="bps-portal">
            <Head title={`${portal.title} | ${portal.institution}`}>
                <meta name="description" content={portal.description} />
            </Head>

            <a href="#main-content" className="portal-skip-link">
                Lewati ke konten utama
            </a>

            <PortalHeader portal={portal} />

            <main
                id="main-content"
                tabIndex={-1}
                className="portal-main portal-container"
            >
                <PortalHero portal={portal} />

                <InformationBanner banners={banners} />

                <section
                    id="applications"
                    className="portal-applications"
                    aria-labelledby="applications-heading"
                >
                    <div className="portal-section-heading">
                        <div>
                            <p className="portal-section-kicker">
                                DIREKTORI APLIKASI
                            </p>

                            <h2 id="applications-heading">
                                Pilih layanan Anda
                            </h2>

                            <p>
                                Temukan aplikasi untuk mendukung kebutuhan
                                dan aktivitas Anda.
                            </p>
                        </div>

                        <span className="portal-application-count">
                            {applications.length} aplikasi
                        </span>
                    </div>

                    <ApplicationFilter
                        query={query}
                        onQueryChange={setQuery}
                        category={category}
                        onCategoryChange={setCategory}
                        categories={categories}
                    />

                    <div className="portal-results-toolbar">
                        <p role="status" aria-live="polite" aria-atomic="true">
                            Menampilkan {filteredApplications.length} dari{' '}
                            {applications.length} aplikasi
                        </p>

                        {hasFilters && (
                            <button type="button" onClick={resetFilters}>
                                Reset filter
                            </button>
                        )}
                    </div>

                    {filteredApplications.length ? (
                        <ul className="portal-application-grid">
                            {filteredApplications.map((application) => (
                                <li key={application.id}>
                                    <ApplicationCard
                                        application={application}
                                        categoryLabel={
                                            categoryLabels[application.category]
                                            ?? 'Aplikasi'
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="portal-empty">
                            <h3>
                                {applications.length
                                    ? 'Aplikasi tidak ditemukan'
                                    : 'Daftar aplikasi belum tersedia'}
                            </h3>

                            <p>
                                {applications.length
                                    ? 'Coba kata kunci lain atau pilih semua kategori.'
                                    : 'Silakan kunjungi kembali halaman ini nanti.'}
                            </p>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="portal-button"
                                >
                                    Tampilkan semua aplikasi
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <PortalFooter
                institution={portal.institution}
                year={year}
            />
        </div>
    );
}
