"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardData } from '../../actions';
import { Utils } from '@/lib/utils';

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardData().then(res => { setData(res); setLoading(false); });
    }, []);

    if (loading) return <div className="p-4 text-secondary">Memuat dashboard...</div>;
    if (!data) return <div className="p-4 text-danger">Gagal memuat data dashboard.</div>;

    if (data.role === 'ADMIN') return <AdminDashboard data={data} />;
    return <MarketingDashboard data={data} />;
}

function kpi(label: string, value: any, sub: string, tone: string) {
    const cls = tone === 'emerald' ? 'ap-kpi ap-kpi-emerald' : tone === 'rose' ? 'ap-kpi ap-kpi-rose' : 'ap-kpi';
    return (
        <div className={`ap-card card border-0 shadow-sm ${cls}`}>
            <div className="card-body p-3 p-md-4">
                <div className="small opacity-75">{label}</div>
                <div className="display-6 fw-semibold mt-1">{value}</div>
                <div className="small opacity-75">{sub}</div>
            </div>
        </div>
    );
}

function AdminDashboard({ data }: { data: any }) {
    const { stats, finance, leaderboard, recentDeals } = data;
    return (
        <div className="d-grid gap-3 px-0">
            {/* KPI Row */}
            <div className="row g-2 g-md-3">
                <div className="col-6 col-md-3">{kpi('Properti Aktif', stats.availableProperties, 'Available', 'emerald')}</div>
                <div className="col-6 col-md-3">{kpi('Terjual', stats.soldProperties, 'Sold', 'rose')}</div>
                <div className="col-6 col-md-3">{kpi('Disewa', stats.rentedProperties, 'Rented', 'slate')}</div>
                <div className="col-6 col-md-3">{kpi('Total Klien', stats.totalClients, 'Semua marketing', 'slate')}</div>
            </div>

            {/* Finance Summary */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="fw-semibold mb-3">Ringkasan Keuangan Agency</div>
                    <div className="row g-2 g-md-3">
                        <div className="col-12 col-md-4">
                            <div className="ap-card card border-0 bg-success bg-opacity-10 h-100">
                                <div className="card-body p-3">
                                    <div className="small text-success fw-semibold">Total Revenue / Pembayaran Masuk</div>
                                    <div className="fw-bold fs-5 mt-1">{Utils.fmtIDR(finance.totalPaid)}</div>
                                    <div className="small text-secondary">Dari seluruh transaksi pembayaran</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="ap-card card border-0 bg-danger bg-opacity-10 h-100">
                                <div className="card-body p-3">
                                    <div className="small text-danger fw-semibold">Total Pengeluaran</div>
                                    <div className="fw-bold fs-5 mt-1">{Utils.fmtIDR(finance.totalExpenses)}</div>
                                    <div className="small text-secondary">Biaya operasional</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className={`ap-card card border-0 h-100 ${finance.netProfit >= 0 ? 'bg-dark text-white' : 'bg-warning bg-opacity-10'}`}>
                                <div className="card-body p-3">
                                    <div className={`small fw-semibold ${finance.netProfit >= 0 ? 'opacity-75' : 'text-warning'}`}>Net Profit</div>
                                    <div className="fw-bold fs-5 mt-1">{Utils.fmtIDR(finance.netProfit)}</div>
                                    <div className={`small ${finance.netProfit >= 0 ? 'opacity-75' : 'text-warning'}`}>Revenue - Pengeluaran</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="fw-semibold mb-3">🏆 Leaderboard Marketing</div>
                    {leaderboard.length === 0 ? (
                        <div className="text-secondary small">Belum ada deal completed.</div>
                    ) : (
                        <div className="d-grid gap-2">
                            {leaderboard.map((m: any, i: number) => (
                                <div key={m.name} className="ap-card card border-0 bg-light">
                                    <div className="card-body py-2 px-3 d-flex align-items-center gap-3">
                                        <div className="fw-bold text-secondary" style={{ width: '24px' }}>#{i + 1}</div>
                                        <div className="btn btn-dark rounded-4 fw-semibold d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                            {m.name.slice(0, 1).toUpperCase()}
                                        </div>
                                        <div className="flex-grow-1 min-w-0">
                                            <div className="fw-semibold text-truncate">{m.name}</div>
                                            <div className="small text-secondary">{m.deals} deal closed</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-semibold small">{Utils.fmtIDR(m.revenue)}</div>
                                            <div className="small text-secondary">revenue</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Deals */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="fw-semibold">Deal Terbaru</div>
                        <Link href="/app/deals" className="ms-auto btn btn-outline-secondary btn-sm rounded-4">Lihat Semua</Link>
                    </div>
                    {recentDeals.length === 0 ? (
                        <div className="text-secondary small">Belum ada deal.</div>
                    ) : (
                        <div className="d-grid gap-2">
                            {recentDeals.map((d: any) => {
                                const totalPaid = d.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
                                const pct = d.dealPrice > 0 ? Math.min(100, Math.round((totalPaid / d.dealPrice) * 100)) : 0;
                                return (
                                    <div key={d.id} className="ap-card card border-0 bg-light">
                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-start gap-2">
                                                <div className="flex-grow-1 min-w-0">
                                                    <div className="fw-semibold text-truncate small">{d.property?.title}</div>
                                                    <div className="small text-secondary text-truncate">{d.client?.name} · via {d.marketing?.name}</div>
                                                    <div className="small mt-1">{Utils.fmtIDR(d.dealPrice)}</div>
                                                </div>
                                                <span className={`badge rounded-pill ${d.status === 'COMPLETED' ? 'bg-success' : d.status === 'CANCELLED' ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ flexShrink: 0, fontSize: '0.65rem' }}>
                                                    {d.status}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <div className="progress" style={{ height: '4px' }}>
                                                    <div className="progress-bar bg-dark" style={{ width: `${pct}%` }}></div>
                                                </div>
                                                <div className="small text-secondary mt-1">Pembayaran: {pct}%</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Shortcuts */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="fw-semibold mb-3">Aksi Cepat</div>
                    <div className="row g-2">
                        <div className="col-6 col-md-3"><Link href="/app/listing" className="btn btn-dark w-100 rounded-4 small">+ Properti</Link></div>
                        <div className="col-6 col-md-3"><Link href="/app/crm" className="btn btn-outline-secondary w-100 rounded-4 small">+ Klien</Link></div>
                        <div className="col-6 col-md-3"><Link href="/app/admin/finance" className="btn btn-outline-secondary w-100 rounded-4 small">Keuangan</Link></div>
                        <div className="col-6 col-md-3"><Link href="/app/admin/team" className="btn btn-outline-secondary w-100 rounded-4 small">Tim</Link></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MarketingDashboard({ data }: { data: any }) {
    const { stats, finance, upcomingFollowUps } = data;
    return (
        <div className="d-grid gap-3 px-0">
            <div className="row g-2 g-md-3">
                <div className="col-6 col-md-3">{kpi('Total Klien', stats.myClients, 'Klien saya', 'slate')}</div>
                <div className="col-6 col-md-3">{kpi('Hot Prospect', stats.hotClients, 'Siap closing', 'rose')}</div>
                <div className="col-6 col-md-3">{kpi('Deal Saya', stats.myDeals, 'Total deal', 'slate')}</div>
                <div className="col-6 col-md-3">{kpi('Completed', stats.completedDeals, 'Sukses', 'emerald')}</div>
            </div>

            {/* Komisi */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="small text-secondary">Total Pembayaran Masuk (Revenue)</div>
                    <div className="fw-bold fs-4 mt-1">{Utils.fmtIDR(finance.totalPaid)}</div>
                </div>
            </div>

            {/* Upcoming Follow-ups */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="fw-semibold">📅 Jadwal Follow-up</div>
                        <Link href="/app/crm" className="ms-auto btn btn-outline-secondary btn-sm rounded-4">CRM</Link>
                    </div>
                    {upcomingFollowUps.length === 0 ? (
                        <div className="text-secondary small">Tidak ada jadwal follow-up.</div>
                    ) : (
                        <div className="d-grid gap-2">
                            {upcomingFollowUps.map((f: any) => (
                                <Link key={f.id} href={`/app/crm/${f.client.id}`} className="text-decoration-none">
                                    <div className="ap-card card border-0 bg-light">
                                        <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
                                            <ion-icon name="alarm-outline" className="ap-icon text-warning"></ion-icon>
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="small fw-semibold text-truncate">{f.client.name}</div>
                                                <div className="small text-secondary text-truncate">{f.content}</div>
                                            </div>
                                            <div className="small text-secondary" style={{ flexShrink: 0 }}>{Utils.fmtDate(f.followUpDate)}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Shortcuts */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="fw-semibold mb-3">Aksi Cepat</div>
                    <div className="row g-2">
                        <div className="col-6"><Link href="/app/crm" className="btn btn-dark w-100 rounded-4">+ Klien Baru</Link></div>
                        <div className="col-6"><Link href="/app/deals" className="btn btn-outline-secondary w-100 rounded-4">+ Deal Baru</Link></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
