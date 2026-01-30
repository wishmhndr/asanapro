"use client";
import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { loginAgent } from '../actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    // React 19 useActionState
    const [state, action, isPending] = useActionState(loginAgent, null);

    useEffect(() => {
        if (state?.needsVerification) {
            router.push('/verify-email');
        }
    }, [state, router]);

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
            <div className="ap-card card border-0 shadow-sm" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2">
                        <div className="btn btn-dark rounded-4 px-3 py-2 fw-semibold">AP</div>
                        <div>
                            <div className="fw-semibold">Login</div>
                            <div className="small text-secondary">AsanaPro Property Manager</div>
                        </div>
                    </div>

                    <form className="mt-4 d-grid gap-3" action={action}>
                        <div>
                            <label className="form-label small fw-semibold">Email</label>
                            <input name="email" type="email" required className="form-control form-control-lg rounded-4" placeholder="akun1@gmail.com" />
                        </div>
                        <div>
                            <label className="form-label small fw-semibold">PIN (Password)</label>
                            <input name="pin" type="password" required className="form-control form-control-lg rounded-4" placeholder="123456" />
                        </div>
                        {state?.message && <div className="text-danger small">{state.message}</div>}
                        <button disabled={isPending} className="btn btn-dark btn-lg rounded-4">
                            {isPending ? 'Masuk...' : 'Masuk'}
                        </button>
                    </form>

                    <div className="mt-3 small text-secondary">Belum punya agensi? <Link className="fw-semibold text-dark" href="/register">Daftar</Link></div>
                    <div className="mt-1 small"><Link className="fw-semibold text-dark" href="/">Kembali</Link></div>
                </div>
            </div>
        </div>
    );
}
