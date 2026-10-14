export default function ApplicationFilter({
    query,
    onQueryChange,
    category,
    onCategoryChange,
    categories,
}) {
    return (
        <div className="portal-filters" role="search" aria-label="Cari aplikasi">
            <div className="portal-search-field">
                <label htmlFor="application-search">Cari aplikasi</label>

                <div className="portal-search-input">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <circle cx="10.5" cy="10.5" r="6.5" />
                        <path d="m16 16 4 4" />
                    </svg>

                    <input
                        id="application-search"
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Cari nama atau fungsi aplikasi..."
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="portal-category-field">
                <label htmlFor="application-category">Kategori</label>

                <select
                    id="application-category"
                    value={category}
                    onChange={(event) => onCategoryChange(event.target.value)}
                >
                    <option value="all">Semua kategori</option>

                    {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
