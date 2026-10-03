import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ForcePasswordModal({ show }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    if (!show) return null;

    const submit = (e) => {
        e.preventDefault();
        put(route('password.force.update'), {
            onSuccess: () => {
                // Menghancurkan state memori Inertia lama yang membekukan popup
                window.location.href = route('dashboard');
            }
        });
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return { width: '0%', color: 'bg-transparent', label: '', labelColor: '' };
        if (pass.length < 4) return { width: '33.33%', color: 'bg-red-500', label: 'Sangat Lemah', labelColor: 'text-red-500' };
        if (pass.length < 8) return { width: '66.66%', color: 'bg-amber-500', label: 'Kurang (Min. 8 karakter)', labelColor: 'text-amber-500' };
        return { width: '100%', color: 'bg-emerald-500', label: 'Memenuhi Syarat', labelColor: 'text-emerald-600' };
    };

    const strength = getPasswordStrength(data.password);

    return (
        <>
            <div className="fixed inset-0 z-50 pointer-events-auto"
                 style={{
                     background: 'radial-gradient(circle at calc(100% - 80px) 32px, transparent 35px, rgba(15, 23, 42, 0.45) 45px)'
                 }}
            ></div>

            <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-none"
                 style={{
                     maskImage: 'radial-gradient(circle at calc(100% - 80px) 32px, transparent 35px, black 45px)',
                     WebkitMaskImage: 'radial-gradient(circle at calc(100% - 80px) 32px, transparent 35px, black 45px)'
                 }}
            ></div>

            <div className="fixed top-[88px] right-4 sm:right-6 lg:right-10 z-[60] w-full max-w-sm animate-fade-in-up">
                <div className="absolute -top-2 right-10 w-5 h-5 bg-white rotate-45 rounded-sm shadow-sm border-l border-t border-slate-200"></div>

                <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 p-5">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="bg-red-50 p-2 rounded-lg shrink-0 border border-red-100">
                            <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 leading-tight">
                                Pembaruan Keamanan
                            </h2>
                            <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mt-0.5">
                                Wajib Ubah Sandi Default
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                        Akses Dashboard dikunci sementara. Tingkatkan keamanan akun Anda dengan membuat kata sandi baru.
                    </p>

                    <form onSubmit={submit} className="space-y-3.5">
                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi Baru" className="text-xs font-bold text-slate-800" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="block w-full text-sm border-slate-300 focus:border-blue-600 focus:ring-blue-600/20 pr-10 rounded-lg"
                                    isFocused={true}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Min. 8 karakter"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-3 mt-2 h-3">
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex-1">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${strength.color}`}
                                        style={{ width: strength.width }}
                                    ></div>
                                </div>
                                <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap transition-colors duration-300 ${strength.labelColor}`}>
                                    {strength.label}
                                </span>
                            </div>

                            <InputError message={errors.password} className="mt-1 text-xs" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Kata Sandi" className="text-xs font-bold text-slate-800" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    className="block w-full text-sm border-slate-300 focus:border-blue-600 focus:ring-blue-600/20 pr-10 rounded-lg"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Ketik ulang sandi baru"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                        </div>

                        <div className="pt-2">
                            <PrimaryButton className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide py-2.5 rounded-lg shadow-sm" disabled={processing}>
                                SIMPAN & LANJUTKAN
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </>
    );
}
