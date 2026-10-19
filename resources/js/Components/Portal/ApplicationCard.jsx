import { useState } from 'react';

export default function ApplicationCard({ application, categoryLabel }) {
    const [failedLogo, setFailedLogo] = useState(null);

    return (
        <article className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-200/50">
            <div className="flex items-start justify-between gap-3">
                <div aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sky-50 text-xl font-black text-sky-800">
                    {application.logo && failedLogo !== application.logo
                        ? <img src={application.logo} alt="" width="56" height="56" loading="lazy" decoding="async" onError={() => setFailedLogo(application.logo)} className="h-full w-full object-contain p-2" />
                        : application.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{categoryLabel}</span>
            </div>

            <h3 className="mt-5 break-words text-lg font-bold text-slate-900">{application.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{application.description}</p>
            {application.audience && <p className="mb-5 mt-4 text-xs text-slate-500">Untuk {application.audience}</p>}

            <div className="mt-auto pt-4">
                {application.url
                    ? <a href={application.url} aria-label={`Buka ${application.name}`} className="flex min-h-11 items-center justify-between rounded-xl bg-sky-900 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800">Buka aplikasi <span aria-hidden="true">↗</span></a>
                    : <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Akses belum tersedia</p>}
            </div>
        </article>
    );
}
