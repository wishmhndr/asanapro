"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClient, updateClient, addInteractionLog, deleteClient, getProperties, addClientInterest, removeClientInterest } from '@/app/actions';

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [client, setClient] = useState<any>(null);
    const [allProperties, setAllProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Budget formatting state
    const [minBudgetDisplay, setMinBudgetDisplay] = useState('');
    const [minBudgetValue, setMinBudgetValue] = useState('');
    const [maxBudgetDisplay, setMaxBudgetDisplay] = useState('');
    const [maxBudgetValue, setMaxBudgetValue] = useState('');

    const fmtNum = (n: number | string) => new Intl.NumberFormat('id-ID').format(Number(n));

    const handleMinBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setMinBudgetValue(raw);
        setMinBudgetDisplay(raw ? fmtNum(raw) : '');
    };

    const handleMaxBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setMaxBudgetValue(raw);
        setMaxBudgetDisplay(raw ? fmtNum(raw) : '');
    };

    async function load() {
        setLoading(true);
        const res = await getClient(id);
        if (res) {
            setClient(res);
            if (res.minBudget) {
                setMinBudgetValue(String(res.minBudget));
                setMinBudgetDisplay(fmtNum(res.minBudget));
            }
            if (res.maxBudget) {
                setMaxBudgetValue(String(res.maxBudget));
                setMaxBudgetDisplay(fmtNum(res.maxBudget));
            }
        }
        setLoading(false);
    }

    async function loadProperties() {
        const props = await getProperties();
        setAllProperties(props);
    }

    useEffect(() => {
        load();
        loadProperties();
    }, [id]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await updateClient(id, fd);
        if (res.success) {
            alert('Tersimpan');
            load();
        } else {
            alert(res.message);
        }
    };

    const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const note = String(fd.get('content') || '').trim();
        if (!note) return;

        const res = await addInteractionLog(id, fd);
        if (res.success) {
            (e.target as HTMLFormElement).reset();
            load();
        } else {
            alert(res.message);
        }
    };

    const handleAddInterest = async (propertyId: string) => {
        const res = await addClientInterest(id, propertyId);
        if (res.success) {
            const closeBtn = document.getElementById('close-add-prop-modal');
            if (closeBtn) closeBtn.click();
            load(); // Reload to show new interest
        } else {
            alert(res.message);
        }
    };

    const handleRemoveInterest = async (propertyId: string) => {
        if (!confirm('Hapus dari daftar minat?')) return;
        const res = await removeClientInterest(id, propertyId);
        if (res.success) {
            load();
        } else {
            alert(res.message);
        }
    }

    const handleDelete = async () => {
        if (confirm('Hapus klien ini?')) {
            const res = await deleteClient(id);
            if (res.success) {
                router.push('/app/crm');
            } else {
                alert(res.message);
            }
        }
    };

    if (loading) return <div className="p-4 text-secondary">Memuat data klien...</div>;
    if (!client) {
        return (
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="fw-semibold">Klien tidak ditemukan</div>
                    <div className="mt-2"><Link href="/app/crm" className="fw-semibold">Kembali</Link></div>
                </div>
            </div>
        );
    }

    const wa = String(client.whatsapp || '').replace(/\D/g, '');
    const waText = encodeURIComponent(`Halo ${client.name}, saya dari AsanaPro. Saya ingin follow up kebutuhan properti Anda.`);
    const waUrl = wa ? `https://wa.me/${wa}?text=${waText}` : null;

    const fmtDate = (d: string | Date) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const fmtIDR = (n: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    };

    const interestedIds = new Set((client.interestedProperties || []).map((p: any) => p.id));
    const availableToAdd = allProperties.filter(p => !interestedIds.has(p.id));

    return (
        <div className="d-grid gap-3">
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-3 flex-grow-1 w-100">
                            <div className="btn btn-dark rounded-4 fw-semibold" style={{ width: '52px', height: '52px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                {(client.name || 'K').slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="small text-secondary">Klien</div>
                                <div className="h5 fw-semibold mb-1">{client.name}</div>
                                <div className="text-secondary">WA: {client.whatsapp || '-'}</div>
                            </div>
                        </div>
                        <div className="d-flex gap-2 w-100 w-md-auto">
                            <Link href="/app/crm" className="btn btn-outline-secondary rounded-4 flex-fill flex-md-grow-0 text-center">Kembali</Link>
                            {waUrl ? <a target="_blank" rel="noopener" href={waUrl} className="btn btn-success rounded-4 flex-fill flex-md-grow-0 text-center"><ion-icon name="logo-whatsapp"></ion-icon> WhatsApp</a> : <button className="btn btn-secondary rounded-4 flex-fill flex-md-grow-0 text-center" disabled>WhatsApp</button>}
                            <button onClick={handleDelete} className="btn btn-outline-danger rounded-4 flex-fill flex-md-grow-0 text-center"><ion-icon name="trash-outline"></ion-icon></button>
                        </div>
                    </div>

                    <form className="mt-3 row g-2" onSubmit={handleSave}>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-semibold">Prospect</label>
                            <select name="prospect" defaultValue={client.status} className="form-select form-select-lg rounded-4">
                                {['Cold', 'Warm', 'Hot'].map(x => <option key={x}>{x}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-4">
                            <label className="form-label small fw-semibold">Budget Min</label>
                            <input
                                type="text"
                                value={minBudgetDisplay}
                                onChange={handleMinBudgetChange}
                                className="form-control form-control-lg rounded-4"
                                placeholder="0"
                            />
                            <input type="hidden" name="minBudget" value={minBudgetValue} />
                        </div>
                        <div className="col-6 col-md-4">
                            <label className="form-label small fw-semibold">Budget Max</label>
                            <input
                                type="text"
                                value={maxBudgetDisplay}
                                onChange={handleMaxBudgetChange}
                                className="form-control form-control-lg rounded-4"
                                placeholder="0"
                            />
                            <input type="hidden" name="maxBudget" value={maxBudgetValue} />
                        </div>

                        <div className="col-12 mt-3 d-flex align-items-center gap-2">
                            <button className="btn btn-dark btn-lg rounded-4">Simpan Profil</button>
                            <div className="ms-auto small text-secondary">Created: {fmtDate(client.createdAt)}</div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <div className="ap-card card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2">
                                <div className="fw-semibold">Interaction Log</div>
                                <div className="ms-auto small text-secondary">Riwayat</div>
                            </div>
                            <div className="ap-card card border-0 bg-light mt-3" style={{ maxHeight: '380px', overflow: 'auto' }}>
                                <div className="card-body">
                                    {client.interactionLogs && client.interactionLogs.length ? client.interactionLogs.map((x: any) => (
                                        <div key={x.id} className="mb-3">
                                            <div className="small text-secondary mb-1">{fmtDate(x.createdAt)}</div>
                                            <div className="ap-card card border-0 bg-white">
                                                <div className="card-body py-2 px-3">{x.content}</div>
                                            </div>
                                        </div>
                                    )) : <div className="text-secondary">Belum ada catatan interaksi.</div>}
                                </div>
                            </div>
                            <form className="mt-3 d-grid gap-2" onSubmit={handleAddNote}>
                                <textarea name="content" rows={3} required className="form-control rounded-4" placeholder="Tulis catatan interaksi..."></textarea>
                                <button className="btn btn-dark btn-lg rounded-4">Tambah Catatan</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="ap-card card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div>
                                    <div className="fw-semibold">Properti Diminati</div>
                                    <div className="small text-secondary">Daftar properti yang disukai klien.</div>
                                </div>
                                <div className="ms-auto">
                                    <button
                                        className="btn btn-sm btn-dark rounded-4"
                                        data-bs-toggle="modal"
                                        data-bs-target="#addPropertyModal"
                                    >
                                        <ion-icon className="ap-icon" name="add-outline"></ion-icon> Add
                                    </button>
                                </div>
                            </div>

                            <div className="d-grid gap-2" style={{ maxHeight: '500px', overflow: 'auto' }}>
                                {client.interestedProperties && client.interestedProperties.length ? client.interestedProperties.map((p: any) => {
                                    const cover = (p.images || [])[0]?.url;
                                    return (
                                        <div key={p.id} className="ap-card card border-0 shadow-sm overflow-hidden">
                                            <div className="d-flex position-relative">
                                                <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                                                    {cover ? <img src={cover} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={p.title} /> : <div className="bg-light w-100 h-100"></div>}
                                                </div>
                                                <div className="p-2 flex-grow-1 min-w-0 d-flex flex-column justify-content-center">
                                                    <div className="fw-semibold text-truncate small">{p.title}</div>
                                                    <div className="small text-secondary text-truncate" style={{ fontSize: '0.75rem' }}>{p.location || '-'}</div>
                                                    <div className="fw-semibold small text-success">{fmtIDR(p.price)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveInterest(p.id)}
                                                    className="btn btn-link text-danger position-absolute top-0 end-0 p-2"
                                                >
                                                    <ion-icon name="close-circle"></ion-icon>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }) : <div className="text-secondary small text-center py-4 bg-light rounded-4">Belum ada properti yang ditandai diminati.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Add Property */}
            <div className="modal fade" id="addPropertyModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header">
                            <h6 className="modal-title">Tambah Properti Diminati</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="close-add-prop-modal"></button>
                        </div>
                        <div className="modal-body p-0">
                            <div className="list-group list-group-flush">
                                {availableToAdd.length ? availableToAdd.map(p => (
                                    <div key={p.id} className="list-group-item d-flex align-items-center gap-3 p-3">
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                            {(p.images && p.images[0]) ?
                                                <img src={p.images[0].url} className="w-100 h-100 object-fit-cover" />
                                                : <div className="bg-light w-100 h-100"></div>
                                            }
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">{p.title}</div>
                                            <div className="small text-secondary">{p.location} • {fmtIDR(p.price)}</div>
                                        </div>
                                        <button onClick={() => handleAddInterest(p.id)} className="btn btn-sm btn-dark rounded-4">
                                            Pilih
                                        </button>
                                    </div>
                                )) : <div className="p-4 text-center text-secondary">Semua properti sudah ditambahkan atau tidak ada data.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
