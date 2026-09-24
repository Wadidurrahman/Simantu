import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        nip: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-50 overflow-hidden font-sans">
            <Head title="Lupa Password - SIMANTU" />

            {/* Background Jaring-jaring Abstrak (Geometric Mesh) */}
            <div
                className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-5.414 5.415-4.243-4.243L51.213 0h3.414zM24 60h4v-3.787l-4-4V60zM0 48.787l4.243 4.242-5.415 5.415H0v-9.657zM60 48v4h-2.172l-4-4H60zM0 24h3.787l4 4H0v-4zm60-12v4h-3.787l-4-4H60zM42.426 0l4.243 4.243-15.556 15.556-4.243-4.243L42.426 0zM0 12.172l5.414 5.414-4.242 4.243L0 16.414v-4.242z' fill='%230f172a' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Aksen Gradient Halus (Tidak Lebay) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px]"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[100px]"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200 overflow-hidden">

                {/* Garis Tegas Identitas (Biru BPS) */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-blue-400"></div>

                <div className="p-8 sm:p-10">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-14 h-14 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-5 shadow-sm transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Lupa Password?</h2>
                        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                            Masukkan <strong className="text-gray-800">NIP</strong> Anda. Sistem akan mengirimkan instruksi pemulihan ke <strong className="text-gray-800">Email resmi BPS</strong> Anda.
                        </p>
                    </div>

                    {/* Status Alert */}
                    {status && (
                        <div className="mb-6 font-medium text-sm text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
                            <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p>{status}</p>
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="mb-8">
                            <label htmlFor="nip" className="block text-sm font-bold text-gray-700 mb-2">
                                Nomor Induk Pegawai (NIP)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    {/* Icon User/Badge */}
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="nip"
                                    type="text"
                                    name="nip"
                                    value={data.nip}
                                    className="block w-full pl-11 pr-4 py-3 rounded-xl border-gray-300 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 font-medium bg-gray-50 focus:bg-white"
                                    isFocused={true}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    placeholder="Ketik NIP Anda..."
                                />
                            </div>
                            <InputError message={errors.nip} className="mt-2" />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                            <Link
                                href={route('login')}
                                className="text-sm text-gray-500 hover:text-blue-700 font-bold transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center group"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                Kembali
                            </Link>

                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-blue-700 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-wider hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Memproses...' : 'Kirim Link Reset'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
