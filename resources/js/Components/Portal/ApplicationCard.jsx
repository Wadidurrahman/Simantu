import { useState } from 'react';

export default function ApplicationCard({ application, categoryLabel }) {
    const [logoFailed, setLogoFailed] = useState(false);

    return (
        <article className="portal-application-card">
            <div className="portal-card-top">
                <div className="portal-application-icon">
                    {application.logo && !logoFailed ? (
                        <img
                            src={application.logo}
                            alt=""
                            width="48"
                            height="48"
                            loading="lazy"
                            onError={() => setLogoFailed(true)}
                        />
                    ) : (
                        <span aria-hidden="true">
                            {application.name.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>

                <span className="portal-category-badge">
                    {categoryLabel}
                </span>
            </div>

            <h3>{application.name}</h3>

            <p className="portal-application-description">
                {application.description}
            </p>

            {application.audience && (
                <p className="portal-application-audience">
                    Untuk {application.audience.toLocaleLowerCase('id')}
                </p>
            )}

            <div className="portal-card-bottom">
                {application.url ? (
                    <a
                        href={application.url}
                        aria-label={`Buka aplikasi ${application.name}`}
                    >
                        Buka Aplikasi
                        <span aria-hidden="true">↗</span>
                    </a>
                ) : (
                    <span className="portal-unavailable">
                        Tautan belum tersedia
                    </span>
                )}
            </div>
        </article>
    );
}
