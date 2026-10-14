import { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Kegiatan/Modal';
import FormField, { inputClass } from '@/Components/Kegiatan/FormField';

const PER_PAGE = 10;

const rupiah = (value) => new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
}).format(Number(value) || 0);

const emptyForm = (tahun) => ({
    tahun,
    kd_tim: '',
    ur_giat: '',
    satuan: '',
    hr_satuan: '',
    is_active: true,
});

const buildPages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total];
    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];

    return [1, '...', current - 1, current, current + 1, '...', total];
};

function SelectControl({ value, onChange, children, className = '', disabled = false }) {
    return (
        <div className={`relative shrink-0 ${className}`}>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-9 text-[12px] font-medium text-slate-700 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
                {children}
            </select>

            <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
            />
        </div>
    );
}

export default function Index({ giats = [], tahun, tahunList = [], timOptions = [], permissions = {} }) {
    const { errors = {} } = usePage().props;

    const [query, setQuery] = useState('');
    const [filterTim, setFilterTim] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);
    const [hapus, setHapus] = useState(null);
    const [menghapus, setMenghapus] = useState(false);

    const form = useForm(emptyForm(tahun));
    const edit = modal?.mode === 'edit';

    const daftarTim = useMemo(() => {
        const map = new Map();

        giats.forEach((item) => {
            if (!map.has(item.kd_tim)) map.set(item.kd_tim, item.nm_tim);
        });

        return Array.from(map.entries());
    }, [giats]);

    const filteredRows = useMemo(() => {
        const keyword = query.trim().toLowerCase();

        return giats.filter((item) => {
            const matchesSearch = !keyword || [
                item.kd_tim,
                item.nm_tim,
                item.kd_giat,
                item.ur_giat,
                item.satuan,
            ].some((value) => String(value ?? '').toLowerCase().includes(keyword));

            const matchesTim = !filterTim || item.kd_tim === filterTim;
            const matchesStatus = filterStatus === '' || (item.is_active ? '1' : '0') === filterStatus;

            return matchesSearch && matchesTim && matchesStatus;
        });
    }, [giats, query, filterTim, filterStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PER_PAGE;
    const rows = filteredRows.slice(start, start + PER_PAGE);
    const from = filteredRows.length === 0 ? 0 : start + 1;
    const to = start + rows.length;
    const adaFilter = Boolean(query || filterTim || filterStatus);

    useEffect(() => {
        setPage(1);
    }, [query, filterTim, filterStatus, tahun]);

    const gantiTahun = (event) => {
        setQuery('');
        setFilterTim('');
        setFilterStatus('');
        setPage(1);

        router.get(route('kegiatan.index'), { tahun: event.target.value }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const bukaTambah = () => {
        form.clearErrors();

        form.setData({
            ...emptyForm(tahun),
            kd_tim: timOptions.length === 1 ? timOptions[0].kd_tim : '',
        });

        setModal({ mode: 'create' });
    };

    const bukaEdit = (item) => {
        form.clearErrors();

        form.setData({
            tahun: item.tahun,
            kd_tim: item.kd_tim,
            ur_giat: item.ur_giat ?? '',
            satuan: item.satuan ?? '',
            hr_satuan: item.hr_satuan ?? '',
            is_active: Boolean(item.is_active),
        });

        setModal({ mode: 'edit', row: item });
    };

    const tutupModal = () => {
        if (form.processing) return;

        form.clearErrors();
        setModal(null);
    };

    const simpan = () => {
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setModal(null);
            },
        };

        if (edit) {
            form.put(route('kegiatan.update', modal.row.id), options);
            return;
        }

        form.post(route('kegiatan.store'), options);
    };

    const konfirmasiHapus = () => {
        if (!hapus) return;

        router.delete(route('kegiatan.destroy', hapus.id), {
            preserveScroll: true,
            onStart: () => setMenghapus(true),
            onFinish: () => setMenghapus(false),
            onSuccess: () => setHapus(null),
        });
    };

    const hapusFilter = () => {
        setQuery('');
        setFilterTim('');
        setFilterStatus('');
    };

    const renderActions = (item) => {
        if (!item.bisa_kelola) return <span className="text-slate-300">—</span>;

        return (
            <div className="inline-flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => bukaEdit(item)}
                    title="Ubah kegiatan"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                    <Pencil className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={() => setHapus(item)}
                    title="Hapus kegiatan"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Kegiatan" />

            <div className="flex min-h-full flex-col gap-3 lg:h-full lg:min-h-0 lg:gap-4">
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                    </div>

                    {permissions.canCreate && (
                        <button
                            type="button"
                            onClick={bukaTambah}
                            className="inline-flex h-9 w-full shrink-0 items-center justify-center rounded-md bg-blue-700 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 sm:w-auto"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Tambah Kegiatan
                        </button>
                    )}
                </div>

                {errors.hapus && (
                    <div className="shrink-0 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
                        {errors.hapus}
                    </div>
                )}

                <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="mr-auto min-w-[220px] shrink-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-[14px] font-semibold text-slate-900">
                                        Kegiatan Tahun {tahun}
                                    </h2>

                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500">
                                        {filteredRows.length} Data
                                    </span>
                                </div>

                                <p className="mt-1 text-[11px] text-slate-500">
                                    Daftar master kegiatan berdasarkan tahun dan tim kerja.
                                </p>
                            </div>

                            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                                <SelectControl
                                    value={tahun}
                                    onChange={gantiTahun}
                                    className="w-full sm:w-[125px]"
                                >
                                    {tahunList.map((item) => (
                                        <option key={item} value={item}>
                                            Tahun {item}
                                        </option>
                                    ))}
                                </SelectControl>

                                <SelectControl
                                    value={filterTim}
                                    onChange={(event) => setFilterTim(event.target.value)}
                                    className="w-full sm:w-[140px]"
                                >
                                    <option value="">Semua Tim</option>

                                    {daftarTim.map(([kdTim, nmTim]) => (
                                        <option key={kdTim} value={kdTim}>
                                            {kdTim}. {nmTim}
                                        </option>
                                    ))}
                                </SelectControl>

                                <SelectControl
                                    value={filterStatus}
                                    onChange={(event) => setFilterStatus(event.target.value)}
                                    className="w-full sm:w-[135px]"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="1">Aktif</option>
                                    <option value="0">Nonaktif</option>
                                </SelectControl>

                                <div className="relative w-full sm:min-w-[180px] sm:flex-1 lg:max-w-[230px]">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Cari kegiatan..."
                                        className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-8 text-[12px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />

                                    {query && (
                                        <button
                                            type="button"
                                            onClick={() => setQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {adaFilter && (
                                    <button
                                        type="button"
                                        onClick={hapusFilter}
                                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="hidden min-h-0 flex-1 overflow-y-auto lg:block">
    <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
            <col className="w-[5%]" />
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[26%]" />
            <col className="w-[11%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
        </colgroup>

        <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="h-11 border-b border-slate-200 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-500 xl:text-[11px]">
                <th className="px-4 text-center">No</th>
                <th className="px-4">Tim Kerja</th>
                <th className="px-4">Kode</th>
                <th className="px-4">Uraian Kegiatan</th>
                <th className="px-4">Satuan</th>
                <th className="px-4 text-right">Honor / Satuan</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-center">Aksi</th>
            </tr>
        </thead>

        <tbody>
            {rows.length === 0 ? (
                <tr>
                    <td colSpan={8} className="h-44 px-4 text-center text-sm text-slate-400">
                        {adaFilter
                            ? 'Tidak ada kegiatan yang sesuai dengan filter.'
                            : 'Belum ada kegiatan pada tahun ini.'}
                    </td>
                </tr>
            ) : (
                rows.map((item, index) => (
                    <tr
                        key={item.id}
                        className={`h-12 border-b border-slate-200 text-[12px] text-slate-700 transition-colors xl:text-[13px] ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                        } hover:bg-blue-50/50`}
                    >
                        <td className="px-4 text-center text-xs tabular-nums text-slate-400">
                            {start + index + 1}
                        </td>

                        <td className="px-4">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="shrink-0 font-semibold tabular-nums text-slate-800">
                                    {item.kd_tim}
                                </span>

                                <span title={item.nm_tim} className="truncate text-slate-600">
                                    {item.nm_tim}
                                </span>
                            </div>
                        </td>

                        <td className="px-4 font-semibold tabular-nums text-slate-800">
                            {item.kd_giat}
                        </td>

                        <td className="px-4">
                            <p title={item.ur_giat} className="truncate text-slate-700">
                                {item.ur_giat}
                            </p>
                        </td>

                        <td className="px-4">
                            <span className="text-slate-700">
                                {item.satuan || '-'}
                            </span>
                        </td>

                        <td className="px-4 text-right font-semibold tabular-nums text-slate-800">
                            Rp {rupiah(item.hr_satuan)}
                        </td>

                        <td className="px-4">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                    item.is_active
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        item.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                />
                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </td>

                        <td className="px-4 text-center">
                            {renderActions(item)}
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    </table>
</div>

                    <div className="flex-1 lg:hidden">
    {rows.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center px-5 text-center text-sm text-slate-400">
            {adaFilter
                ? 'Tidak ada kegiatan yang sesuai dengan filter.'
                : 'Belum ada kegiatan pada tahun ini.'}
        </div>
    ) : (
        <div className="divide-y divide-slate-200">
            {rows.map((item, index) => (
                <article
                    key={item.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} p-3 sm:p-4`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold tabular-nums text-blue-700">
                                    {item.kd_giat}
                                </span>

                                <span className="text-[10px] text-slate-300">•</span>

                                <span className="text-[11px] font-medium text-slate-500">
                                    No. {start + index + 1}
                                </span>
                            </div>

                            <h3 className="mt-1.5 text-[13px] font-semibold leading-5 text-slate-900">
                                {item.ur_giat}
                            </h3>
                        </div>

                        {renderActions(item)}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-600">
                        <span className="font-semibold text-slate-800">{item.kd_tim}</span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate">{item.nm_tim}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-slate-200 bg-white/80 px-3 py-2.5">
                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                Satuan
                            </p>

                            <p className="mt-1 text-[12px] font-medium text-slate-700">
                                {item.satuan || '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                Honor
                            </p>

                            <p className="mt-1 text-[12px] font-semibold tabular-nums text-slate-800">
                                Rp {rupiah(item.hr_satuan)}
                            </p>
                        </div>

                        <div className="col-span-2">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                Status
                            </p>

                            <span
                                className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                    item.is_active
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        item.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                />
                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    )}
</div>

                    <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p className="text-center text-[11px] font-medium tabular-nums text-slate-500 sm:text-left sm:text-xs">
                            Menampilkan {from} sampai {to} dari {filteredRows.length} data
                        </p>

                        <div className="flex items-center justify-center gap-1 sm:justify-end">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setPage(Math.max(1, currentPage - 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {buildPages(currentPage, totalPages).map((item, index) => (
                                item === '...' ? (
                                    <span
                                        key={`gap-${index}`}
                                        className="flex h-8 min-w-6 items-center justify-center text-xs text-slate-400"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        key={item}
                                        onClick={() => setPage(item)}
                                        className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold tabular-nums transition-colors ${
                                            item === currentPage
                                                ? 'bg-slate-800 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                )
                            ))}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <Modal
                show={Boolean(modal)}
                title={edit ? 'Ubah Kegiatan' : 'Tambah Kegiatan'}
                onClose={tutupModal}
                onSubmit={simpan}
                processing={form.processing}
                submitLabel={edit ? 'Simpan Perubahan' : 'Simpan Kegiatan'}
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <FormField label="Tim Kerja" required error={form.errors.kd_tim}>
                            <div className="relative">
                                <select
                                    value={form.data.kd_tim}
                                    disabled={edit}
                                    onChange={(event) => form.setData('kd_tim', event.target.value)}
                                    className={`${inputClass} appearance-none pr-9`}
                                >
                                    {edit ? (
                                        <option value={form.data.kd_tim}>
                                            {modal?.row?.kd_tim}. {modal?.row?.nm_tim}
                                        </option>
                                    ) : (
                                        <>
                                            <option value="">Pilih tim kerja</option>

                                            {timOptions.map((item) => (
                                                <option key={item.kd_tim} value={item.kd_tim}>
                                                    {item.kd_tim}. {item.nm_tim}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>

                                <ChevronDown
                                    className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                    strokeWidth={2}
                                />
                            </div>
                        </FormField>
                    </div>

                    {edit && (
                        <FormField label="Kode Kegiatan">
                            <input value={modal?.row?.kd_giat ?? ''} readOnly className={inputClass} />
                        </FormField>
                    )}

                    <div className={edit ? '' : 'sm:col-span-2'}>
                        <FormField
                            label="Uraian Kegiatan"
                            required
                            error={form.errors.ur_giat}
                            hint={
                                edit
                                    ? 'Identitas kegiatan dikunci setelah dibuat.'
                                    : 'Kode kegiatan dibuat otomatis berdasarkan tahun dan tim.'
                            }
                        >
                            <input
                                type="text"
                                value={form.data.ur_giat}
                                disabled={edit}
                                onChange={(event) => form.setData('ur_giat', event.target.value)}
                                className={inputClass}
                                placeholder="Masukkan uraian kegiatan"
                            />
                        </FormField>
                    </div>

                    <FormField label="Satuan" required error={form.errors.satuan}>
                        <input
                            type="text"
                            value={form.data.satuan}
                            onChange={(event) => form.setData('satuan', event.target.value)}
                            className={inputClass}
                            placeholder="Contoh: Dokumen"
                        />
                    </FormField>

                    <FormField label="Honor per Satuan" required error={form.errors.hr_satuan}>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-slate-500">
                                Rp
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={form.data.hr_satuan}
                                onChange={(event) => form.setData('hr_satuan', event.target.value)}
                                className={`${inputClass} pl-9 text-right tabular-nums`}
                                placeholder="0"
                            />
                        </div>
                    </FormField>

                    <FormField label="Status" required error={form.errors.is_active}>
                        <div className="relative">
                            <select
                                value={form.data.is_active ? '1' : '0'}
                                onChange={(event) => form.setData('is_active', event.target.value === '1')}
                                className={`${inputClass} appearance-none pr-9`}
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </select>

                            <ChevronDown
                                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                strokeWidth={2}
                            />
                        </div>
                    </FormField>
                </div>
            </Modal>

            <Modal
                show={Boolean(hapus)}
                title="Hapus Kegiatan"
                onClose={() => !menghapus && setHapus(null)}
                onSubmit={konfirmasiHapus}
                submitLabel="Hapus"
                processing={menghapus}
                danger
            >
                <p className="text-[13px] leading-6 text-slate-700">
                    Kegiatan{' '}
                    <span className="font-semibold text-slate-900">
                        {hapus?.kd_giat}. {hapus?.ur_giat}
                    </span>{' '}
                    akan dihapus secara permanen.
                </p>

                <p className="mt-2 text-[12px] leading-5 text-slate-500">
                    Kegiatan yang sudah digunakan pada realisasi atau modul lain tidak dapat dihapus.
                </p>
            </Modal>
        </AuthenticatedLayout>
    );
}
