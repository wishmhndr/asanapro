"use client";
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    )
}

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const step = Number(searchParams.get('step') || 0);

    const slides = [
        { title: 'Listing (Inventory)', desc: 'Kelola daftar properti, foto, status Available/Sold, dan detail lengkap.' },
        { title: 'CRM (Klien)', desc: 'Simpan database klien, catat interaction log, dan status prospect.' },
        { title: 'Professional Link', desc: 'Generate link publik /properti/[slug] untuk share ke WhatsApp dengan tampilan profesional.' },
    ];

    const s = Math.max(0, Math.min(2, step));
    const item = slides[s];
    const dots = slides.map((_, i) => (
        <span key={i} className={`badge rounded-pill ${i === s ? 'text-bg-dark' : 'text-bg-secondary'}`}> </span>
    ));

    const handleFinish = () => {
        router.push('/app/dashboard');
    };

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
            <div className="ap-card card border-0 shadow-sm" style={{ maxWidth: '560px', width: '100%' }}>
                <div className="card-body p-4">
                    <div className="small text-secondary">Onboarding {s + 1}/3</div>
                    <div className="h5 fw-semibold mt-2">{item.title}</div>
                    <div className="text-secondary">{item.desc}</div>
                    <div className="mt-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex gap-2">{dots}</div>
                        <div className="d-flex gap-2">
                            {s > 0 && <Link href={`/onboarding?step=${s - 1}`} className="btn btn-outline-secondary rounded-4">Back</Link>}
                            {s < 2 ? (
                                <Link href={`/onboarding?step=${s + 1}`} className="btn btn-dark rounded-4">Next</Link>
                            ) : (
                                <button onClick={handleFinish} className="btn btn-dark rounded-4">Finish</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
