import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../Components/Layout/Sidebar';
import Topbar from '../Components/Layout/Topbar';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="h-screen w-full bg-slate-50 flex overflow-hidden">

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">

                <Topbar
                    user={auth.user}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    setIsMobileOpen={setIsMobileSidebarOpen}
                />

                <main className="flex-1 overflow-y-auto bg-slate-50/50 relative">
                    {children}
                </main>

            </div>
        </div>
    );
}
