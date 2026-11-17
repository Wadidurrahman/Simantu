export default function ApplicationFilter({
    query,
    onQueryChange,
    category,
    onCategoryChange,
    categories = [],
    totalCount = 0,
    filteredCount = 0,
}) {
    return (
        <div
            role="search"
            aria-label="Cari aplikasi"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                    <label htmlFor="app-search-input" className="sr-only">
                        Cari aplikasi atau layanan
                    </label>
                    <svg
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                    </svg>
                    <input
                        id="app-search-input"
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Cari nama aplikasi, fungsi, atau unit kerja (misal: SIMANTU, SE2026, PST)…"
                        className="block w-full rounded-xl border border-slate-300 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20 sm:text-base"
                    />
                </div>

                {totalCount > 0 && (
                    <p className="shrink-0 text-xs font-medium text-slate-500 sm:text-sm">
                        Menampilkan <strong className="font-bold text-slate-900">{filteredCount}</strong> dari {totalCount} aplikasi
                    </p>
                )}
            </div>

            {categories.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={() => onCategoryChange('all')}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                            category === 'all'
                                ? 'bg-sky-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                    >
                        Semua ({totalCount || 'Semua'})
                    </button>

                    {categories.map((item) => {
                        const active = category === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onCategoryChange(item.id)}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                                    active
                                        ? 'bg-orange-500 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
