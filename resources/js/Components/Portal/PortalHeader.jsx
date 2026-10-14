import { useState } from 'react';

export default function PortalHeader({ portal }) {
    const [logoFailed, setLogoFailed] = useState(false);

    return (
        <header className="portal-header">
            <div className="portal-container portal-header-inner">
                <a href="#main-content" className="portal-brand">
                    {portal.logo && !logoFailed ? (
                        <img
                            src={portal.logo}
                            alt=""
                            width="44"
                            height="44"
                            onError={() => setLogoFailed(true)}
                        />
                    ) : (
                        <span className="portal-brand-mark" aria-hidden="true">
                            BPS
                        </span>
                    )}

                    <span className="portal-brand-text">
                        <strong>{portal.institution}</strong>
                        <span>{portal.title}</span>
                    </span>
                </a>

                <nav aria-label="Navigasi utama" className="portal-navigation">
                    <a href="#applications">Aplikasi</a>
                    <a href="#information">Informasi</a>
                </nav>
            </div>
        </header>
    );
}
