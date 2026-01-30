/// <reference path="../../../ionic.d.ts" />
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClients, createClient } from '../../actions';
import { Utils } from '@/lib/utils';

export default function CrmPage() {
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [prospect, setProspect] = useState('All');

    async function load() {
        const res = await getClients();
        setItems(res);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const badgeCls = (p: string) => ({
        Cold: 'text-bg-secondary',
        Warm: 'text-bg-warning',
        Hot: 'text-bg-danger'
    }[p] || 'text-bg-secondary');

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await createClient(fd);

        if (res.success) {
            const closeBtn = document.getElementById('close-crm-modal');
            if (closeBtn) closeBtn.click();
            load();
        } else {
            alert(res.message);
        }
    };

    let filtered = items;
    if (prospect !== 'All') filtered = filtered.filter((c: any) => c.status === prospect);
    if (q.trim()) {
        const t = q.trim().toLowerCase();
        filtered = filtered.filter((c: any) => (c.name || '').toLowerCase().includes(t) || (c.whatsapp || '').includes(t));
    }

    if (loading) return <div className="p-4 text-secondary">Memuat data klien...</div>;

    return (
        <>
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="fw-semibold">CRM</div>
                        <div className="ms-auto">
                            <button
                                className="btn btn-dark rounded-4 d-flex align-items-center gap-1"
                                data-bs-toggle="modal"
                                data-bs-target="#newClientModal"
                            >
                                <ion-icon className="ap-icon" name="add-outline"></ion-icon> <span>Klien</span>
                            </button>
                        </div>
                    </div>

                    <div className="row g-2 mt-3">
                        <div className="col-12 col-md-7">
                            <input value={q} onChange={e => setQ(e.target.value)} className="form-control form-control-lg rounded-4" placeholder="Cari nama atau WA..." />
                        </div>
                        <div className="col-12 col-md-5 d-flex gap-2">
                            <select value={prospect} onChange={e => setProspect(e.target.value)} className="form-select form-select-lg rounded-4">
                                {['All', 'Cold', 'Warm', 'Hot'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button onClick={() => { setQ(''); setProspect('All'); }} className="btn btn-outline-secondary rounded-4">Reset</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-grid gap-2 mt-3">
                {filtered.length ? filtered.map((c: any) => (
                    <Link key={c.id} href={`/app/crm/${c.id}`} className="text-decoration-none">
                        <div className="ap-card card border-0 shadow-sm">
                            <div className="card-body d-flex align-items-center gap-3 p-3">
                                <div className="btn btn-dark rounded-4 fw-semibold" style={{ width: '44px', height: '44px', display: 'grid', placeItems: 'center' }}>
                                    {(c.name || 'K').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                    <div className="fw-semibold text-truncate">{c.name}</div>
                                    <div className="small text-secondary text-truncate">WA: {c.whatsapp || '-'} • Created: {Utils.fmtShort(c.createdAt)}</div>
                                </div>
                                <span className={`badge ${badgeCls(c.status)} ap-pill`}>{c.status}</span>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="ap-card card border-0 shadow-sm">
                        <div className="card-body p-4 text-secondary">Belum ada klien di database.</div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <div className="modal fade" id="newClientModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header">
                            <h6 className="modal-title">Tambah Klien Baru</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close-crm-modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreate} className="d-grid gap-3">
                                <div>
                                    <label className="form-label small fw-semibold">Nama Klien</label>
                                    <input name="name" required className="form-control form-control-lg rounded-4" placeholder="Contoh: Budi Santoso" />
                                </div>
                                <div>
                                    <label className="form-label small fw-semibold">WhatsApp</label>
                                    <input name="whatsapp" required className="form-control form-control-lg rounded-4" placeholder="62812..." />
                                </div>
                                <div>
                                    <label className="form-label small fw-semibold">Prospect</label>
                                    <select name="prospect" className="form-select form-select-lg rounded-4">
                                        <option>Cold</option><option>Warm</option><option>Hot</option>
                                    </select>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-dark rounded-4">Simpan Klien</button>
                                    <button type="button" className="btn btn-outline-secondary rounded-4" data-bs-dismiss="modal">Batal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
