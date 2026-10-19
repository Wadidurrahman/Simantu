export default function ApplicationFilter({ query, onQueryChange, category, onCategoryChange, categories }) {
    return (
        <div role="search" aria-label="Cari aplikasi" className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_16rem] sm:p-5">
            <label className="block text-sm font-semibold text-slate-700">
                Cari aplikasi
                <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Nama, layanan, atau pengguna…" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-sky-600" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
                Kategori
                <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 focus:border-sky-600 focus:ring-sky-600">
                    <option value="all">Semua kategori</option>
                    {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
            </label>
        </div>
    );
}
