"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClients, createClient, getSession } from '../../actions';
import { Utils } from '@/lib/utils';

export default function CrmPage() {
    const [items, setItems] = useState<any[]>([]);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    async function load() {
        const [clients, sess] = await Promise.all([getClients(), getSession()]);
        setItems(clients);
        setSession(sess);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const statusColors: Record<string, string> = {
        NEW: 'text-bg-secondary',
        PROSPECT: 'text-bg-info',
        HOT: 'text-bg-danger',
        DEAL: 'text-bg-success',
        LOST: 'text-bg-dark',
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const res = await createClient(fd);
        setSaving(false);
        if (res.success) {
            setShowModal(false);
            (e.target as HTMLFormElement).reset();
            load();
        } else {
            alert(res.message);
        }
    };

    let filtered = items;
    if (statusFilter !== 'All') filtered = filtered.filter((c: any) => c.status === statusFilter);
    if (q.trim()) {
        const t = q.trim().toLowerCase();
        filtered = filtered.filter((c: any) =>
            (c.name || '').toLowerCase().includes(t) ||
            (c.whatsapp || '').includes(t) ||
            (c.marketing?.name || '').toLowerCase().includes(t)
        );
    }

    if (loading) return <div className="p-4 text-secondary">Memuat data klien...</div>;

    return (
        <div className="px-0">
            {/* Header Card */}
            <div className="ap-card card border-0 shadow-sm mb-3">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div>
                            <div className="fw-semibold">CRM Klien</div>
                            {session?.role === 'ADMIN' && (
                                <div className="small text-secondary">Semua klien dari semua marketing</div>
                            )}
                        </div>
                        <div className="ms-auto">
                            <button className="btn btn-dark rounded-4 d-flex align-items-center gap-1"
                                onClick={() => setShowModal(true)}>
                                <ion-icon className="ap-icon" name="add-outline"></ion-icon>
                                <span>Tambah Klien</span>
                            </button>
                        </div>
                    </div>

                    <div className="row g-2 mt-3">
                        <div className="col-12 col-md-7">
                            <input value={q} onChange={e => setQ(e.target.value)}
                                className="form-control rounded-4" placeholder="Cari nama, WA, atau marketing..." />
                        </div>
                        <div className="col-8 col-md-4">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                className="form-select rounded-4">
                                {['All', 'NEW', 'PROSPECT', 'HOT', 'DEAL', 'LOST'].map(s => (
                                    <option key={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-4 col-md-1">
                            <button onClick={() => { setQ(''); setStatusFilter('All'); }}
                                className="btn btn-outline-secondary rounded-4 w-100">↺</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat badges */}
            <div className="d-flex gap-2 flex-wrap mb-3">
                {['NEW', 'PROSPECT', 'HOT', 'DEAL', 'LOST'].map(s => {
                    const count = items.filter((c: any) => c.status === s).length;
                    return (
                        <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                            className={`btn btn-sm rounded-4 ${statusFilter === s ? 'btn-dark' : 'btn-outline-secondary'}`}
                            style={{ fontSize: '0.75rem' }}>
                            {s} <span className="badge bg-white text-dark ms-1">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Client list */}
            <div className="d-grid gap-2">
                {filtered.length ? filtered.map((c: any) => (
                    <Link key={c.id} href={`/app/crm/${c.id}`} className="text-decoration-none">
                        <div className="ap-card card border-0 shadow-sm">
                            <div className="card-body d-flex align-items-center gap-3 p-3">
                                <div className="btn btn-dark rounded-4 fw-semibold d-flex align-items-center justify-content-center"
                                    style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                                    {(c.name || 'K').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                    <div className="fw-semibold text-truncate text-dark">{c.name}</div>
                                    <div className="small text-secondary text-truncate">
                                        WA: {c.whatsapp || '-'}
                                        {session?.role === 'ADMIN' && c.marketing?.name && (
                                            <> · <span className="text-primary">{c.marketing.name}</span></>
                                        )}
                                    </div>
                                    {(c._count?.followUps > 0 || c._count?.deals > 0) && (
                                        <div className="d-flex gap-2 mt-1">
                                            {c._count?.followUps > 0 && (
                                                <span className="badge bg-light text-secondary rounded-pill" style={{ fontSize: '0.65rem' }}>
                                                    {c._count.followUps} follow-up
                                                </span>
                                            )}
                                            {c._count?.deals > 0 && (
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill" style={{ fontSize: '0.65rem' }}>
                                                    {c._count.deals} deal
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="text-end" style={{ flexShrink: 0 }}>
                                    <span className={`badge ${statusColors[c.status] || 'text-bg-secondary'} rounded-pill`}
                                        style={{ fontSize: '0.7rem' }}>{c.status}</span>
                                    <div className="small text-secondary mt-1" style={{ fontSize: '0.65rem' }}>{Utils.fmtShort(c.createdAt)}</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="ap-card card border-0 shadow-sm">
                        <div className="card-body p-4 text-secondary text-center">
                            {q || statusFilter !== 'All' ? 'Tidak ada klien yang cocok dengan filter.' : 'Belum ada klien. Tambah klien pertama Anda!'}
                        </div>
                    </div>
                )}
            </div>

            {/* FAB Mobile */}
            <div className="d-lg-none position-fixed" style={{ right: '16px', bottom: '90px', zIndex: 1040 }}>
                <button onClick={() => setShowModal(true)} className="btn btn-dark btn-lg rounded-4 shadow">
                    <ion-icon className="ap-icon" name="add-outline"></ion-icon>
                </button>
            </div>

            {/* Modal Tambah Klien */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h6 className="modal-title fw-semibold">Tambah Klien Baru</h6>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreate} className="d-grid gap-3">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Nama Klien <span className="text-danger">*</span></label>
                                            <input name="name" required className="form-control rounded-4" placeholder="Budi Santoso" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">WhatsApp <span className="text-danger">*</span></label>
                                            <input name="whatsapp" required className="form-control rounded-4" placeholder="62812..." />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Email</label>
                                            <input name="email" type="email" className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Status</label>
                                            <select name="status" className="form-select rounded-4">
                                                <option value="NEW">New</option>
                                                <option value="PROSPECT">Prospect</option>
                                                <option value="HOT">Hot</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Budget Min (Rp)</label>
                                            <input name="minBudget" type="number" className="form-control rounded-4" placeholder="500000000" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Budget Max (Rp)</label>
                                            <input name="maxBudget" type="number" className="form-control rounded-4" placeholder="1000000000" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Tipe Properti Dicari</label>
                                            <input name="propertyType" className="form-control rounded-4" placeholder="House, Apartment..." />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Lokasi Preferensi</label>
                                            <input name="locationPreference" className="form-control rounded-4" placeholder="Jakarta Selatan..." />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Catatan</label>
                                            <textarea name="notes" rows={2} className="form-control rounded-4" placeholder="Catatan tambahan..."></textarea>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button disabled={saving} className="btn btn-dark rounded-4 flex-grow-1">
                                            {saving ? 'Menyimpan...' : 'Simpan Klien'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary rounded-4" onClick={() => setShowModal(false)}>Batal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
