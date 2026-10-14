export const inputClass =
    'w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-[13px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

export default function FormField({
    label,
    required = false,
    error,
    hint,
    children,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
                {label}

                {required && (
                    <span className="ml-0.5 text-red-600">
                        *
                    </span>
                )}
            </label>

            {children}

            {error ? (
                <p className="mt-1 text-[11px] text-red-600">
                    {error}
                </p>
            ) : hint ? (
                <p className="mt-1 text-[11px] text-slate-500">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
