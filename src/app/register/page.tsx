"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { db, session, activityService } from '@/lib/crm-system';
// import { Utils } from '@/lib/utils';
import { useActionState } from 'react';
import { registerAgent } from '../actions';
import InstallPrompt from '@/components/InstallPrompt';

export default function RegisterPage() {
    const router = useRouter();
    // React 19 useActionState
    const [state, action, isPending] = useActionState(registerAgent, null);

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
            <div className="ap-card card border-0 shadow-sm" style={{ maxWidth: '760px', width: '100%' }}>
                <div className="card-body p-4">
                    <div className="fw-semibold h5 mb-1">Daftar Agensi Baru</div>
                    <div className="text-secondary small">Sistem Manajemen Terpadu untuk Agensi Properti Terpercaya</div>

                    <form className="mt-4 d-grid gap-3" action={action}>
                        <div className="ap-card card border-0 bg-light">
                            <div className="card-body">
                                <div className="small fw-semibold mb-2">Data Agensi</div>
                                <div className="row g-2">
                                    <div className="col-12 col-md-7">
                                        <label className="form-label small fw-semibold">Nama Agensi</label>
                                        <input name="agency" required className="form-control form-control-lg rounded-4" />
                                    </div>
                                    <div className="col-12 col-md-5">
                                        <label className="form-label small fw-semibold">Nomor Lisensi (Optional)</label>
                                        <input name="licenseNo" className="form-control form-control-lg rounded-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ap-card card border-0 bg-light">
                            <div className="card-body">
                                <div className="small fw-semibold mb-2">Admin Utama</div>
                                <div className="row g-2">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Nama</label>
                                        <input name="name" required className="form-control form-control-lg rounded-4" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Nomor WhatsApp</label>
                                        <input name="phone" className="form-control form-control-lg rounded-4" placeholder="62812..." />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Email</label>
                                        <input name="email" type="email" required className="form-control form-control-lg rounded-4" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">PIN (Password)</label>
                                        <input name="pin" type="password" minLength={6} required className="form-control form-control-lg rounded-4" placeholder="min 6 digit" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {state?.message && <div className="text-danger small">{state.message}</div>}
                        <button disabled={isPending} className="btn btn-dark btn-lg rounded-4">
                            {isPending ? 'Mendaftar...' : 'Daftar & Lanjut'}
                        </button>
                    </form>

                    <div className="mt-3 small text-secondary">Sudah punya akun? <Link className="fw-semibold text-dark" href="/login">Login</Link></div>
                    <div className="mt-1 small"><Link className="fw-semibold text-dark" href="/">Kembali</Link></div>

                    <InstallPrompt />
                </div>
            </div>
        </div>
    );
}
