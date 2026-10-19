export default function PortalFooter({ institution, year, contact = {} }) {
    return (
        <footer className="bg-slate-950 text-slate-200">
            <section id="contact" aria-labelledby="contact-heading" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
                <div>
                    <p className="text-xs font-bold tracking-widest text-sky-300">MARI TERHUBUNG</p>
                    <h2 id="contact-heading" className="mt-3 max-w-md text-3xl font-bold leading-tight text-white sm:text-4xl">Butuh bantuan atau ingin berkunjung?</h2>
                    <p className="mt-5 max-w-md leading-7 text-slate-300">Hubungi {institution} untuk informasi pelayanan dan kebutuhan data Anda.</p>
                    <a href="#main-content" className="mt-8 inline-flex rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold hover:bg-white/10">Kembali ke atas <span aria-hidden="true" className="ml-3">↑</span></a>
                </div>

                <address className="grid content-start gap-6 not-italic sm:grid-cols-2">
                    {contact.address && (
                        <div className="sm:col-span-2">
                            <h3 className="font-semibold text-white">Alamat kantor</h3>
                            <p className="mt-2 leading-7 text-slate-300">{contact.address}</p>
                            {contact.maps_url && <a href={contact.maps_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block py-2 text-sm font-semibold text-sky-300 hover:underline">Petunjuk arah ↗<span className="sr-only"> (tab baru)</span></a>}
                        </div>
                    )}

                    {contact.hours && (
                        <div className="sm:col-span-2">
                            <h3 className="font-semibold text-white">Jam pelayanan</h3>
                            <p className="mt-2 text-slate-300">{contact.hours}</p>
                        </div>
                    )}

                    {contact.email && (
                        <div className="min-w-0">
                            <h3 className="font-semibold text-white">Email</h3>
                            <a href={`mailto:${contact.email}`} className="mt-2 inline-block break-all py-2 text-sky-300 hover:underline">{contact.email}</a>
                        </div>
                    )}

                    {contact.phone && (
                        <div>
                            <h3 className="font-semibold text-white">Telepon</h3>
                            {contact.phone_href
                                ? <a href={contact.phone_href} className="mt-2 inline-block py-2 text-sky-300 hover:underline">{contact.phone}</a>
                                : <p className="mt-2">{contact.phone}</p>}
                        </div>
                    )}
                </address>
            </section>

            <div className="border-t border-white/10 px-4 py-6 text-center text-xs leading-6 text-slate-400">© {year} {institution}. Seluruh hak cipta dilindungi.</div>
        </footer>
    );
}
