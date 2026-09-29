import { Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function DashboardHeader() {
    return (
        <div className="flex justify-end gap-3 w-full">
            <Link
                href={route('giat.index')}
                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" /> Giat Baru
            </Link>
            <Link
                href={route('translok.master.index')}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-700 border border-transparent text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" /> Translok Baru
            </Link>
        </div>
    );
}
