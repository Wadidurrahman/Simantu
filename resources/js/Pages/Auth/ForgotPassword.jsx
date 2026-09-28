import { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';
import { XCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        nip: '',
    });

    const [showErrorPopup, setShowErrorPopup] = useState(false);

    useEffect(() => {
        if (errors.nip) {
            setShowErrorPopup(true);
            const timer = setTimeout(() => {
                setShowErrorPopup(false);
                clearErrors('nip');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors.nip, clearErrors]);

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        setShowErrorPopup(false);
        post(route('password.email'));
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center p-4 relative bg-slate-50 overflow-hidden font-sans">
            <Head title="Lupa Password - SIMANTU" />

            {/* Background Jaring-jaring Abstrak (Geometric Mesh) */}
            <div
                className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-5.414 5.415-4.243-4.243L51.213 0h3.414zM24 60h4v-3.787l-4-4V60zM0 48.787l4.243 4.242-5.415 5.415H0v-9.657zM60 48v4h-2.172l-4-4H60zM0 24h3.787l4 4H0v-4zm60-12v4h-3.787l-4-4H60zM42.426 0l4.243 4.243-15.556 15.556-4.243-4.243L42.426 0zM0 12.172l5.414 5.414-4.242 4.243L0 16.414v-4.242z' fill='%230f172a' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Aksen Gradient Halus */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px]"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-400/20 blur-[100px]"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200 overflow-hidden h-fit">

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
                        <div className="mb-6 font-medium text-sm text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-start gap-3 transition-all duration-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                            <p>{status}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="relative">

                        {/* POPUP ERROR TOOLTIP MELAYANG */}
                        <div
                            className={`absolute z-50 bottom-[125px] left-0 mb-2 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-left w-full ${
                            showErrorPopup ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-3 pointer-events-none"
                            }`}
                        >
                            <div className="relative bg-red-600/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-[0_10px_25px_-5px_rgba(220,38,38,0.5)] flex items-start gap-3 border border-red-500/50">
                                <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-200" />
                                <span className="text-sm font-semibold leading-tight tracking-wide">
                                    {errors.nip}
                                </span>
                                {/* Segitiga Panah Menunjuk ke Bawah */}
                                <div className="absolute top-full left-6 -mt-[1px] border-[8px] border-transparent border-t-red-600/95 drop-shadow-md"></div>
                            </div>
                        </div>

                        <div className="mb-8 relative">
                            <label htmlFor="nip" className="block text-sm font-bold text-gray-700 mb-2">
                                Nomor Induk Pegawai (NIP)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                                <TextInput
                                    id="nip"
                                    type="text"
                                    name="nip"
                                    value={data.nip}
                                    className={`block w-full pl-11 pr-4 py-3 rounded-xl border shadow-sm outline-none transition-all duration-200 text-sm font-semibold text-slate-800 disabled:opacity-50 ${
                                        errors.nip ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/30" : "border-slate-200/80 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 bg-slate-50/70 focus:bg-white"
                                    }`}
                                    isFocused={true}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    placeholder="Ketik NIP Anda..."
                                    disabled={processing}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                            <Link
                                href={route('login')}
                                className="text-sm text-gray-500 hover:text-blue-700 font-bold transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center group outline-none focus:text-blue-700"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                Kembali
                            </Link>

                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-blue-700 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-wider hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <AlertCircle className="h-4 w-4 mr-2 animate-pulse" />
                                        Mencari...
                                    </>
                                ) : 'Kirim Link Reset'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
