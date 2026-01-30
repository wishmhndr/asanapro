"use client";
import React from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAgent } from './actions';
import InstallPrompt from '@/components/InstallPrompt';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} className="btn btn-dark btn-lg rounded-4">
      {pending ? 'Masuk...' : 'Masuk'}
    </button>
  );
}

export default function Home() {
  const [state, formAction, isPending] = useActionState(loginAgent, null);
  const brand = { name: 'AsanaPro', year: '2026' };

  return (
    <div className="min-vh-100 ap-hero d-flex flex-column">
      <header className="container py-4 d-flex align-items-center gap-3">
        <img src="/logo.jpg" alt="AsanaPro Logo" width={48} height={48} className="rounded-2 shadow-sm" style={{ objectFit: 'cover' }} />
        <div className="min-w-0">
          <div className="fw-semibold">{brand.name} <span className="text-secondary fw-normal">{brand.year}</span></div>
          <div className="small text-secondary">Property Agency Manager</div>
        </div>
      </header>

      <main className="container flex-grow-1 d-flex flex-column justify-content-center pb-5">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <h1 className="display-4 fw-bold mb-3">Kelola Agensi Properti Lebih Mudah</h1>
            <p className="lead text-secondary mb-4">
              Platform manajemen all-in-one untuk agen properti modern.
              Mulai dari listing inventory, manajemen klien (CRM), hingga
              pembuatan link profesional untuk WhatsApp.
            </p>
            <div className="d-flex gap-3 text-secondary small">
              <div className="d-flex align-items-center gap-1">
                <ion-icon name="checkmark-circle" className="text-success"></ion-icon> Listing
              </div>
              <div className="d-flex align-items-center gap-1">
                <ion-icon name="checkmark-circle" className="text-success"></ion-icon> CRM
              </div>
              <div className="d-flex align-items-center gap-1">
                <ion-icon name="checkmark-circle" className="text-success"></ion-icon> Reports
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5 offset-lg-1">
            <div className="ap-card card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                <div className="mb-4">
                  <div className="h4 fw-semibold">Welcome back</div>
                  <div className="text-secondary">Login untuk akses dashboard</div>
                </div>

                <form className="d-grid gap-3" action={formAction}>
                  <div>
                    <label className="form-label small fw-semibold">Email</label>
                    <input name="email" type="email" required className="form-control form-control-lg rounded-4" placeholder="akun1@gmail.com" />
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">PIN (Password)</label>
                    <input name="pin" type="password" required className="form-control form-control-lg rounded-4" placeholder="123456" />
                  </div>
                  {state?.message && <div className="text-danger small">{state.message}</div>}
                  <SubmitButton />
                </form>

                <div className="text-center mt-4">
                  <div className="text-secondary small mb-2">Belum punya akun agensi?</div>
                  <Link href="/register" className="btn btn-outline-secondary rounded-4 w-100">Daftar Agensi Baru</Link>
                </div>

                <InstallPrompt />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container py-4 text-center text-secondary small">
        &copy; {brand.year} {brand.name}. Mobile-first Property Management.
      </footer>
    </div>
  );
}
