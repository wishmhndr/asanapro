"use client";
import React, { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { getSettings, updateSettings, changePassword } from '../../actions';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [state, formAction, isPending] = useActionState(updateSettings, null);
    const [pwState, pwAction, pwPending] = useActionState(changePassword, null);

    async function load() {
        const res = await getSettings();
        setUser(res);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);
    useEffect(() => { if (state?.message?.includes('berhasil')) load(); }, [state]);

    if (loading) return <div className="p-4 text-secondary">Memuat pengaturan...</div>;
    if (!user) return null;

    const isAdmin = user.role === 'ADMIN';

    return (
        <div className="d-grid gap-3">
            {/* Profile */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="fw-semibold mb-1">Profil Saya</div>
                    <div className="small text-secondary mb-3">
                        Role: <span className={`badge ${isAdmin ? 'bg-dark' : 'bg-primary bg-opacity-10 text-primary'} rounded-pill`}>
                            {isAdmin ? 'Admin' : 'Marketing'}
                        </span>
                    </div>
                    <form className="d-grid gap-3" action={formAction} key={user.updatedAt?.toString()}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">Nama Lengkap</label>
                                <input name="name" defaultValue={user.name} required className="form-control form-control-lg rounded-4" />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">Email</label>
                                <input disabled defaultValue={user.email} className="form-control form-control-lg rounded-4 bg-light" />
                                <div className="small text-secondary mt-1">Email tidak dapat diubah</div>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">Nomor WhatsApp</label>
                                <input name="phone" defaultValue={user.phoneNumber || ''} className="form-control form-control-lg rounded-4" placeholder="628123..." />
                            </div>
                            {isAdmin && (
                                <div className="col-12 col-md-6">
                                    <label className="form-label small fw-semibold">Nama Agensi</label>
                                    <input name="agencyName" defaultValue={user.agency?.name || ''} className="form-control form-control-lg rounded-4" />
                                </div>
                            )}
                        </div>

                        {state?.message && (
                            <div className={`small ${state.message.includes('berhasil') ? 'text-success' : 'text-danger'}`}>
                                {state.message}
                            </div>
                        )}
                        <button disabled={isPending} className="btn btn-dark btn-lg rounded-4">
                            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Change Password */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="fw-semibold mb-3">Ubah PIN / Password</div>
                    <form className="d-grid gap-3" action={pwAction}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">PIN Lama</label>
                                <input name="oldPin" type="password" required className="form-control form-control-lg rounded-4" />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label small fw-semibold">PIN Baru (min 6 karakter)</label>
                                <input name="newPin" type="password" minLength={6} required className="form-control form-control-lg rounded-4" />
                            </div>
                        </div>
                        {pwState?.message && (
                            <div className={`small ${pwState.message.includes('berhasil') ? 'text-success' : 'text-danger'}`}>
                                {pwState.message}
                            </div>
                        )}
                        <button disabled={pwPending} className="btn btn-outline-dark btn-lg rounded-4">
                            {pwPending ? 'Menyimpan...' : 'Ubah PIN'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Agency Info */}
            {isAdmin && user.agency && (
                <div className="ap-card card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <div className="fw-semibold mb-2">Info Agensi</div>
                        <div className="small text-secondary">Agensi: <span className="fw-semibold text-dark">{user.agency.name}</span></div>
                        {user.agency.address && (
                            <div className="small text-secondary mt-1">Alamat: {user.agency.address}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
