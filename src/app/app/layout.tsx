"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getMe, logoutAgent } from '../actions';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Cleanup modal backdrops and reset body styles on navigation
        const cleanupModal = () => {
            const backdrops = document.getElementsByClassName('modal-backdrop');
            while (backdrops.length > 0) {
                backdrops[0].parentNode?.removeChild(backdrops[0]);
            }
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
        cleanupModal();
    }, [pathname]);

    useEffect(() => {
        setMounted(true);
        async function check() {
            const u = await getMe();
            if (!u) {
                router.push('/');
                return;
            }
            setUser(u);
        }
        check();
    }, [router]);

    if (!mounted || !user) return <div className="p-4 text-center text-secondary">Loading...</div>;

    const handleLogout = async () => {
        await logoutAgent();
    };

    const navItem = (path: string, label: string, iconName: string) => {
        const isActive = pathname.startsWith(path);
        return (
            <Link className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} href={path}>
                <ion-icon className="ap-icon" name={iconName}></ion-icon>
                <span className="fw-semibold">{label}</span>
            </Link>
        );
    };

    const bottomItem = (path: string, label: string, iconName: string) => {
        const isActive = pathname.startsWith(path);
        return (
            <Link className={`nav-link text-center ${isActive ? 'text-dark fw-semibold' : 'text-secondary'}`} href={path}>
                <div className="d-flex justify-content-center"><ion-icon className="ap-icon" name={iconName}></ion-icon></div>
                <div>{label}</div>
            </Link>
        );
    };

    return (
        <div className="min-vh-100">
            <header className="ap-nav ap-soft border-bottom">
                <div className="container py-2 py-md-3 d-flex align-items-center gap-2 gap-md-3">
                    <Link href="/app/dashboard">
                        <img src="/logo.jpg" alt="Logo" width="40" height="40" className="rounded-3 d-md-none" />
                        <img src="/logo.jpg" alt="Logo" width="45" height="45" className="rounded-3 d-none d-md-block" />
                    </Link>
                    <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>AsanaPro</div>
                        <div className="small text-secondary text-truncate" style={{ fontSize: '0.75rem' }}>{user.agency || 'Agensi Properti'}</div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm rounded-4" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>Logout</button>
                </div>
            </header>

            <div className="container py-3 py-md-4 pb-5 mb-5 mb-lg-0">
                <div className="row g-3 g-md-4">
                    <aside className="d-none d-lg-block col-lg-3">
                        <div className="ap-card card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="small text-secondary">Signed in as</div>
                                <div className="fw-semibold text-truncate">{user.name}</div>
                            </div>
                            <div className="list-group list-group-flush">
                                {navItem('/app/dashboard', 'Dashboard', 'home-outline')}
                                {navItem('/app/listing', 'Inventory', 'pricetags-outline')}
                                {navItem('/app/crm', 'CRM', 'people-outline')}
                                {navItem('/app/reports', 'Laporan', 'stats-chart-outline')}
                                {navItem('/app/settings', 'Pengaturan', 'settings-outline')}
                            </div>
                        </div>
                    </aside>

                    <main className="col-12 col-lg-9 ap-main">
                        {children}
                    </main>
                </div>
            </div>

            <nav className="ap-bottom-nav d-lg-none fixed-bottom border-top bg-white z-3">
                <div className="container px-0">
                    <div className="nav nav-pills nav-justified py-1">
                        {bottomItem('/app/dashboard', 'Dashboard', 'home-outline')}
                        {bottomItem('/app/listing', 'Listing', 'pricetags-outline')}
                        {bottomItem('/app/crm', 'CRM', 'people-outline')}
                        {bottomItem('/app/reports', 'Report', 'stats-chart-outline')}
                        {bottomItem('/app/settings', 'Setting', 'settings-outline')}
                    </div>
                </div>
            </nav>
        </div>
    );
}
