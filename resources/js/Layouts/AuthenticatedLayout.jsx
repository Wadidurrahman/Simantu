import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Topbar from '@/Components/Layout/Topbar';
import ForcePasswordModal from '@/Components/ForcePasswordModal';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const mustChangePassword = Number(user?.must_change_password) === 1 || user?.must_change_password === true;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && window.innerWidth < 1280) setIsSidebarCollapsed(true);
            if (window.innerWidth >= 1280) setIsSidebarCollapsed(false);
            if (window.innerWidth >= 1024) setIsMobileOpen(false);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar
                    user={user}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    setIsMobileOpen={setIsMobileOpen}
                />

                {header && (
                    <header className="z-10 shrink-0 border-b border-slate-200 bg-white">
                        <div className="px-3 py-3 sm:px-4 lg:px-5">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto bg-slate-50 p-3 sm:p-4 lg:p-5">
                    {children}
                </main>
            </div>

            {mustChangePassword && <ForcePasswordModal show user={user} />}
        </div>
    );
}
