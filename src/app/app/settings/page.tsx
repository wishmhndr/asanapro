"use client";
import React, { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { getSettings, updateSettings } from '../../actions';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [state, formAction, isPending] = useActionState(updateSettings, null);

    useEffect(() => {
        async function load() {
            const res = await getSettings();
            setUser(res);
            setLoading(false);
        }
        load();
    }, []);

    useEffect(() => {
        if (state?.message?.includes('berhasil')) {
            getSettings().then(res => setUser(res));
        }
    }, [state]);

    if (loading) return <div className="p-4 text-secondary">Memuat pengaturan...</div>;
    if (!user) return null;

    return (
        <div className="d-grid gap-3">
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="fw-semibold">Profil & Agensi</div>
                    <form className="mt-3 d-grid gap-3" action={formAction} key={user.updatedAt}>
                        <div>
                            <label className="form-label small fw-semibold">Nama Lengkap</label>
                            <input name="name" defaultValue={user.name} required className="form-control form-control-lg rounded-4" />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Email</label>
                            <input disabled defaultValue={user.email} className="form-control form-control-lg rounded-4 bg-light" />
                            <div className="small text-secondary mt-1">Email tidak dapat diubah (Identitas Dasar)</div>
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Nama Agensi</label>
                            <input name="agency" defaultValue={user.agency} className="form-control form-control-lg rounded-4" />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">Nomor WhatsApp</label>
                            <input name="phone" defaultValue={user.phoneNumber || ''} className="form-control form-control-lg rounded-4" placeholder="62812..." />
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
        </div>
    );
}
