"use client";

import { useEffect } from 'react';

export function PWASessionManager() {
    useEffect(() => {
        // Check if running as PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (isPWA) {
            // Store PWA session indicator
            localStorage.setItem('pwa_session_active', 'true');
            localStorage.setItem('pwa_last_active', new Date().toISOString());
        }

        // Cleanup old sessions (older than 365 days)
        const lastActive = localStorage.getItem('pwa_last_active');
        if (lastActive) {
            const daysSinceActive = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceActive > 365) {
                localStorage.removeItem('pwa_session_active');
                localStorage.removeItem('pwa_last_active');
            }
        }
    }, []);

    return null;
}
