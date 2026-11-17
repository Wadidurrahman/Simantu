
export default function PortalFooter({ institution, year, contact = {} }) {
    const contactItems = [
        {
            title: 'Email Resmi',
            value: contact.email,
            href: contact.email ? `mailto:${contact.email}` : null,
        },
        {
            title: 'Telepon / WhatsApp',
            value: contact.phone,
            href: contact.phone_href || null,
        },
    ].filter((item) => item.value);

    return (
        <footer className="border-t border-orange-400/20 bg-[#431407] text-orange-50">
            <section
                id="contact"
                aria-labelledby="contact-heading"
                className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 sm:py-11 lg:grid-cols-[0.85fr_1.4fr] lg:gap-14 lg:px-8"
            >
                <div className="flex flex-col items-start">
                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        Kontak & Layanan
                    </span>

                    <h2
                        id="contact-heading"
                        className="mt-3 max-w-md text-xl font-extrabold leading-snug text-white sm:text-2xl"
                    >
                        Butuh bantuan atau informasi data?
                    </h2>

                    <p className="mt-2 max-w-md text-xs leading-6 text-orange-100/70 sm:text-sm">
                        Hubungi {institution} atau kunjungi Pelayanan Statistik
                        Terpadu (PST) pada jam operasional kantor.
                    </p>

                    <a
                        href="#portal-hero"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 active:scale-95"
                    >
                        Kembali ke atas
                        <span aria-hidden="true">↑</span>
                    </a>
                </div>

                <address className="grid content-start gap-3 not-italic sm:grid-cols-2">
                    {contact.address && (
                        <div className="rounded-xl border border-orange-200/10 bg-white/[0.045] p-4 transition-colors duration-300 hover:bg-white/[0.075] sm:col-span-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-300">
                                Alamat Kantor
                            </h3>
                            <p className="mt-1.5 text-xs leading-5 text-orange-50/90 sm:text-sm">
                                {contact.address}
                            </p>

                            {contact.maps_url && (
                                <a
                                    href={contact.maps_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-300 transition-colors hover:text-orange-200"
                                >
                                    Buka petunjuk arah
                                    <span aria-hidden="true">↗</span>
                                </a>
                            )}
                        </div>
                    )}

                    {contact.hours && (
                        <div className="rounded-xl border border-orange-200/10 bg-white/[0.045] p-4 transition-colors duration-300 hover:bg-white/[0.075] sm:col-span-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-300">
                                Jam Pelayanan
                            </h3>
                            <p className="mt-1.5 text-xs leading-5 text-orange-50/90 sm:text-sm">
                                {contact.hours}
                            </p>
                        </div>
                    )}

                    {contactItems.map((item) => (
                        <div
                            key={item.title}
                            className="min-w-0 rounded-xl border border-orange-200/10 bg-white/[0.045] p-4 transition-colors duration-300 hover:bg-white/[0.075]"
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-300">
                                {item.title}
                            </h3>

                            {item.href ? (
                                <a
                                    href={item.href}
                                    className="mt-1.5 block break-all text-xs font-medium text-orange-50 transition-colors hover:text-orange-300 sm:text-sm"
                                >
                                    {item.value}
                                </a>
                            ) : (
                                <p className="mt-1.5 break-words text-xs text-orange-50/90 sm:text-sm">
                                    {item.value}
                                </p>
                            )}
                        </div>
                    ))}
                </address>
            </section>

            <div className="border-t border-orange-200/10 bg-black/10 px-4 py-4">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 text-center sm:flex-row sm:text-left">
                    <p className="text-[10px] text-orange-100/60 sm:text-xs">
                        © {year} {institution}. Seluruh hak cipta dilindungi.
                    </p>
                    <p className="text-[10px] font-medium tracking-wide text-orange-200/50">
                        PORTAL APLIKASI & LAYANAN
                    </p>
                </div>
            </div>
        </footer>
    );
}
