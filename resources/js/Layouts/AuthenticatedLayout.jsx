import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Topbar from '@/Components/Layout/Topbar';
import ForcePasswordModal from '@/Components/ForcePasswordModal';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Tambahan user prop agar Sidebar mengenali role mitra/pegawai */}
            <Sidebar user={auth?.user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Tambahan user prop agar Topbar mengenali data user */}
                <Topbar user={auth?.user} onMenuClick={() => setIsSidebarOpen(true)} />

                {header && (
                    <header className="bg-white shadow-sm border-b border-slate-200 z-10">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Modal Ganti Password Paksa */}
            {auth?.user?.must_change_password === 1 && (
                <ForcePasswordModal show={true} />
            )}
        </div>
    );
}
