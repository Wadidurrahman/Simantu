import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ForcePasswordModal({ show }) {
    const { data, setData, put, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    if (!show) return null;

    const submit = (e) => {
        e.preventDefault();
        put(route('password.force.update'));
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return { width: '0%', color: 'bg-transparent' };
        if (pass.length < 4) return { width: '33.33%', color: 'bg-red-500' };
        if (pass.length < 8) return { width: '66.66%', color: 'bg-amber-400' };
        return { width: '100%', color: 'bg-emerald-500' };
    };

    const strength = getPasswordStrength(data.password);

    return (
        <>
            <div className="fixed inset-0 z-50 pointer-events-auto"
                 style={{
                     background: 'radial-gradient(circle at calc(100% - 90px) 32px, transparent 55px, rgba(15, 23, 42, 0.35) 65px)'
                 }}
            ></div>

            <div className="fixed inset-0 z-40 backdrop-blur-[4px] pointer-events-none"
                 style={{
                     maskImage: 'radial-gradient(circle at calc(100% - 90px) 32px, transparent 55px, black 65px)',
                     WebkitMaskImage: 'radial-gradient(circle at calc(100% - 90px) 32px, transparent 55px, black 65px)'
                 }}
            ></div>

            <div className="fixed top-[88px] right-4 sm:right-6 lg:right-10 z-[60] w-full max-w-sm animate-bounce-soft">
                <div className="absolute -top-2.5 right-10 w-6 h-6 bg-white rotate-45 rounded-sm shadow-[-4px_-4px_10px_rgba(0,0,0,0.08)]"></div>

                <div className="relative bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] p-6 ring-1 ring-slate-200/50">
                    <div className="flex items-center gap-4 mb-5 border-b border-slate-100 pb-4">
                        <div className="bg-red-100 p-2.5 rounded-full shrink-0 animate-pulse">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">
                                Keamanan Akun
                            </h2>
                            <p className="text-[11px] text-red-500 font-bold uppercase tracking-wider mt-0.5">
                                Tindakan Wajib Diperlukan
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                        Sistem mendeteksi Anda masih menggunakan kata sandi default. Silakan buat sandi baru yang lebih aman untuk membuka akses Dashboard.
                    </p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi Baru" className="text-xs font-bold text-slate-700" />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                className="mt-1.5 block w-full text-sm bg-slate-50 border-slate-200 focus:bg-white"
                                isFocused={true}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                            />
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${strength.color}`}
                                    style={{ width: strength.width }}
                                ></div>
                            </div>
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        <div className="pt-1">
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" className="text-xs font-bold text-slate-700" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                className="mt-1.5 block w-full text-sm bg-slate-50 border-slate-200 focus:bg-white"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Ketik ulang sandi baru"
                            />
                            <InputError message={errors.password_confirmation} className="mt-1.5" />
                        </div>

                        <div className="pt-4">
                            <PrimaryButton className="w-full justify-center bg-blue-600 hover:bg-blue-700 py-3 shadow-md transition-transform active:scale-[0.98]" disabled={processing}>
                                SIMPAN & LANJUTKAN
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes bounceSoft {
                    0% { transform: translateY(-15px); opacity: 0; }
                    50% { transform: translateY(4px); opacity: 0.8; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-bounce-soft {
                    animation: bounceSoft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>
        </>
    );
}
