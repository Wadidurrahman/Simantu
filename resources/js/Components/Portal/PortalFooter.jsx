export default function PortalFooter({ institution, year }) {
    return (
        <footer className="portal-footer">
            <div className="portal-container portal-footer-inner">
                <div>
                    <strong>{institution}</strong>
                    <p>Portal akses aplikasi dan layanan</p>
                </div>

                <p>© {year} {institution}</p>
            </div>
        </footer>
    );
}
