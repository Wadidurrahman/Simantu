import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import {
    Plus, Copy, Search, Columns3, Download, Printer, FileSpreadsheet,
    FileText, Edit3, Trash2, FileCheck2, X, ChevronDown
} from 'lucide-react';

const BULAN_OPTIONS = [
    { value: 1, label: '01 - Januari' },
    { value: 2, label: '02 - Februari' },
    { value: 3, label: '03 - Maret' },
    { value: 4, label: '04 - April' },
    { value: 5, label: '05 - Mei' },
    { value: 6, label: '06 - Juni' },
    { value: 7, label: '07 - Juli' },
    { value: 8, label: '08 - Agustus' },
    { value: 9, label: '09 - September' },
    { value: 10, label: '10 - Oktober' },
    { value: 11, label: '11 - November' },
    { value: 12, label: '12 - Desember' },
];

const ALL_COLUMNS = [
    { key: 'no', label: 'No', defaultVisible: true },
    { key: 'bulan', label: 'Bulan', defaultVisible: true },
    { key: 'identitas', label: 'ID SOBAT / NIP', defaultVisible: true },
    { key: 'nama', label: 'Nama Petugas', defaultVisible: true },
    { key: 'asal', label: 'Asal / Tipe', defaultVisible: false },
    { key: 'kegiatan', label: 'Kegiatan', defaultVisible: true },
    { key: 'satuan', label: 'Satuan', defaultVisible: false },
    { key: 'hr_satuan', label: 'Honor/Sat', defaultVisible: false },
    { key: 'vol', label: 'Vol', defaultVisible: true },
    { key: 'jml_hr', label: 'Jml Honor', defaultVisible: true },
];

const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function InputKemitraan({ filters, timList = [], kegiatanList = [], mitraList = [], pegawaiList = [], items = [], ppkDefault = {} }) {
    const [search, setSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef(null);

    // Popover tunggal: 'columns' | 'export' | null
    const [activePopover, setActivePopover] = useState(null);
    const toolbarRef = useRef(null);

    const [visibleCols, setVisibleCols] = useState(() =>
        Object.fromEntries(ALL_COLUMNS.map((c) => [c.key, c.defaultVisible]))
    );

    // Modals
    const [openInputModal, setOpenInputModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [openCopyModal, setOpenCopyModal] = useState(false);
    const [bastTarget, setBastTarget] = useState(null);
    const [petugasSearch, setPetugasSearch] = useState('');

    const hasTimSelected = Boolean(filters.tim_id);
    const selectedTim = timList.find((t) => Number(t.id) === Number(filters.tim_id));
    const bulanLabel = BULAN_OPTIONS.find((b) => b.value === Number(filters.bulan))?.label || '';
    const namaBulan = bulanLabel.replace(/^\d+\s-\s/, '');

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
                setActivePopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    const togglePopover = (name) => {
        setActivePopover((prev) => (prev === name ? null : name));
    };

    const handleFilterChange = (key, value) => {
        router.get(
            route('mitra.kemitraan.index'),
            {
                tahun: filters.tahun,
                bulan: key === 'bulan' ? value : filters.bulan,
                tim_id: key === 'tim_id' ? (value || undefined) : (filters.tim_id || undefined),
            },
            { preserveState: true, replace: true }
        );
    };

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((row) =>
            [row.nama_petugas, row.kode_identitas, row.ur_giat, row.kd_giat, row.asal_kecamatan]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q)
        );
    }, [items, search]);

    const activeColumns = useMemo(() => ALL_COLUMNS.filter((c) => visibleCols[c.key]), [visibleCols]);
    const isAllSelected = ALL_COLUMNS.every((c) => visibleCols[c.key]);

    const toggleAllColumns = () => {
        const nextVal = !isAllSelected;
        setVisibleCols(Object.fromEntries(ALL_COLUMNS.map((c) => [c.key, nextVal])));
    };

    const toggleColumn = (key) => {
        setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const getExportCell = (row, index, key) => {
        switch (key) {
            case 'no': return index + 1;
            case 'bulan': return String(row.bulan).padStart(2, '0');
            case 'identitas': return row.kode_identitas || '-';
            case 'nama': return row.nama_petugas || '-';
            case 'asal': return row.tipe_petugas === 'mitra' ? (row.asal_kecamatan || 'Mitra') : 'Organik';
            case 'kegiatan': return `[${row.kd_giat}] ${row.ur_giat}`;
            case 'satuan': return row.satuan || '-';
            case 'hr_satuan': return Number(row.hr_satuan || 0);
            case 'vol': return Number(row.vol || 0);
            case 'jml_hr': return Number(row.jml_hr || 0);
            default: return '';
        }
    };

    const handleExportCSV = () => {
        setActivePopover(null);
        if (!activeColumns.length) return;
        const headers = activeColumns.map((c) => `"${c.label}"`).join(',');
        const rows = filteredItems.map((row, idx) =>
            activeColumns.map((c) => `"${String(getExportCell(row, idx, c.key)).replace(/"/g, '""')}"`).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Kemitraan_${filters.tahun}_Bln${filters.bulan}.csv`;
        link.click();
    };

    const handleExportExcel = () => {
        setActivePopover(null);
        if (!activeColumns.length) return;
        const ths = activeColumns.map((c) => `<th style="background:#0f172a;color:#fff;padding:6px;border:1px solid #cbd5e1;">${c.label}</th>`).join('');
        const trs = filteredItems.map((row, idx) =>
            `<tr>${activeColumns.map((c) => `<td style="padding:6px;border:1px solid #cbd5e1;">${getExportCell(row, idx, c.key)}</td>`).join('')}</tr>`
        ).join('');
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Kemitraan_${filters.tahun}_Bln${filters.bulan}.xls`;
        link.click();
    };

    const handlePrintTable = () => {
        setActivePopover(null);
        if (!activeColumns.length) return;
        const ths = activeColumns.map((c) => `<th>${c.label}</th>`).join('');
        const trs = filteredItems.map((row, idx) =>
            `<tr>${activeColumns.map((c) => `<td>${c.key === 'jml_hr' || c.key === 'hr_satuan' ? formatRupiah(getExportCell(row, idx, c.key)) : getExportCell(row, idx, c.key)}</td>`).join('')}</tr>`
        ).join('');
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Cetak Daftar Kemitraan</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                h3 { margin: 0 0 4px; } p { margin: 0 0 14px; color: #475569; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; }
                th { background: #f1f5f9; }
            </style></head><body>
            <h3>Daftar Kegiatan Mitra — BPS Kota Probolinggo</h3>
            <p>Bulan: ${bulanLabel} ${filters.tahun} ${selectedTim ? `• Tim: ${selectedTim.nama_tim}` : ''}</p>
            <table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>
            <script>window.onload = () => { window.print(); }</script>
            </body></html>
        `);
        win.document.close();
    };

    const form = useForm({
        tahun: filters.tahun,
        bulan: filters.bulan,
        kegiatan_id: '',
        tipe_petugas: 'mitra',
        mitra_id: '',
        user_id: '',
        sebagai: 'Petugas Pendataan',
        satuan: '',
        hr_satuan: 0,
        vol: 1,
    });

    const openCreateModal = () => {
        if (!hasTimSelected) return;
        setEditingItem(null);
        setPetugasSearch('');
        form.reset();
        form.setData({
            tahun: filters.tahun,
            bulan: filters.bulan,
            kegiatan_id: kegiatanList[0]?.id || '',
            tipe_petugas: 'mitra',
            mitra_id: '',
            user_id: '',
            sebagai: 'Petugas Pendataan',
            satuan: kegiatanList[0]?.satuan || '',
            hr_satuan: kegiatanList[0]?.hr_satuan || 0,
            vol: 1,
        });
        setOpenInputModal(true);
    };

    const openEditModal = (row) => {
        setEditingItem(row);
        form.setData({
            tahun: row.tahun,
            bulan: row.bulan,
            kegiatan_id: row.kegiatan_id,
            tipe_petugas: row.tipe_petugas,
            mitra_id: row.mitra_id || '',
            user_id: row.user_id || '',
            sebagai: row.sebagai || 'Petugas Pendataan',
            satuan: row.satuan || '',
            hr_satuan: row.hr_satuan || 0,
            vol: row.vol || 1,
        });
        setOpenInputModal(true);
    };

    const handleSelectKegiatan = (kegId) => {
        const keg = kegiatanList.find((k) => Number(k.id) === Number(kegId));
        form.setData((prev) => ({
            ...prev,
            kegiatan_id: kegId,
            satuan: keg?.satuan || prev.satuan,
            hr_satuan: keg?.hr_satuan ?? prev.hr_satuan,
        }));
    };

    const submitForm = (e, keepOpen = false) => {
        e.preventDefault();
        if (editingItem) {
            form.put(route('mitra.kemitraan.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => setOpenInputModal(false),
            });
            return;
        }

        form.post(route('mitra.kemitraan.store'), {
            preserveScroll: true,
            onSuccess: () => {
                if (keepOpen) {
                    form.setData((prev) => ({ ...prev, mitra_id: '', user_id: '', vol: 1 }));
                    setPetugasSearch('');
                } else {
                    setOpenInputModal(false);
                }
            },
        });
    };

    const handleDelete = (row) => {
        if (!confirm(`Hapus penugasan ${row.nama_petugas} pada kegiatan ${row.ur_giat}?`)) return;
        router.delete(route('mitra.kemitraan.destroy', row.id), { preserveScroll: true });
    };

    const copyForm = useForm({
        tahun: filters.tahun,
        dari_bulan: Number(filters.bulan) > 1 ? Number(filters.bulan) - 1 : 1,
        ke_bulan: Number(filters.bulan),
        tim_id: filters.tim_id || '',
        kegiatan_id: '',
    });

    const openCopy = () => {
        if (!hasTimSelected) return;
        copyForm.setData({
            tahun: filters.tahun,
            dari_bulan: Number(filters.bulan) > 1 ? Number(filters.bulan) - 1 : 1,
            ke_bulan: Number(filters.bulan),
            tim_id: filters.tim_id,
            kegiatan_id: '',
        });
        setOpenCopyModal(true);
    };

    const bastForm = useForm({
        hari: 'Senin',
        tanggalindo: '',
        ur_bulan: namaBulan,
        tgl_bast: new Date().toISOString().slice(0, 10),
        no_spt: '',
        tgl_spt: new Date().toISOString().slice(0, 10),
        nm_katim: '',
        nm_ppk: ppkDefault.nm_ppk || '',
        nip_ppk: ppkDefault.nip_ppk || '',
    });

    const openBastModal = (row) => {
        setBastTarget(row);
        bastForm.setData({
            hari: 'Senin',
            tanggalindo: '',
            ur_bulan: namaBulan,
            tgl_bast: row.tgl_bast || new Date().toISOString().slice(0, 10),
            no_spt: row.no_spt || '',
            tgl_spt: row.tgl_spt || new Date().toISOString().slice(0, 10),
            nm_katim: '',
            nm_ppk: ppkDefault.nm_ppk || '',
            nip_ppk: ppkDefault.nip_ppk || '',
        });
    };

    const submitBastDownload = (e) => {
        e.preventDefault();
        if (!bastTarget) return;
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = route('bast.cetak', bastTarget.id);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        const fields = { _token: csrf, ...bastForm.data };
        Object.entries(fields).forEach(([k, v]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = v ?? '';
            hiddenForm.appendChild(input);
        });
        document.body.appendChild(hiddenForm);
        hiddenForm.submit();
        document.body.removeChild(hiddenForm);
        setBastTarget(null);
    };

    const filteredPetugasOptions = useMemo(() => {
        const q = petugasSearch.trim().toLowerCase();
        if (form.data.tipe_petugas === 'mitra') {
            return mitraList.filter((m) =>
                [m.nama, m.id_sobat, m.kecamatan].filter(Boolean).join(' ').toLowerCase().includes(q)
            );
        }
        return pegawaiList.filter((u) =>
            [u.name, u.nip, u.username].filter(Boolean).join(' ').toLowerCase().includes(q)
        );
    }, [form.data.tipe_petugas, mitraList, pegawaiList, petugasSearch]);

    const totalHonorFiltered = useMemo(
        () => filteredItems.reduce((acc, r) => acc + Number(r.jml_hr || 0), 0),
        [filteredItems]
    );

    return (
        <AuthenticatedLayout>
            <Head title="Input Kemitraan" />

            <div className="rounded-xl border border-slate-200 bg-white">
                {/* HEADER BAR: JUDUL + PILIHAN BULAN & TIM LANGSUNG TERLIHAT + TOMBOL AKSI */}
                <div ref={toolbarRef} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    {/* Sisi Kiri: Judul & Ringkasan */}
                    <div>
                        <h1 className="text-[15px] font-semibold text-slate-900">Input Kemitraan</h1>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Tahun {filters.tahun} • {filteredItems.length} petugas • Total{' '}
                            <strong className="font-semibold text-slate-800">{formatRupiah(totalHonorFiltered)}</strong>
                        </p>
                    </div>

                    {/* Sisi Kanan: Dropdown Bulan & Tim Langsung + Search + Kolom + Export + Copy + Tambah */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Dropdown Bulan Langsung */}
                        <select
                            value={filters.bulan}
                            onChange={(e) => handleFilterChange('bulan', e.target.value)}
                            aria-label="Bulan Kegiatan"
                            className="h-8 rounded-lg border-slate-300 py-0 pl-2.5 pr-7 text-xs font-medium text-slate-700 focus:border-blue-600 focus:ring-blue-600"
                        >
                            {BULAN_OPTIONS.map((b) => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>

                        {/* Dropdown Tim Kerja Langsung (Syarat aktif Copy & Tambah) */}
                        <select
                            value={filters.tim_id || ''}
                            onChange={(e) => handleFilterChange('tim_id', e.target.value)}
                            aria-label="Tim Kerja"
                            style={{ minWidth: '210px' }}
                            className={`h-8 rounded-lg py-0 pl-2.5 pr-7 text-xs font-medium focus:border-blue-600 focus:ring-blue-600 ${
                                !hasTimSelected
                                    ? 'border-amber-400 bg-amber-50/60 text-amber-900'
                                    : 'border-slate-300 text-slate-800'
                            }`}
                        >
                            <option value="">-- Pilih Tim Kerja --</option>
                            {timList.map((tim) => (
                                <option key={tim.id} value={tim.id}>{tim.nama_tim}</option>
                            ))}
                        </select>

                        {/* Search Icon Expandable */}
                        {searchOpen || search ? (
                            <div className="relative flex items-center">
                                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onBlur={() => { if (!search) setSearchOpen(false); }}
                                    placeholder="Cari nama / kegiatan..."
                                    style={{ width: '190px' }}
                                    className="h-8 rounded-lg border-slate-300 pl-8 pr-7 text-xs text-slate-800 focus:border-blue-600 focus:ring-blue-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setSearchOpen(false); }}
                                    className="absolute right-2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSearchOpen(true)}
                                title="Cari petugas atau kegiatan"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Search className="h-3.5 w-3.5" />
                            </button>
                        )}

                        {/* Popover Kolom */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => togglePopover('columns')}
                                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${
                                    activePopover === 'columns'
                                        ? 'border-slate-300 bg-slate-100 text-slate-900'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Columns3 className="h-3.5 w-3.5" />
                                <span>Kolom</span>
                            </button>

                            {activePopover === 'columns' && (
                                <div
                                    style={{ width: '230px' }}
                                    className="absolute right-0 z-40 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
                                >
                                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
                                        <span className="text-[11px] font-semibold text-slate-700">Tampilkan &amp; Export Kolom</span>
                                        <button type="button" onClick={() => setActivePopover(null)} className="text-slate-400 hover:text-slate-600">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <label className="mb-1 flex cursor-pointer items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={toggleAllColumns}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>All (Semua Kolom)</span>
                                    </label>

                                    <div className="max-h-52 space-y-0.5 overflow-y-auto pt-0.5">
                                        {ALL_COLUMNS.map((col) => (
                                            <label key={col.key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(visibleCols[col.key])}
                                                    onChange={() => toggleColumn(col.key)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Popover Export */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => togglePopover('export')}
                                className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition ${
                                    activePopover === 'export'
                                        ? 'border-slate-300 bg-slate-100 text-slate-900'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Export</span>
                                <ChevronDown className="h-3 w-3 text-slate-400" />
                            </button>

                            {activePopover === 'export' && (
                                <div
                                    style={{ width: '200px' }}
                                    className="absolute right-0 z-40 mt-2 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl"
                                >
                                    <div className="px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Format ({activeColumns.length} Kolom)
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleExportExcel}
                                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Excel (.xls)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExportCSV}
                                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                                        <span>CSV (.csv)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePrintTable}
                                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        <Printer className="h-3.5 w-3.5 text-blue-600" />
                                        <span>PDF / Print</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tombol Copy (Aktif hanya jika Tim sudah dipilih) */}
                        <button
                            type="button"
                            disabled={!hasTimSelected}
                            onClick={openCopy}
                            title={!hasTimSelected ? 'Pilih Tim Kerja terlebih dahulu' : 'Salin penugasan dari bulan lain'}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${
                                hasTimSelected
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                            }`}
                        >
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                        </button>

                        {/* Tombol + Tambah (Aktif hanya jika Tim sudah dipilih) */}
                        <button
                            type="button"
                            disabled={!hasTimSelected}
                            onClick={openCreateModal}
                            title={!hasTimSelected ? 'Pilih Tim Kerja terlebih dahulu' : 'Tambah penugasan baru'}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition ${
                                hasTimSelected
                                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                            }`}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Tambah</span>
                        </button>
                    </div>
                </div>

                {/* TABEL DATA */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                {activeColumns.map((col) => (
                                    <th key={col.key} className="px-4 py-2.5 whitespace-nowrap">{col.label}</th>
                                ))}
                                <th className="px-4 py-2.5 text-right whitespace-nowrap">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((row, idx) => (
                                    <tr key={row.id} className="transition-colors hover:bg-slate-50/80">
                                        {activeColumns.map((col) => {
                                            if (col.key === 'no') return <td key={col.key} className="px-4 py-2.5 text-slate-400">{idx + 1}</td>;
                                            if (col.key === 'bulan') return <td key={col.key} className="px-4 py-2.5 text-slate-600">{String(row.bulan).padStart(2, '0')}</td>;
                                            if (col.key === 'identitas') return <td key={col.key} className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{row.kode_identitas}</td>;
                                            if (col.key === 'nama') {
                                                return (
                                                    <td key={col.key} className="px-4 py-2.5">
                                                        <span className="font-medium text-slate-900">{row.nama_petugas}</span>
                                                        <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${row.tipe_petugas === 'mitra' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70' : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/70'}`}>
                                                            {row.tipe_petugas}
                                                        </span>
                                                    </td>
                                                );
                                            }
                                            if (col.key === 'asal') return <td key={col.key} className="px-4 py-2.5 text-slate-500">{row.asal_kecamatan || '-'}</td>;
                                            if (col.key === 'kegiatan') {
                                                return (
                                                    <td key={col.key} className="px-4 py-2.5">
                                                        <span className="font-mono text-[11px] font-semibold text-blue-600">[{row.kd_giat}]</span>{' '}
                                                        <span className="text-slate-700">{row.ur_giat}</span>
                                                    </td>
                                                );
                                            }
                                            if (col.key === 'satuan') return <td key={col.key} className="px-4 py-2.5 text-slate-500">{row.satuan}</td>;
                                            if (col.key === 'hr_satuan') return <td key={col.key} className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{formatRupiah(row.hr_satuan)}</td>;
                                            if (col.key === 'vol') return <td key={col.key} className="px-4 py-2.5 font-medium text-slate-800">{row.vol}</td>;
                                            if (col.key === 'jml_hr') return <td key={col.key} className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{formatRupiah(row.jml_hr)}</td>;
                                            return null;
                                        })}

                                        <td className="px-4 py-2 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openBastModal(row)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50/70 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                                                    title="Cetak / Unduh BAST"
                                                >
                                                    <FileCheck2 className="h-3 w-3" />
                                                    <span>{row.no_bast ? 'BAST ✓' : 'BAST'}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(row)}
                                                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(row)}
                                                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={activeColumns.length + 1} className="px-4 py-12 text-center text-xs text-slate-500">
                                        {hasTimSelected ? (
                                            <span>
                                                Belum ada data penugasan untuk <strong>{selectedTim?.nama_tim}</strong> bulan <strong>{namaBulan}</strong>. Klik{' '}
                                                <button type="button" onClick={openCreateModal} className="font-semibold text-blue-600 underline">
                                                    + Tambah
                                                </button>{' '}
                                                untuk menginput.
                                            </span>
                                        ) : (
                                            <span>
                                                Silakan pilih <strong>Tim Kerja</strong> pada dropdown di kanan atas untuk mengaktifkan tombol <strong>Copy</strong> dan <strong>+ Tambah</strong>.
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL INPUT / EDIT KEMITRAAN */}
            {openInputModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    {editingItem ? 'Edit Penugasan' : 'Tambah Penugasan Kemitraan'}
                                </h2>
                                <p className="text-xs text-slate-500">{bulanLabel} {filters.tahun} • {selectedTim?.nama_tim}</p>
                            </div>
                            <button type="button" onClick={() => setOpenInputModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={(e) => submitForm(e, false)} className="mt-4 space-y-3.5">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-700">Kegiatan</label>
                                <select
                                    disabled={Boolean(editingItem)}
                                    value={form.data.kegiatan_id}
                                    onChange={(e) => handleSelectKegiatan(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 text-xs disabled:bg-slate-100"
                                    required
                                >
                                    <option value="">-- Pilih Kegiatan --</option>
                                    {kegiatanList.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            [{k.kd_giat}] {k.ur_giat} ({formatRupiah(k.hr_satuan)}/{k.satuan})
                                        </option>
                                    ))}
                                </select>
                                {form.errors.kegiatan_id && <p className="mt-1 text-xs text-rose-600">{form.errors.kegiatan_id}</p>}
                            </div>

                            {!editingItem && (
                                <>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">Jenis Petugas</label>
                                        <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 p-1">
                                            {['mitra', 'organik'].map((tipe) => (
                                                <button
                                                    key={tipe}
                                                    type="button"
                                                    onClick={() => {
                                                        form.setData((prev) => ({ ...prev, tipe_petugas: tipe, mitra_id: '', user_id: '' }));
                                                        setPetugasSearch('');
                                                    }}
                                                    className={`rounded-md py-1 text-xs font-medium transition ${
                                                        form.data.tipe_petugas === tipe ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                                                    }`}
                                                >
                                                    {tipe === 'mitra' ? 'Mitra Statistik' : 'Pegawai Organik'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">
                                            Pilih {form.data.tipe_petugas === 'mitra' ? 'Mitra' : 'Pegawai Organik'}
                                        </label>
                                        <input
                                            type="text"
                                            value={petugasSearch}
                                            onChange={(e) => setPetugasSearch(e.target.value)}
                                            placeholder="Ketik nama / ID SOBAT / NIP..."
                                            className="mb-1.5 w-full rounded-lg border-slate-300 py-1.5 text-xs"
                                        />
                                        <select
                                            value={form.data.tipe_petugas === 'mitra' ? form.data.mitra_id : form.data.user_id}
                                            onChange={(e) =>
                                                form.setData(form.data.tipe_petugas === 'mitra' ? 'mitra_id' : 'user_id', e.target.value)
                                            }
                                            className="w-full rounded-lg border-slate-300 text-xs"
                                            required
                                        >
                                            <option value="">-- Pilih Nama ({filteredPetugasOptions.length}) --</option>
                                            {filteredPetugasOptions.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {form.data.tipe_petugas === 'mitra'
                                                        ? `${p.id_sobat ? `[${p.id_sobat}] ` : ''}${p.nama}${p.kecamatan ? ` — ${p.kecamatan}` : ''}`
                                                        : `${p.name}${p.nip ? ` (${p.nip})` : ''}`}
                                                </option>
                                            ))}
                                        </select>
                                        {(form.errors.mitra_id || form.errors.user_id) && (
                                            <p className="mt-1 text-xs text-rose-600">{form.errors.mitra_id || form.errors.user_id}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-3 gap-2.5">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Satuan</label>
                                    <input
                                        type="text"
                                        value={form.data.satuan}
                                        onChange={(e) => form.setData('satuan', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Honor / Sat</label>
                                    <input
                                        type="number"
                                        value={form.data.hr_satuan}
                                        onChange={(e) => form.setData('hr_satuan', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Volume</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.vol}
                                        onChange={(e) => form.setData('vol', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-xs font-semibold"
                                        required
                                    />
                                </div>
                            </div>

                            {form.errors.vol && <p className="text-xs text-rose-600">{form.errors.vol}</p>}

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                                <span className="text-slate-500">Total Honor:</span>
                                <span className="text-sm font-semibold text-blue-700">
                                    {formatRupiah(Number(form.data.hr_satuan || 0) * Number(form.data.vol || 0))}
                                </span>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                                <button type="button" onClick={() => setOpenInputModal(false)} className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700">
                                    Batal
                                </button>
                                {!editingItem && (
                                    <button
                                        type="button"
                                        disabled={form.processing}
                                        onClick={(e) => submitForm(e, true)}
                                        className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                        Simpan &amp; Tambah Lagi
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL COPY PENUGASAN BULAN */}
            {openCopyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                        <h2 className="text-sm font-semibold text-slate-900">Copy Penugasan Antar Bulan</h2>
                        <p className="mt-0.5 text-xs text-slate-500">{selectedTim?.nama_tim} • Tahun {filters.tahun}</p>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                copyForm.post(route('mitra.kemitraan.copy'), {
                                    preserveScroll: true,
                                    onSuccess: () => setOpenCopyModal(false),
                                });
                            }}
                            className="mt-4 space-y-3.5"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Dari Bulan</label>
                                    <select
                                        value={copyForm.data.dari_bulan}
                                        onChange={(e) => copyForm.setData('dari_bulan', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-xs"
                                    >
                                        {BULAN_OPTIONS.map((b) => (
                                            <option key={b.value} value={b.value}>{b.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Ke Bulan Tujuan</label>
                                    <select
                                        value={copyForm.data.ke_bulan}
                                        onChange={(e) => copyForm.setData('ke_bulan', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-xs"
                                    >
                                        {BULAN_OPTIONS.map((b) => (
                                            <option key={b.value} value={b.value}>{b.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-700">Filter Kegiatan (Opsional)</label>
                                <select
                                    value={copyForm.data.kegiatan_id}
                                    onChange={(e) => copyForm.setData('kegiatan_id', e.target.value)}
                                    className="w-full rounded-lg border-slate-300 text-xs"
                                >
                                    <option value="">Semua Kegiatan Tim Ini</option>
                                    {kegiatanList.map((k) => (
                                        <option key={k.id} value={k.id}>[{k.kd_giat}] {k.ur_giat}</option>
                                    ))}
                                </select>
                            </div>

                            {copyForm.errors.dari_bulan && <p className="text-xs text-rose-600">{copyForm.errors.dari_bulan}</p>}

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <button type="button" onClick={() => setOpenCopyModal(false)} className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-medium">
                                    Batal
                                </button>
                                <button type="submit" disabled={copyForm.processing} className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                                    Salin Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {bastTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">Cetak BAST</h2>
                                <p className="text-xs text-slate-500">{bastTarget.nama_petugas} • {bastTarget.ur_giat}</p>
                            </div>
                            <button type="button" onClick={() => setBastTarget(null)} className="text-slate-400 hover:text-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={submitBastDownload} className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Nomor SPT</label>
                                    <input type="text" value={bastForm.data.no_spt} onChange={(e) => bastForm.setData('no_spt', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Tanggal SPT</label>
                                    <input type="date" value={bastForm.data.tgl_spt} onChange={(e) => bastForm.setData('tgl_spt', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Hari BAST</label>
                                    <input type="text" value={bastForm.data.hari} onChange={(e) => bastForm.setData('hari', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Terbilang Tanggal</label>
                                    <input type="text" placeholder="Dua Puluh" value={bastForm.data.tanggalindo} onChange={(e) => bastForm.setData('tanggalindo', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Tanggal BAST</label>
                                    <input type="date" value={bastForm.data.tgl_bast} onChange={(e) => bastForm.setData('tgl_bast', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-700">Nama Ketua Tim</label>
                                <input type="text" value={bastForm.data.nm_katim} onChange={(e) => bastForm.setData('nm_katim', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Nama PPK</label>
                                    <input type="text" value={bastForm.data.nm_ppk} onChange={(e) => bastForm.setData('nm_ppk', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">NIP PPK</label>
                                    <input type="text" value={bastForm.data.nip_ppk} onChange={(e) => bastForm.setData('nip_ppk', e.target.value)} className="w-full rounded-lg border-slate-300 text-xs" required />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <button type="button" onClick={() => setBastTarget(null)} className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-medium">
                                    Batal
                                </button>
                                <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Unduh BAST (.docx)</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
