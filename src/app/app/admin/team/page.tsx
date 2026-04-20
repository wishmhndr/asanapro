"use client";
import React, { useEffect, useState } from 'react';
import { getTeamMembers, createMarketingUser, deleteMarketingUser } from '../../../actions';
import { Utils } from '@/lib/utils';

export default function AdminTeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    async function load() {
        const res = await getTeamMembers();
        setMembers(res);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const res = await createMarketingUser(fd);
        setSaving(false);
        if (res.success) { setShowModal(false); (e.target as HTMLFormElement).reset(); load(); }
        else alert(res.message);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus akun marketing "${name}"? Seluruh data klien dan deal akan ikut terhapus.`)) return;
        const res = await deleteMarketingUser(id);
        if (!res.success) alert(res.message);
        else load();
    };

    if (loading) return <div className="p-4 text-secondary">Memuat data tim...</div>;

    return (
        <div className="d-grid gap-3 px-0">
            {/* Header */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2">
                        <div>
                            <div className="fw-semibold">Tim Marketing</div>
                            <div className="small text-secondary">{members.length} anggota marketing aktif</div>
                        </div>
                        <button className="btn btn-dark rounded-4 btn-sm ms-auto" onClick={() => setShowModal(true)}>
                            + Tambah Marketing
                        </button>
                    </div>
                </div>
            </div>

            {/* Member list */}
            <div className="d-grid gap-3">
                {members.length === 0 ? (
                    <div className="ap-card card border-0 shadow-sm">
                        <div className="card-body p-4 text-secondary text-center">
                            Belum ada anggota marketing. Klik "Tambah Marketing" untuk menambahkan.
                        </div>
                    </div>
                ) : members.map((m: any) => (
                    <div key={m.id} className="ap-card card border-0 shadow-sm">
                        <div className="card-body p-3 p-md-4">
                            <div className="d-flex align-items-start gap-3">
                                <div className="btn btn-dark rounded-4 fw-semibold d-flex align-items-center justify-content-center"
                                    style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                                    {m.name.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                    <div className="fw-semibold">{m.name}</div>
                                    <div className="small text-secondary">{m.email}</div>
                                    {m.phoneNumber && <div className="small text-secondary">WA: {m.phoneNumber}</div>}
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
                                            {m._count?.clients || 0} klien
                                        </span>
                                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill" style={{ fontSize: '0.7rem' }}>
                                            {m._count?.deals || 0} deal
                                        </span>
                                        <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.7rem' }}>
                                            Bergabung {Utils.fmtDate(m.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(m.id, m.name)}
                                    className="btn btn-outline-danger btn-sm rounded-4" style={{ flexShrink: 0 }}>
                                    <ion-icon name="trash-outline"></ion-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Tambah Marketing */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h6 className="modal-title fw-semibold">Tambah Anggota Marketing</h6>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreate} className="d-grid gap-3">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Nama Lengkap <span className="text-danger">*</span></label>
                                            <input name="name" required className="form-control rounded-4" placeholder="Nama marketing" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Email <span className="text-danger">*</span></label>
                                            <input name="email" type="email" required className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">WhatsApp</label>
                                            <input name="phone" className="form-control rounded-4" placeholder="628..." />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">PIN / Password <span className="text-danger">*</span></label>
                                            <input name="pin" type="password" minLength={6} required className="form-control rounded-4" placeholder="min 6 karakter" />
                                        </div>
                                    </div>
                                    <div className="alert alert-info rounded-4 py-2 small mb-0">
                                        Akun langsung aktif. Bagikan email & PIN kepada tim marketing.
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button disabled={saving} className="btn btn-dark rounded-4 flex-grow-1">
                                            {saving ? 'Membuat...' : 'Buat Akun Marketing'}
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
