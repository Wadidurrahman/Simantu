import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Realisasi() {
    return (
        <AuthenticatedLayout>
            <Head title="Realisasi Kinerja" />

            <div className="flex min-h-full flex-col gap-3 lg:h-full lg:min-h-0 lg:gap-4">
                <div className="shrink-0">
                </div>

                <section className="flex min-h-[280px] flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-10 sm:min-h-[360px] sm:px-8">
                    <div className="mx-auto w-full max-w-md text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:h-12 sm:w-12">
                            <ClipboardList className="h-5 w-5" />
                        </div>

                        <h2 className="mt-4 text-sm font-semibold text-slate-900">
                            Modul Realisasi Kinerja
                        </h2>

                        <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-5 text-slate-500 sm:text-xs">
                            Struktur halaman sudah tersedia. Data dan proses realisasi akan dilanjutkan dari alur sistem sebelumnya.
                        </p>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
