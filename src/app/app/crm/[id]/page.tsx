"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClient, updateClient, addFollowUp, deleteFollowUp, deleteClient, getSession } from '@/app/actions';
import { Utils } from '@/lib/utils';
import CurrencyInput from '@/components/CurrencyInput';

const followUpTypes = ['WHATSAPP', 'CALL', 'VISIT', 'MEETING', 'EMAIL'];
const followUpColors: Record<string, string> = {
    WHATSAPP: 'bg-success', CALL: 'bg-info', VISIT: 'bg-warning text-dark',
    MEETING: 'bg-dark', EMAIL: 'bg-secondary'
};
const statusColors: Record<string, string> = {
    NEW: 'text-bg-secondary', PROSPECT: 'text-bg-info', HOT: 'text-bg-danger',
    DEAL: 'text-bg-success', LOST: 'text-bg-dark'
};

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [client, setClient] = useState<any>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingNote, setSavingNote] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);

    async function load() {
        const [res, sess] = await Promise.all([getClient(id), getSession()]);
        setClient(res);
        setSession(sess);
        setLoading(false);
    }

    useEffect(() => { load(); }, [id]);

    const handleDelete = async () => {
        if (!confirm('Hapus klien ini beserta seluruh data follow-up?')) return;
        const res = await deleteClient(id);
        if (res.success) router.push('/app/crm');
        else alert(res.message);
    };

    const handleAddFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSavingNote(true);
        const fd = new FormData(e.currentTarget);
        const res = await addFollowUp(id, fd);
        setSavingNote(false);
        if (res.success) { (e.target as HTMLFormElement).reset(); load(); }
        else alert(res.message);
    };

    const handleDeleteFollowUp = async (fId: string) => {
        if (!confirm('Hapus follow-up ini?')) return;
        await deleteFollowUp(fId, id);
        load();
    };

    const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const res = await updateClient(id, fd);
        setSaving(false);
        if (res.success) { setShowEditModal(false); load(); }
        else alert(res.message);
    };

    if (loading) return <div className="p-4 text-secondary">Memuat data klien...</div>;
    if (!client) return (
        <div className="ap-card card border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="fw-semibold">Klien tidak ditemukan</div>
                <Link href="/app/crm" className="btn btn-dark rounded-4 mt-3">Kembali</Link>
            </div>
        </div>
    );

    const wa = String(client.whatsapp || '').replace(/\D/g, '');
    const waText = encodeURIComponent(`Halo ${client.name}, saya dari ${session?.agency?.name || 'Agency'} ingin follow up kebutuhan properti Anda.`);
    const waUrl = wa ? `https://wa.me/${wa}?text=${waText}` : null;

    const isEditable = session?.role === 'ADMIN' || session?.id === client.marketingId;

    return (
        <div className="d-grid gap-3">
            {/* Header */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-start gap-3">
                        <div className="btn btn-dark rounded-4 fw-semibold d-flex align-items-center justify-content-center"
                            style={{ width: '52px', height: '52px', flexShrink: 0 }}>
                            {(client.name || 'K').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <div className="fw-semibold fs-5 text-truncate">{client.name}</div>
                                <span className={`badge ${statusColors[client.status] || 'text-bg-secondary'} rounded-pill`}>
                                    {client.status}
                                </span>
                            </div>
                            <div className="small text-secondary mt-1">WA: {client.whatsapp || '-'}</div>
                            {client.email && <div className="small text-secondary">{client.email}</div>}
                            {session?.role === 'ADMIN' && (
                                <div className="small text-secondary">Marketing: <span className="text-primary fw-semibold">{client.marketing?.name}</span></div>
                            )}
                            {(client.minBudget || client.maxBudget) && (
                                <div className="small mt-1">
                                    Budget: {Utils.fmtIDR(client.minBudget)} – {Utils.fmtIDR(client.maxBudget)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-3 flex-wrap">
                        <Link href="/app/crm" className="btn btn-outline-secondary rounded-4 btn-sm">← Kembali</Link>
                        {waUrl && (
                            <a href={waUrl} target="_blank" rel="noopener" className="btn btn-success rounded-4 btn-sm">
                                <ion-icon name="logo-whatsapp"></ion-icon> WhatsApp
                            </a>
                        )}
                        {isEditable && (
                            <button onClick={() => setShowEditModal(true)} className="btn btn-outline-dark rounded-4 btn-sm">
                                <ion-icon name="create-outline"></ion-icon> Edit
                            </button>
                        )}
                        {isEditable && (
                            <button onClick={handleDelete} className="btn btn-outline-danger rounded-4 btn-sm ms-auto">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-3">
                {/* Follow-up Log */}
                <div className="col-12 col-md-7">
                    <div className="ap-card card border-0 shadow-sm h-100">
                        <div className="card-body p-3 p-md-4">
                            <div className="fw-semibold mb-3">📋 Riwayat Follow-up</div>

                            <div style={{ maxHeight: '340px', overflowY: 'auto' }} className="d-grid gap-2 mb-3">
                                {client.followUps?.length ? client.followUps.map((f: any) => (
                                    <div key={f.id} className="ap-card card border-0 bg-light">
                                        <div className="card-body py-2 px-3">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className={`badge ${followUpColors[f.type]} rounded-pill`} style={{ fontSize: '0.65rem' }}>
                                                    {f.type}
                                                </span>
                                                <span className="small text-secondary">{Utils.fmtDate(f.createdAt)}</span>
                                                {f.followUpDate && (
                                                    <span className="badge bg-warning text-dark rounded-pill ms-1" style={{ fontSize: '0.65rem' }}>
                                                        FU: {Utils.fmtDate(f.followUpDate)}
                                                    </span>
                                                )}
                                                {isEditable && (
                                                    <button onClick={() => handleDeleteFollowUp(f.id)}
                                                        className="btn btn-link text-danger p-0 ms-auto" style={{ fontSize: '0.8rem' }}>
                                                        <ion-icon name="trash-outline"></ion-icon>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="small">{f.content}</div>
                                        </div>
                                    </div>
                                )) : <div className="text-secondary small text-center py-4">Belum ada follow-up.</div>}
                            </div>

                            {isEditable && (
                                <form onSubmit={handleAddFollowUp} className="d-grid gap-2">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <select name="type" className="form-select rounded-4" required>
                                                {followUpTypes.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <input name="followUpDate" type="date" className="form-control rounded-4"
                                                placeholder="Tanggal FU berikutnya" />
                                        </div>
                                    </div>
                                    <textarea name="content" rows={2} required className="form-control rounded-4"
                                        placeholder="Hasil komunikasi / catatan..."></textarea>
                                    <button disabled={savingNote} className="btn btn-dark rounded-4">
                                        {savingNote ? 'Menyimpan...' : '+ Tambah Follow-up'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Deals & Info */}
                <div className="col-12 col-md-5">
                    <div className="d-grid gap-3">
                        {/* Info */}
                        <div className="ap-card card border-0 shadow-sm">
                            <div className="card-body p-3">
                                <div className="fw-semibold mb-2 small text-uppercase text-secondary">Info Pencarian</div>
                                <div className="d-grid gap-1 small">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary">Tipe Properti</span>
                                        <span>{client.propertyType || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary">Lokasi</span>
                                        <span className="text-end" style={{ maxWidth: '60%' }}>{client.locationPreference || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary">Budget Min</span>
                                        <span>{client.minBudget ? Utils.fmtIDR(client.minBudget) : '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary">Budget Max</span>
                                        <span>{client.maxBudget ? Utils.fmtIDR(client.maxBudget) : '-'}</span>
                                    </div>
                                </div>
                                {client.notes && (
                                    <div className="mt-2 pt-2 border-top">
                                        <div className="small text-secondary fw-semibold">Catatan</div>
                                        <div className="small mt-1">{client.notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Deals */}
                        <div className="ap-card card border-0 shadow-sm">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <div className="fw-semibold small text-uppercase text-secondary">Deal Terkait</div>
                                    <Link href="/app/deals" className="ms-auto btn btn-dark btn-sm rounded-4" style={{ fontSize: '0.7rem' }}>
                                        + Deal
                                    </Link>
                                </div>
                                {client.deals?.length ? (
                                    <div className="d-grid gap-2">
                                        {client.deals.map((d: any) => (
                                            <div key={d.id} className="ap-card card border-0 bg-light">
                                                <div className="card-body p-2">
                                                    <div className="d-flex align-items-start gap-2">
                                                        <div className="flex-grow-1 min-w-0">
                                                            <div className="small fw-semibold text-truncate">{d.property?.title}</div>
                                                            <div className="small text-secondary">{Utils.fmtIDR(d.dealPrice)}</div>
                                                        </div>
                                                        <span className={`badge rounded-pill ${d.status === 'COMPLETED' ? 'bg-success' : d.status === 'CANCELLED' ? 'bg-danger' : 'bg-warning text-dark'}`}
                                                            style={{ fontSize: '0.6rem', flexShrink: 0 }}>{d.status}</span>
                                                    </div>
                                                    <div className="mt-1">
                                                        <div className="progress" style={{ height: '3px' }}>
                                                            <div className="progress-bar bg-dark"
                                                                style={{ width: `${Math.min(100, Math.round((d.payments?.reduce((s: number, p: any) => s + p.amount, 0) / d.dealPrice) * 100))}%` }}>
                                                            </div>
                                                        </div>
                                                        <div className="small text-secondary mt-1" style={{ fontSize: '0.65rem' }}>
                                                            {d.payments?.length || 0} pembayaran
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-secondary small text-center py-3">Belum ada deal.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h6 className="modal-title fw-semibold">Edit Klien</h6>
                                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSaveEdit} className="d-grid gap-3" key={client.updatedAt}>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Nama</label>
                                            <input name="name" defaultValue={client.name} required className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">WhatsApp</label>
                                            <input name="whatsapp" defaultValue={client.whatsapp} required className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Email</label>
                                            <input name="email" type="email" defaultValue={client.email || ''} className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Status</label>
                                            <select name="status" defaultValue={client.status} className="form-select rounded-4">
                                                {['NEW', 'PROSPECT', 'HOT', 'DEAL', 'LOST'].map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Budget Min</label>
                                            <CurrencyInput name="minBudget" defaultValue={client.minBudget || ''} className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Budget Max</label>
                                            <CurrencyInput name="maxBudget" defaultValue={client.maxBudget || ''} className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Tipe Properti</label>
                                            <input name="propertyType" defaultValue={client.propertyType || ''} className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Lokasi Preferensi</label>
                                            <input name="locationPreference" defaultValue={client.locationPreference || ''} className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Catatan</label>
                                            <textarea name="notes" rows={2} defaultValue={client.notes || ''} className="form-control rounded-4"></textarea>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button disabled={saving} className="btn btn-dark rounded-4 flex-grow-1">
                                            {saving ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary rounded-4" onClick={() => setShowEditModal(false)}>Batal</button>
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
