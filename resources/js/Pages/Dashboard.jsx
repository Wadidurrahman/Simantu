import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import KpiCards from '@/Components/Dashboard/KpiCards';
import RecentActivityTable from '@/Components/Dashboard/RecentActivityTable';
import BudgetAbsorption from '@/Components/Dashboard/BudgetAbsorption';
import ForcePasswordModal from '@/Components/ForcePasswordModal';

export default function Dashboard({ kpi, kegiatanTerkini, serapanAnggaran }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <ForcePasswordModal show={true} user={user} />

            <div className="h-full flex flex-col p-4 sm:p-5 max-w-[1600px] mx-auto gap-4">
                <DashboardHeader />
                <KpiCards kpi={kpi} />
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                    <RecentActivityTable kegiatan={kegiatanTerkini} />
                    <BudgetAbsorption anggaran={serapanAnggaran} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
