"use client";

import { useEffect } from 'react';

export function PWASessionManager() {
    useEffect(() => {
        // Check if running as PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        // Get backup session from cookie
        const getBackupSession = () => {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'session_backup') {
                    return value;
                }
            }
            return null;
        };

        // Set cookie from JavaScript
        const setBackupCookie = (token: string) => {
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1); // 1 year
            document.cookie = `session_backup=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
        };

        if (isPWA) {
            // Store PWA session indicator
            localStorage.setItem('pwa_session_active', 'true');
            localStorage.setItem('pwa_last_active', new Date().toISOString());

            // Sync backup session to localStorage
            const backupSession = getBackupSession();
            if (backupSession) {
                localStorage.setItem('pwa_session_token', backupSession);
            }
        }

        // Restore session from localStorage if cookie is missing (PWA scenario)
        const backupSession = getBackupSession();
        const storedToken = localStorage.getItem('pwa_session_token');

        if (!backupSession && storedToken && isPWA) {
            // Restore backup cookie from localStorage
            setBackupCookie(storedToken);
            console.log('PWA: Session restored from localStorage');

            // Reload to apply the restored session
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }

        // Cleanup old sessions (older than 365 days)
        const lastActive = localStorage.getItem('pwa_last_active');
        if (lastActive) {
            const daysSinceActive = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceActive > 365) {
                localStorage.removeItem('pwa_session_active');
                localStorage.removeItem('pwa_last_active');
                localStorage.removeItem('pwa_session_token');
            }
        }
    }, []);

    return null;
}
