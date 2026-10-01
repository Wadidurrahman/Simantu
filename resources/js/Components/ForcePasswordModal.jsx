import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function ForcePasswordModal({ show, user }) {
    if (!show || user.must_change_password !== 1) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">

                {/* Icon Peringatan */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    <ShieldAlert className="h-7 w-7 animate-bounce" />
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800">
                        Keamanan Akun Diperlukan
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Halo <span className="font-semibold text-slate-700">{user.name}</span>, demi keamanan sistem, Anda diwajibkan untuk segera mengubah password default Anda sebelum melanjutkan aktivitas.
                    </p>
                </div>

                {/* Tombol Aksi ke Halaman Profil/Setting */}
                <div className="pt-2">
                    <a
                        href="/profile"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.98]"
                    >
                        <span>Pergi ke Pengaturan Password</span>
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                    * Layar ini akan terus terkunci sampai Anda memperbarui password Anda.
                </p>
            </div>
        </div>
    );
}
