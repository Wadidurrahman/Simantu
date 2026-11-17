import { useState } from 'react';

export default function ApplicationCard({ application, categoryLabel }) {
    const [failedLogo, setFailedLogo] = useState(null);
    const isAvailable = Boolean(application.url);

    return (
        <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-slate-200/60">
            <div className="flex items-start justify-between gap-3">
                <div
                    aria-hidden="true"
                    className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-100/70 text-lg font-black text-sky-900"
                >
                    {application.logo && failedLogo !== application.logo ? (
                        <img
                            src={application.logo}
                            alt=""
                            width="56"
                            height="56"
                            loading="lazy"
                            decoding="async"
                            onError={() => setFailedLogo(application.logo)}
                            className="h-full w-full object-contain p-2"
                        />
                    ) : (
                        application.name.slice(0, 2).toUpperCase()
                    )}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-inset ring-sky-200/70">
                        {categoryLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isAvailable ? 'bg-emerald-500' : 'bg-amber-400'
                            }`}
                        />
                        {isAvailable ? 'Aktif' : 'Segera Hadir'}
                    </span>
                </div>
            </div>

            <h3 className="mt-5 break-words text-lg font-bold text-slate-900 group-hover:text-sky-900">
                {application.name}
            </h3>

            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {application.description}
            </p>

            {application.audience && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                    <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                    <span className="truncate">Pengguna: {application.audience}</span>
                </div>
            )}

            <div className="mt-auto pt-5">
                {isAvailable ? (
                    <a
                        href={application.url}
                        target={application.external ? '_blank' : undefined}
                        rel={application.external ? 'noopener noreferrer' : undefined}
                        aria-label={`Buka ${application.name}`}
                        className="flex min-h-11 items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-orange-600"
                    >
                        <span>Buka Aplikasi</span>
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            ↗
                        </span>
                    </a>
                ) : (
                    <p className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-500">
                        Dalam Pengembangan
                    </p>
                )}
            </div>
        </article>
    );
}
