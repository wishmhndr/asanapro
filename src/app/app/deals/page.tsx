"use client";
import React, { useEffect, useState } from 'react';
import { getDeals, createDeal, addPayment, deletePayment, updateDealStatus, deleteDeal, getProperties, getClients, getSession } from '../../actions';
import { Utils } from '@/lib/utils';

export default function DealsPage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showDealModal, setShowDealModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<any>(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    async function load() {
        const [d, p, c, s] = await Promise.all([getDeals(), getProperties(), getClients(), getSession()]);
        setDeals(d);
        setProperties(p);
        setClients(c);
        setSession(s);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const handleCreateDeal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const res = await createDeal(fd);
        setSaving(false);
        if (res.success) { setShowDealModal(false); (e.target as HTMLFormElement).reset(); load(); }
        else alert(res.message);
    };

    const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        fd.append('dealId', selectedDeal.id);
        const res = await addPayment(fd);
        setSaving(false);
        if (res.success) { setShowPayModal(false); (e.target as HTMLFormElement).reset(); load(); }
        else alert(res.message);
    };

    const handleDeletePay = async (payId: string, dealId: string) => {
        if (!confirm('Hapus pembayaran ini?')) return;
        await deletePayment(payId, dealId);
        load();
    };

    const handleDeleteDeal = async (id: string) => {
        if (!confirm('Hapus deal ini? Semua pembayaran juga akan dihapus.')) return;
        await deleteDeal(id);
        load();
    };

    let filtered = deals;
    if (statusFilter !== 'All') filtered = filtered.filter((d: any) => d.status === statusFilter);

    const statusColors: Record<string, string> = {
        IN_PROGRESS: 'bg-warning text-dark', COMPLETED: 'bg-success', CANCELLED: 'bg-danger'
    };

    if (loading) return <div className="p-4 text-secondary">Memuat data deal...</div>;

    return (
        <div className="px-0 d-grid gap-3">
            {/* Header */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div>
                            <div className="fw-semibold">Deal & Pembayaran</div>
                            <div className="small text-secondary">Kelola transaksi dan riwayat pembayaran</div>
                        </div>
                        <div className="ms-auto">
                            <button className="btn btn-dark rounded-4 d-flex align-items-center gap-1"
                                onClick={() => setShowDealModal(true)}>
                                <ion-icon className="ap-icon" name="add-outline"></ion-icon>
                                <span>Deal Baru</span>
                            </button>
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-3 flex-wrap">
                        {['All', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`btn btn-sm rounded-4 ${statusFilter === s ? 'btn-dark' : 'btn-outline-secondary'}`}
                                style={{ fontSize: '0.75rem' }}>
                                {s === 'All' ? 'Semua' : s.replace('_', ' ')}
                                <span className="badge bg-white text-dark ms-1">
                                    {s === 'All' ? deals.length : deals.filter((d: any) => d.status === s).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deal list */}
            <div className="d-grid gap-3">
                {filtered.length ? filtered.map((deal: any) => {
                    const totalPaid = deal.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
                    const pct = deal.dealPrice > 0 ? Math.min(100, Math.round((totalPaid / deal.dealPrice) * 100)) : 0;
                    return (
                        <div key={deal.id} className="ap-card card border-0 shadow-sm">
                            <div className="card-body p-3 p-md-4">
                                <div className="d-flex align-items-start gap-3 flex-wrap">
                                    <div className="flex-grow-1 min-w-0">
                                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                            <span className={`badge rounded-pill ${deal.dealType === 'SALE' ? 'bg-dark' : 'bg-info'}`}
                                                style={{ fontSize: '0.65rem' }}>{deal.dealType}</span>
                                            <span className={`badge rounded-pill ${statusColors[deal.status]}`}
                                                style={{ fontSize: '0.65rem' }}>{deal.status.replace('_', ' ')}</span>
                                        </div>
                                        <div className="fw-semibold text-truncate">{deal.property?.title}</div>
                                        <div className="small text-secondary">
                                            Klien: {deal.client?.name}
                                            {session?.role === 'ADMIN' && <> · Marketing: <span className="text-primary">{deal.marketing?.name}</span></>}
                                        </div>
                                        {deal.dealType === 'RENT' && deal.rentStartDate && (
                                            <div className="small text-secondary">
                                                Sewa: {Utils.fmtDate(deal.rentStartDate)} – {Utils.fmtDate(deal.rentEndDate)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-end" style={{ flexShrink: 0 }}>
                                        <div className="small text-secondary fw-semibold">Harga Deal</div>
                                        <div className="fw-bold fs-5">{Utils.fmtIDR(deal.dealPrice)}</div>
                                    </div>
                                </div>

                                {/* Payment Progress */}
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="small text-secondary">Pembayaran</span>
                                        <span className="small fw-semibold">{Utils.fmtIDR(totalPaid)} / {Utils.fmtIDR(deal.dealPrice)} ({pct}%)</span>
                                    </div>
                                    <div className="progress mb-2" style={{ height: '6px', borderRadius: '3px' }}>
                                        <div className={`progress-bar ${pct >= 100 ? 'bg-success' : 'bg-dark'}`} style={{ width: `${pct}%` }}></div>
                                    </div>

                                    {/* Payment items */}
                                    {deal.payments?.length > 0 && (
                                        <div className="d-flex flex-column gap-1">
                                            {deal.payments.map((p: any) => (
                                                <div key={p.id} className="d-flex align-items-center gap-2 bg-light rounded-3 px-2 py-1">
                                                    <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.6rem' }}>
                                                        {p.paymentType.replace('_', ' ')}
                                                        {p.installmentNumber ? ` Ke-${p.installmentNumber}` : ''}
                                                    </span>
                                                    <span className="small fw-semibold">{Utils.fmtIDR(p.amount)}</span>
                                                    <span className="small text-secondary">{p.paymentMethod}</span>
                                                    <span className="small text-secondary ms-auto">{Utils.fmtDate(p.paidAt)}</span>
                                                    <button onClick={() => handleDeletePay(p.id, deal.id)}
                                                        className="btn btn-link text-danger p-0" style={{ fontSize: '0.8rem' }}>
                                                        <ion-icon name="trash-outline"></ion-icon>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                        {deal.status === 'IN_PROGRESS' && (
                                            <>
                                                <button className="btn btn-dark btn-sm rounded-4"
                                                    onClick={() => { setSelectedDeal(deal); setShowPayModal(true); }}>
                                                    + Pembayaran
                                                </button>
                                                <button className="btn btn-outline-success btn-sm rounded-4"
                                                    onClick={() => { updateDealStatus(deal.id, 'COMPLETED').then(load); }}>
                                                    ✓ Selesai
                                                </button>
                                                <button className="btn btn-outline-secondary btn-sm rounded-4"
                                                    onClick={() => { updateDealStatus(deal.id, 'CANCELLED').then(load); }}>
                                                    Batalkan
                                                </button>
                                            </>
                                        )}
                                        {session?.role === 'ADMIN' && (
                                            <button className="btn btn-outline-danger btn-sm rounded-4 ms-auto"
                                                onClick={() => handleDeleteDeal(deal.id)}>
                                                <ion-icon name="trash-outline"></ion-icon>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="ap-card card border-0 shadow-sm">
                        <div className="card-body p-4 text-secondary text-center">
                            Belum ada deal. Mulai dengan klik "Deal Baru"!
                        </div>
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className="d-lg-none position-fixed" style={{ right: '16px', bottom: '90px', zIndex: 1040 }}>
                <button onClick={() => setShowDealModal(true)} className="btn btn-dark btn-lg rounded-4 shadow">
                    <ion-icon className="ap-icon" name="add-outline"></ion-icon>
                </button>
            </div>

            {/* Modal: Buat Deal Baru */}
            {showDealModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowDealModal(false); }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h6 className="modal-title fw-semibold">Buat Deal Baru</h6>
                                <button className="btn-close" onClick={() => setShowDealModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreateDeal} className="d-grid gap-3">
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Properti <span className="text-danger">*</span></label>
                                            <select name="propertyId" required className="form-select rounded-4">
                                                <option value="">— Pilih Properti —</option>
                                                {properties.filter((p: any) => p.status === 'AVAILABLE').map((p: any) => (
                                                    <option key={p.id} value={p.id}>{p.title} – {Utils.fmtIDR(p.price)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Klien <span className="text-danger">*</span></label>
                                            <select name="clientId" required className="form-select rounded-4">
                                                <option value="">— Pilih Klien —</option>
                                                {clients.map((c: any) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label small fw-semibold">Tipe Deal</label>
                                            <select name="dealType" className="form-select rounded-4">
                                                <option value="SALE">Jual</option>
                                                <option value="RENT">Sewa</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label small fw-semibold">Harga Deal (Rp) <span className="text-danger">*</span></label>
                                            <input name="dealPrice" type="number" required className="form-control rounded-4" placeholder="1500000000" />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label small fw-semibold">Tenor/Cicilan (Berapa Kali)</label>
                                            <input name="totalInstallments" type="number" defaultValue="1" className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label small fw-semibold">Tgl Mulai Cicilan</label>
                                            <input name="paymentStartDate" type="date" className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Tanggal Mulai Sewa (jika RENT)</label>
                                            <input name="rentStartDate" type="date" className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Tanggal Habis Sewa (jika RENT)</label>
                                            <input name="rentEndDate" type="date" className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Catatan</label>
                                            <textarea name="notes" rows={2} className="form-control rounded-4" placeholder="Catatan deal..."></textarea>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button disabled={saving} className="btn btn-dark rounded-4 flex-grow-1">
                                            {saving ? 'Menyimpan...' : 'Buat Deal'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary rounded-4" onClick={() => setShowDealModal(false)}>Batal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Tambah Pembayaran */}
            {showPayModal && selectedDeal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={e => { if (e.target === e.currentTarget) { setShowPayModal(false); setSelectedDeal(null); } }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h6 className="modal-title fw-semibold">Tambah Pembayaran</h6>
                                <button className="btn-close" onClick={() => { setShowPayModal(false); setSelectedDeal(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="ap-card card border-0 bg-light mb-3">
                                    <div className="card-body p-2 small">
                                        <div className="fw-semibold">{selectedDeal.property?.title}</div>
                                        <div className="text-secondary">Total: {Utils.fmtIDR(selectedDeal.dealPrice)}</div>
                                    </div>
                                </div>
                                <form onSubmit={handleAddPayment} className="d-grid gap-3">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Jumlah (Rp) <span className="text-danger">*</span></label>
                                            <input name="amount" type="number" required className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Tipe Pembayaran</label>
                                            <select name="paymentType" className="form-select rounded-4">
                                                <option value="DOWN_PAYMENT">DP / Uang Muka</option>
                                                <option value="INSTALLMENT">Cicilan</option>
                                                <option value="FULL_PAYMENT">Pelunasan</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Cicilan Ke- (Opsional)</label>
                                            <input name="installmentNumber" type="number" min="1" className="form-control rounded-4" placeholder="Misal: 1" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Metode Pembayaran</label>
                                            <select name="paymentMethod" className="form-select rounded-4">
                                                <option value="TRANSFER">Transfer Bank</option>
                                                <option value="CASH">Cash</option>
                                                <option value="KPR">KPR</option>
                                                <option value="KPA">KPA</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Tanggal Bayar</label>
                                            <input name="paidAt" type="date" required className="form-control rounded-4"
                                                defaultValue={new Date().toISOString().split('T')[0]} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Catatan</label>
                                            <input name="notes" className="form-control rounded-4" placeholder="Nomor ref, catatan..." />
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button disabled={saving} className="btn btn-dark rounded-4 flex-grow-1">
                                            {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary rounded-4"
                                            onClick={() => { setShowPayModal(false); setSelectedDeal(null); }}>Batal</button>
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
