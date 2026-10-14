import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    show,
    title,
    onClose,
    onSubmit,
    submitLabel = 'Simpan',
    processing = false,
    danger = false,
    children,
}) {
    useEffect(() => {
        if (!show) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape' && !processing) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener(
                'keydown',
                handleEscape
            );
        };
    }, [show, processing, onClose]);

    if (!show) {
        return null;
    }

    const content = (
        <>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                {children}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-5 py-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className="h-9 rounded-md border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Batal
                </button>

                {onSubmit && (
                    <button
                        type="submit"
                        disabled={processing}
                        className={`h-9 rounded-md px-4 text-[13px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            danger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-700 hover:bg-blue-800'
                        }`}
                    >
                        {processing
                            ? 'Memproses...'
                            : submitLabel}
                    </button>
                )}
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Tutup modal"
                className="absolute inset-0 cursor-default bg-slate-950/50"
                onClick={() => {
                    if (!processing) {
                        onClose();
                    }
                }}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
                    <h2 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {onSubmit ? (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            onSubmit();
                        }}
                    >
                        {content}
                    </form>
                ) : (
                    content
                )}
            </div>
        </div>
    );
}
