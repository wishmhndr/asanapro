"use client";
import React, { useEffect, useState } from 'react';
import { Utils } from '@/lib/utils';
import Link from 'next/link';
import { getDashboardData } from '../../actions';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await getDashboardData();
            setData(res);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="text-secondary p-4">Loading stats...</div>;
    if (!data) return <div className="text-danger p-4">Gagal memuat data dashboard.</div>;

    const { stats, activities } = data;

    const kpi = (label: string, value: number, sub: string, tone: string) => {
        const cls = tone === 'emerald' ? 'ap-kpi ap-kpi-emerald' : tone === 'rose' ? 'ap-kpi ap-kpi-rose' : 'ap-kpi';
        return (
            <div className={`ap-card card border-0 shadow-sm ${cls}`}>
                <div className="card-body p-4">
                    <div className="small opacity-75">{label}</div>
                    <div className="display-6 fw-semibold mt-2">{value}</div>
                    <div className="small opacity-75">{sub || ''}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="d-grid gap-3">
            <div className="row g-3">
                <div className="col-12 col-md-4">{kpi('Properti Aktif', stats.activeCount, 'Available', 'emerald')}</div>
                <div className="col-12 col-md-4">{kpi('Properti Terjual', stats.soldCount, 'Sold', 'rose')}</div>
                <div className="col-12 col-md-4">{kpi('Total Klien', stats.clientCount, 'Total leads', 'slate')}</div>
            </div>

            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2">
                        <div className="fw-semibold">Aktivitas Terakhir</div>
                        <div className="ms-auto small text-secondary">Real-time data</div>
                    </div>
                    <div className="mt-3 d-grid gap-2">
                        {activities.length ? activities.map((a: any) => (
                            <div key={a.id} className="ap-card card border-0 bg-light">
                                <div className="card-body py-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="small fw-semibold">{a.text}</div>
                                        <div className="ms-auto small text-secondary">{Utils.fmtShort(a.at)}</div>
                                    </div>
                                </div>
                            </div>
                        )) : <div className="text-secondary">Belum ada aktivitas baru.</div>}
                    </div>
                </div>
            </div>

            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="fw-semibold">Shortcut</div>
                    <div className="row g-2 mt-2">
                        <div className="col-12 col-md-6"><Link href="/app/listing" className="btn btn-dark w-100 rounded-4">+ Kelola Properti</Link></div>
                        <div className="col-12 col-md-6"><Link href="/app/crm" className="btn btn-outline-secondary w-100 rounded-4">+ Kelola Klien</Link></div>
                    </div>
                </div>
            </div>

            <div className="d-lg-none position-fixed" style={{ right: '16px', bottom: '110px', zIndex: 1040 }}>
                <Link href="/app/listing" className="btn btn-dark btn-lg rounded-4 shadow">
                    <ion-icon className="ap-icon" name="add-outline"></ion-icon>
                </Link>
            </div>
        </div>
    );
}
