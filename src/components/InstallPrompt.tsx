'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if device is iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Check if already in standalone mode
        const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isInStandalone);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback for when prompt is not ready (e.g. Desktop manual install, or iOS)
            alert("Untuk menginstal: \n\n1. PC/Laptop: Klik ikon 'Install' di address bar browser (pojok kanan atas).\n2. iOS (iPhone/iPad): Tap tombol Share > 'Add to Home Screen'.\n3. Android: Tap menu chrome (titik tiga) > 'Install App'.");
        }
    };

    if (isStandalone) return null;

    return (
        <div className="ap-card card border-0 shadow-sm mt-4 bg-primary bg-opacity-10">
            <div className="card-body p-3 text-center">
                <div className="fw-semibold text-primary mb-1">Pasang Aplikasi</div>
                <p className="small text-secondary mb-3">
                    Instal AsanaPro di perangkat Anda untuk akses lebih cepat dan penggunaan tanpa browser.
                </p>

                <button
                    onClick={handleInstallClick}
                    className="btn btn-primary w-100 rounded-pill py-2 shadow-sm fw-semibold"
                >
                    <div className="d-flex align-items-center justify-content-center gap-2">
                        <ion-icon name="download-outline" style={{ fontSize: '1.2rem' }}></ion-icon>
                        <span>Install Sekarang</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
