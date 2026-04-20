"use client";
import { useActionState } from 'react';
import Link from 'next/link';
import { registerAgency } from '../actions';

export default function RegisterPage() {
    const [state, action, isPending] = useActionState(registerAgency, null);

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
            <div className="ap-card card border-0 shadow-sm" style={{ maxWidth: '680px', width: '100%' }}>
                <div className="card-body p-4">
                    <div className="fw-semibold h5 mb-1">Daftar Agensi Baru</div>
                    <div className="text-secondary small mb-4">Buat akun Admin untuk mengelola agensi properti Anda</div>

                    <form className="d-grid gap-3" action={action}>
                        {/* Data Agensi */}
                        <div className="ap-card card border-0 bg-light">
                            <div className="card-body">
                                <div className="small fw-semibold mb-3 text-uppercase text-secondary" style={{ letterSpacing: '0.05em' }}>
                                    Data Agensi
                                </div>
                                <div>
                                    <label className="form-label small fw-semibold">Nama Agensi <span className="text-danger">*</span></label>
                                    <input name="agency" required className="form-control form-control-lg rounded-4"
                                        placeholder="Contoh: Surya Properti Indonesia" />
                                </div>
                            </div>
                        </div>

                        {/* Data Admin */}
                        <div className="ap-card card border-0 bg-light">
                            <div className="card-body">
                                <div className="small fw-semibold mb-3 text-uppercase text-secondary" style={{ letterSpacing: '0.05em' }}>
                                    Akun Admin Utama
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Nama Lengkap <span className="text-danger">*</span></label>
                                        <input name="name" required className="form-control form-control-lg rounded-4" placeholder="Nama admin" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Nomor WhatsApp</label>
                                        <input name="phone" className="form-control form-control-lg rounded-4" placeholder="628123456789" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">Email <span className="text-danger">*</span></label>
                                        <input name="email" type="email" required className="form-control form-control-lg rounded-4" placeholder="admin@agensi.com" />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-semibold">PIN / Password <span className="text-danger">*</span></label>
                                        <input name="pin" type="password" minLength={6} required
                                            className="form-control form-control-lg rounded-4" placeholder="min 6 karakter" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {state?.message && (
                            <div className="alert alert-danger rounded-4 py-2 small mb-0">
                                {state.message}
                            </div>
                        )}

                        <button disabled={isPending} className="btn btn-dark btn-lg rounded-4">
                            {isPending ? 'Mendaftarkan...' : 'Daftar & Mulai Sekarang'}
                        </button>
                    </form>

                    <div className="mt-3 small text-secondary">
                        Sudah punya akun?{' '}
                        <Link className="fw-semibold text-dark" href="/login">Login</Link>
                    </div>
                    <div className="mt-1 small">
                        <Link className="fw-semibold text-dark" href="/">← Kembali ke Beranda</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
