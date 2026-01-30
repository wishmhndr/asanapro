"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { db } from '@/lib/crm-system';
import { Utils } from '@/lib/utils';
import Image from 'next/image';

export default function PublicPropertyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        setData(db.load());
    }, []);

    if (!data) return null;
    const p = data.properties.find((x: any) => x.slug === slug);
    if (!p) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
                <div className="ap-card card border-0 shadow-sm" style={{ maxWidth: '560px', width: '100%' }}>
                    <div className="card-body p-4">
                        <div className="h5 fw-semibold">Properti tidak ditemukan</div>
                        <div className="text-secondary">Link mungkin sudah tidak valid.</div>
                        <div className="mt-3"><Link href="/" className="fw-semibold">Kembali</Link></div>
                    </div>
                </div>
            </div>
        );
    }

    const agency = data.agencies.find((a: any) => a.id === p.agencyId);
    const agent = data.users.find((u: any) => u.id === p.createdBy);
    const wa = String(agent?.phone || agency?.whatsappDefault || '').replace(/\D/g, '');
    const waText = encodeURIComponent(`Halo ${agent?.name || 'Agen'}, saya tertarik dengan properti: ${p.name} (${Utils.fmtIDR(p.price)}) — ${p.location}. Mohon info detail & jadwal survey.`);
    const waUrl = wa ? `https://wa.me/${wa}?text=${waText}` : null;
    const photos = (p.photos || []).slice().sort((a: any, b: any) => a.sort - b.sort);

    // Use state for main photo to allow switching
    const [mainPhoto, setMainPhoto] = useState(photos[0]?.dataUrl || Utils.demoImg('No Photo'));

    const specs = [
        ['Harga', Utils.fmtIDR(p.price)],
        ['Status', p.status],
        ['Lokasi', p.location || '-'],
        ['LT / LB', `${p.landArea || '-'} m² / ${p.buildingArea || '-'} m²`],
        ['KT / KM', `${p.bedrooms || '-'} / ${p.bathrooms || '-'}`],
        ['Listrik', p.electricity ? `${p.electricity} VA` : '-'],
        ['Hadap', p.facing || '-'],
        ['Tahun', p.yearBuilt ? String(p.yearBuilt) : '-'],
        ['Legalitas', p.legality || '-'],
    ];

    return (
        <div className="min-vh-100 bg-light">
            <header className="ap-nav ap-soft border-bottom">
                <div className="container py-3 d-flex align-items-center gap-3">
                    <Link href="/" className="btn btn-dark rounded-4 px-3 py-2 fw-semibold">AP</Link>
                    <div className="min-w-0">
                        <div className="fw-semibold text-truncate">{agency?.name || 'AsanaPro'}</div>
                        <div className="small text-secondary">Professional Link</div>
                    </div>
                    <div className="ms-auto"><Link href="/" className="small fw-semibold text-secondary text-decoration-none">Home</Link></div>
                </div>
            </header>

            <main className="container py-4 pb-5" style={{ paddingBottom: '96px' }}>
                <div className="ap-card card border-0 shadow-sm">
                    <div className="card-body p-3 p-md-4">
                        <div className="d-flex align-items-start gap-3">
                            <div className="min-w-0">
                                <h1 className="h5 h4-md fw-semibold">{p.name}</h1>
                                <div className="text-secondary">{p.location || '-'}</div>
                            </div>
                            <div className="ms-auto text-end">
                                <div className="h5 fw-semibold">{Utils.fmtIDR(p.price)}</div>
                                <span className={`badge ${p.status === 'Sold' ? 'text-bg-danger' : 'text-bg-success'} ap-pill`}>{p.status}</span>
                            </div>
                        </div>

                        <div className="mt-3 ap-card card border-0 bg-light overflow-hidden">
                            <div className="position-relative">
                                <img src={mainPhoto} alt="Foto" className="w-100" style={{ height: '360px', objectFit: 'cover' }} />
                                <div className="position-absolute start-0 end-0 bottom-0 p-2">
                                    <div className="d-flex gap-2 overflow-auto ap-scrollbar">
                                        {photos.map((ph: any, i: number) => (
                                            <button key={i} type="button" onClick={() => setMainPhoto(ph.dataUrl)} className="btn p-0 border rounded-4 overflow-hidden" style={{ width: '86px', height: '64px' }}>
                                                <img src={ph.dataUrl} className="ap-photo-sm" alt="thumb" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-2 mt-3">
                            {specs.map(([k, v]) => (
                                <div key={k} className="col-12 col-md-6">
                                    <div className="ap-card card border-0 bg-light">
                                        <div className="card-body py-3">
                                            <div className="small text-secondary">{k}</div>
                                            <div className="fw-semibold">{v}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3">
                            <div className="fw-semibold">Deskripsi</div>
                            <div className="text-secondary mt-1" style={{ whiteSpace: 'pre-wrap' }}>{p.description || '-'}</div>
                        </div>

                        <div className="ap-card card border-0 shadow-sm mt-3">
                            <div className="card-body d-flex align-items-center gap-3">
                                <div className="btn btn-outline-secondary rounded-4 fw-semibold" style={{ width: '44px', height: '44px', display: 'grid', placeItems: 'center' }}>
                                    {(agent?.name || 'A').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="fw-semibold text-truncate">{agent?.name || 'Agen Properti'}</div>
                                    <div className="small text-secondary text-truncate">{agency?.name || 'AsanaPro'}{agency?.licenseNo ? ` • Lisensi ${agency.licenseNo}` : ''}</div>
                                </div>
                                <div className="ms-auto">
                                    {waUrl ? <a href={waUrl} target="_blank" rel="noopener" className="btn btn-success btn-lg rounded-4">Hubungi Agen via WhatsApp</a>
                                        : <button className="btn btn-secondary btn-lg rounded-4" disabled>WhatsApp belum tersedia</button>}
                                </div>
                            </div>
                        </div>

                        <div className="text-center small text-secondary mt-3">Powered by AsanaPro 2026</div>
                    </div>
                </div>
            </main>
        </div>
    );
}
