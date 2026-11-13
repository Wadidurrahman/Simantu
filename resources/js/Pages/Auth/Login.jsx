
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
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

export default function LoginForm({
  tahunOptions = [],
  tahunDefault,
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tahunSekarang = Number(
    new Intl.DateTimeFormat("en", {
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(new Date())
  );

  const tahunMinimal = 2020;
  const tahunMaksimal = tahunSekarang + 1;

  const daftarTahun = tahunOptions.length
    ? tahunOptions
    : Array.from(
        { length: tahunSekarang + 3 - tahunMinimal },
        (_, index) => {
          const tahun = tahunSekarang + 2 - index;

          return {
            value: tahun,
            label: String(tahun),
            disabled: tahun > tahunMaksimal,
          };
        }
      );

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    login: "",
    password: "",
    tahun: tahunDefault ?? tahunSekarang,
    remember: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    post("/login", {
      preserveScroll: true,
      onSuccess: () => setIsSuccess(true),
      onError: () => setIsSuccess(false),
    });
  };

  return (
    <>
      <Head title="Masuk | SIMANTU" />

      <main className="relative min-h-dvh w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white lg:h-dvh lg:overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 scale-[1.01] bg-cover bg-center bg-no-repeat animate-[slowZoom_25s_ease-in-out_infinite_alternate]"
            style={{
              backgroundImage: "url('/gedung-cutout.webp')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/60 lg:bg-gradient-to-r lg:from-white/95 lg:via-white/50 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 via-transparent to-transparent lg:bg-gradient-to-b lg:from-white/30 lg:via-transparent lg:to-slate-900/5" />
        </div>

        <div className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-8 sm:px-8 lg:h-full lg:px-10 lg:py-4">
          <div
            className={`flex w-full max-w-6xl flex-col items-center justify-between gap-10 transition-all duration-700 lg:flex-row lg:gap-16 xl:gap-24 ${
              isSuccess
                ? "scale-[0.985] opacity-95"
                : "scale-100 opacity-100"
            }`}
          >
            <section className="order-2 hidden flex-1 flex-col justify-center text-center sm:flex lg:order-1 lg:text-left">
              <div className="mx-auto max-w-2xl lg:mx-0">
                <div className="mb-4">
                  <p className="animate-pulse text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                    Badan Pusat Statistik
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
                    Kota Probolinggo
                  </p>
                </div>

                <h1 className="bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 bg-clip-text pb-2 text-5xl font-black leading-[0.95] tracking-[-0.01em] text-transparent drop-shadow-sm sm:text-6xl lg:text-[4.5rem] xl:text-[5rem]">
                  SIMANTU
                </h1>

                <div className="mx-auto mt-5 h-1.5 w-16 rounded-full bg-gradient-to-r from-blue-600 via-green-500 to-orange-500 shadow-sm sm:mt-2 lg:mx-0" />

                <div className="mx-auto mt-5 max-w-xl sm:mt-6 lg:mx-0">
                  <p className="text-base font-extrabold leading-relaxed text-slate-900 sm:text-lg">
                    Sistem Informasi Manajemen Teknik & Umum.
                  </p>
                  <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base lg:mx-0">
                    Platform terintegrasi untuk mendukung pengelolaan kinerja,
                    honorarium, dan administrasi perjalanan dinas secara
                    efektif, akurat, dan transparan.
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4 lg:justify-start">
                  <div className="group flex items-center gap-2.5 rounded-r-lg border-l-[3px] border-blue-600 bg-white/50 px-3.5 py-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500 hover:bg-white/80 hover:shadow-md">
                    <Activity className="h-4 w-4 shrink-0 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-xs font-bold uppercase leading-tight tracking-[0.08em] text-slate-700 transition-colors group-hover:text-blue-700">
                      Kinerja
                    </span>
                  </div>

                  <div className="group flex items-center gap-2.5 rounded-r-lg border-l-[3px] border-green-500 bg-white/50 px-3.5 py-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-green-400 hover:bg-white/80 hover:shadow-md">
                    <Wallet className="h-4 w-4 shrink-0 text-green-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-xs font-bold uppercase leading-tight tracking-[0.08em] text-slate-700 transition-colors group-hover:text-green-600">
                      Honorarium
                    </span>
                  </div>

                  <div className="group flex items-center gap-2.5 rounded-r-lg border-l-[3px] border-orange-500 bg-white/50 px-3.5 py-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-orange-500 hover:bg-white/80 hover:shadow-md">
                    <Map className="h-4 w-4 shrink-0 text-orange-500 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-xs font-bold uppercase leading-tight tracking-[0.08em] text-slate-700 transition-colors group-hover:text-orange-600">
                      Perjalanan Dinas
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:mt-12 sm:text-xs">
                © {tahunSekarang} BPS Kota Probolinggo
              </div>
            </section>

            <section className="order-1 flex w-full shrink-0 justify-center lg:order-2 lg:w-[420px]">
              <div
                className={`w-full rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.18)] backdrop-blur-md transition-all duration-500 sm:p-8 ${
                  isSuccess
                    ? "-translate-y-2 scale-[0.98] opacity-100"
                    : "translate-y-0 scale-100 opacity-100"
                }`}
              >
                {isSuccess ? (
                  <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">
                      Login Berhasil
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Tahun Anggaran {data.tahun}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Menyiapkan dashboard...</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 flex flex-col items-center text-center sm:mb-7">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white p-2.5 shadow-sm">
                        <img
                          src="/logoBPS.webp"
                          alt="Logo BPS"
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        SIMANTU
                      </h2>

                      <div className="mt-2 h-1 w-10 rounded-full bg-blue-600" />

                      <p className="mt-3 text-sm font-medium text-slate-500">
                        Masuk untuk mengakses sistem
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="relative flex flex-col gap-4"
                    >
                      <div className="space-y-1">
                        <label
                          htmlFor="login"
                          className="ml-1 text-xs font-bold tracking-[0.16em] text-slate-600"
                        >
                          Username atau Email
                        </label>

                        <div className="group relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                            <User className="h-5 w-5" />
                          </div>

                          <input
                            id="login"
                            type="text"
                            name="login"
                            value={data.login}
                            autoComplete="username"
                            onChange={(e) =>
                              setData("login", e.target.value)
                            }
                            required
                            disabled={processing}
                            placeholder="Masukkan username atau email"
                            className={`h-12 w-full rounded-xl border bg-slate-50/70 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                              errors.login
                                ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200/80 focus:border-blue-600 focus:ring-blue-600/10"
                            }`}
                          />
                        </div>

                        {errors.login && (
                          <div className="ml-1 mt-1 flex items-center gap-1.5 text-red-500">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs font-semibold">
                              {errors.login ===
                                "These credentials do not match our records." ||
                              errors.login === "auth.failed"
                                ? "Username atau password tidak sesuai."
                                : errors.login}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="mb-1 ml-1 flex items-center justify-between">
                          <label
                            htmlFor="password"
                            className="text-xs font-bold tracking-[0.16em] text-slate-600"
                          >
                            Password
                          </label>

                          <a
                            href="/forgot-password"
                            className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-800 focus:outline-none focus:underline"
                          >
                            Lupa Password?
                          </a>
                        </div>

                        <div className="group relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                            <Lock className="h-5 w-5" />
                          </div>

                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) =>
                              setData("password", e.target.value)
                            }
                            required
                            disabled={processing}
                            placeholder="••••••••"
                            className={`h-12 w-full rounded-xl border bg-slate-50/70 pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                              errors.password || errors.login
                                ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200/80 focus:border-blue-600 focus:ring-blue-600/10"
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(!showPassword)
                            }
                            disabled={processing}
                            aria-label={
                              showPassword
                                ? "Sembunyikan password"
                                : "Tampilkan password"
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-blue-600 focus:outline-none disabled:opacity-50"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        {errors.password && (
                          <div className="ml-1 mt-1 flex items-center gap-1.5 text-red-500">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs font-semibold">
                              {errors.password}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="tahun"
                          className="ml-1 text-xs font-bold tracking-[0.16em] text-slate-600"
                        >
                          Tahun Anggaran
                        </label>

                        <div className="group relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-600">
                            <CalendarDays className="h-5 w-5" />
                          </div>

                          <select
                            id="tahun"
                            name="tahun"
                            value={data.tahun}
                            onChange={(e) =>
                              setData("tahun", Number(e.target.value))
                            }
                            disabled={processing}
                            required
                            className={`h-12 w-full appearance-none rounded-xl border bg-slate-50/70 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
                              errors.tahun
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                                : "border-slate-200/80 focus:border-blue-600 focus:ring-blue-600/10"
                            }`}
                          >
                            {daftarTahun.map((item) => {
                              const tahun = Number(item.value);
                              const terkunci =
                                item.disabled || tahun > tahunMaksimal;

                              return (
                                <option
                                  key={tahun}
                                  value={tahun}
                                  disabled={terkunci}
                                >
                                  {item.label || tahun}
                                  {terkunci
                                    ? " - Belum tersedia"
                                    : tahun === tahunSekarang
                                      ? " - Tahun berjalan"
                                      : tahun === tahunMaksimal
                                        ? " - Tahun berikutnya"
                                        : ""}
                                </option>
                              );
                            })}
                          </select>

                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>

                        {errors.tahun ? (
                          <div className="ml-1 mt-1 flex items-center gap-1.5 text-red-500">
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs font-semibold">
                              {errors.tahun}
                            </span>
                          </div>
                        ) : (
                          <p className="ml-1 mt-1 text-[11px] leading-relaxed text-slate-500">
                            Data yang ditampilkan akan mengikuti tahun
                            anggaran yang dipilih.
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={processing}
                        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-[0_10px_25px_-10px_rgba(37,99,235,0.6)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_14px_30px_-10px_rgba(37,99,235,0.65)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Memverifikasi...</span>
                          </>
                        ) : (
                          <>
                            <span>Masuk</span>
                            <span className="text-lg leading-none">→</span>
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
