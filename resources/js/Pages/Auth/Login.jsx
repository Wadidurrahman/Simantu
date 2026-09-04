import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Activity,
  Wallet,
  Map,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function LoginForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    username: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    post('/login', {
      onSuccess: () => {
        setIsSuccess(true);
      },
    });
  };

  return (
    <>
      <Head title="Log in" />

      <main className="relative min-h-dvh w-full overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 scale-[1.01] bg-cover bg-center bg-no-repeat animate-[slowZoom_25s_ease-in-out_infinite_alternate]"
            style={{ backgroundImage: "url('/gedung-cutout.webp')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/60 lg:bg-gradient-to-r lg:from-white/95 lg:via-white/50 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 via-transparent to-transparent lg:bg-gradient-to-b lg:from-white/30 lg:via-transparent lg:to-slate-900/5" />
        </div>

        <div className="relative z-10 flex h-full w-full items-center justify-center overflow-x-hidden px-4 py-8 sm:px-8 lg:px-10">
          <div
            className={`grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_400px] lg:gap-16 xl:gap-24 transition-all duration-700 ${
              isSuccess ? "scale-[0.985] opacity-95" : "scale-100 opacity-100"
            }`}
          >
            {/* BAGIAN TEKS: Diatur agar menjadi urutan ke-2 (di bawah) saat di HP, dan urutan ke-1 (kiri) di laptop */}
            <section className="order-2 lg:order-1 flex min-w-0 flex-col justify-center text-center lg:text-left lg:translate-x-3 mt-4 lg:mt-0">
              <div className="max-w-2xl mx-auto lg:mx-0">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 sm:text-[11px] animate-pulse">
                    Badan Pusat Statistik
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-600 sm:text-[11px]">
                    Kota Probolinggo
                  </p>
                </div>

                <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.01em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 sm:text-6xl lg:text-[4.5rem] xl:text-[5rem] drop-shadow-sm">
                  SIMANTU
                </h1>

                <div className="mt-5 h-1.5 w-16 mx-auto lg:mx-0 rounded-full bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 sm:mt-2 shadow-sm" />

                <div className="mt-5 max-w-xl mx-auto lg:mx-0 sm:mt-6">
                  <p className="text-sm font-extrabold leading-relaxed text-slate-900 sm:text-base">
                    Sistem Informasi Manajemen Terpadu.
                  </p>
                  <p className="mt-2.5 max-w-lg mx-auto lg:mx-0 text-xs leading-relaxed text-slate-600 sm:text-sm sm:leading-relaxed">
                    Platform terintegrasi untuk mendukung pengelolaan kinerja,
                    honorarium, dan administrasi perjalanan dinas secara efektif,
                    akurat, dan transparan.
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:mt-8 sm:gap-4">
                  <div className="group flex items-center gap-2.5 border-l-[3px] border-blue-600 bg-white/50 backdrop-blur-sm px-3.5 py-2 rounded-r-lg shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md hover:border-blue-500">
                    <Activity className="h-4 w-4 shrink-0 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-slate-700 transition-colors group-hover:text-blue-700">
                      Kinerja
                    </span>
                  </div>

                  <div className="group flex items-center gap-2.5 border-l-[3px] border-green-500 bg-white/50 backdrop-blur-sm px-3.5 py-2 rounded-r-lg shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md hover:border-green-400">
                    <Wallet className="h-4 w-4 shrink-0 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-slate-700 transition-colors group-hover:text-green-600">
                      Honorarium
                    </span>
                  </div>

                  <div className="group flex items-center gap-2.5 border-l-[3px] border-orange-500 bg-white/50 backdrop-blur-sm px-3.5 py-2 rounded-r-lg shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md hover:border-orange-400">
                    <Map className="h-4 w-4 shrink-0 text-orange-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-slate-700 transition-colors group-hover:text-orange-600">
                      Perjalanan Dinas
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:mt-12 sm:text-[10px]">
                © {new Date().getFullYear()} BPS Kota Probolinggo
              </div>
            </section>

            {/* BAGIAN FORM CARD: Diatur agar menjadi urutan ke-1 (teratas) saat di HP, dan urutan ke-2 (kanan) di laptop */}
            <section className="order-1 lg:order-2 flex w-full justify-center lg:justify-start pb-4 lg:pb-0">
              <div
                className={`w-full max-w-[390px] rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.18)] backdrop-blur-md transition-all duration-500 sm:p-7 ${
                  isSuccess
                    ? "translate-y-[-8px] scale-[0.98] opacity-100"
                    : "translate-y-0 scale-100 opacity-100"
                }`}
              >
                {isSuccess ? (
                  <div className="flex min-h-[290px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900">
                      Login Berhasil
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                      <span>Menyiapkan dashboard...</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 flex flex-col items-center text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-white p-2.5 shadow-sm">
                        <img
                          src="/logoBPS.webp"
                          alt="Logo BPS"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900">
                        SIMANTU
                      </h2>
                      <div className="mt-1.5 h-0.5 w-8 rounded-full bg-blue-600" />
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Gunakan kredensial Anda untuk masuk
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {errors.username && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="leading-relaxed">{errors.username}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="ml-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                          Username
                        </label>
                        <div className="group relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                            <User className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            name="username"
                            value={data.username}
                            onChange={(e) => setData("username", e.target.value)}
                            required
                            disabled={processing}
                            placeholder="Masukkan username"
                            className="h-11 w-full rounded-xl border border-slate-200/80 bg-slate-50/70 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="ml-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                          Password
                        </label>
                        <div className="group relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                            <Lock className="h-4 w-4" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            required
                            disabled={processing}
                            placeholder="••••••••"
                            className="h-11 w-full rounded-xl border border-slate-200/80 bg-slate-50/70 pl-10 pr-11 text-xs font-semibold text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={processing}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-blue-600 focus:outline-none focus-visible:text-blue-600 disabled:opacity-50"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={processing}
                        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-[0_10px_25px_-10px_rgba(37,99,235,0.6)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_14px_30px_-10px_rgba(37,99,235,0.65)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Memverifikasi...</span>
                          </>
                        ) : (
                          <>
                            <span>Masuk</span>
                            <span className="text-sm leading-none">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
