"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getReportStats, createReport, deleteReport } from "../../actions";
import { Utils } from "@/lib/utils";

export default function ReportsPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"overview" | "journal">("overview");

    async function load() {
        setLoading(true);
        const res = await getReportStats();
        setData(res);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const handleCreateReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await createReport(fd);

        if (res.success) {
            const close = document.getElementById("close-report-modal");
            close?.click();
            // Force cleanup of potential stray backdrops
            setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            }, 100);
            load();
            router.refresh();
        } else {
            alert(res.message);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!confirm("Hapus laporan ini?")) return;
        const res = await deleteReport(id);
        if (res.success) load();
    };

    if (loading) return <div className="p-4 text-secondary">Memuat laporan...</div>;
    if (!data) return <div className="p-4 text-danger">Gagal memuat data.</div>;

    const { props, clients, reports } = data;

    return (
        <div className="d-grid gap-3">

            {/* HEADER */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="fw-semibold fs-5 w-100 w-md-auto">
                            Laporan & Analitik
                        </div>

                        <div className="ms-md-auto d-flex gap-2 w-100 w-md-auto">
                            <button
                                onClick={() => setTab("overview")}
                                className={`btn rounded-4 flex-fill flex-md-grow-0 ${tab === "overview" ? "btn-dark" : "btn-outline-secondary"
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setTab("journal")}
                                className={`btn rounded-4 flex-fill flex-md-grow-0 ${tab === "journal" ? "btn-dark" : "btn-outline-secondary"
                                    }`}
                            >
                                Jurnal Manual
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* OVERVIEW */}
            {tab === "overview" && (
                <div className="row g-3">

                    {/* INVENTORY */}
                    <div className="col-12 col-md-4">
                        <div className="ap-card card border-0 shadow-sm h-100">
                            <div className="card-body p-3 p-md-4">
                                <div className="text-secondary small fw-bold text-uppercase">
                                    Inventory Status
                                </div>

                                <div className="mt-3 d-flex align-items-end gap-2 flex-wrap">
                                    <div className="fw-bold fs-1 fs-md-2 fs-lg-1">
                                        {props.total}
                                    </div>
                                    <div className="text-secondary mb-2">
                                        Total Unit
                                    </div>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between">
                                    <span className="text-success fw-semibold">Available</span>
                                    <span>{props.available}</span>
                                </div>
                                <div className="d-flex justify-content-between mt-1">
                                    <span className="text-secondary">Sold / Rented</span>
                                    <span>{props.sold}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CLIENT */}
                    <div className="col-12 col-md-4">
                        <div className="ap-card card border-0 shadow-sm h-100">
                            <div className="card-body p-3 p-md-4">
                                <div className="text-secondary small fw-bold text-uppercase">
                                    Client Pipeline
                                </div>

                                <div className="mt-3 d-flex align-items-end gap-2 flex-wrap">
                                    <div className="fw-bold fs-1 fs-md-2 fs-lg-1">
                                        {clients.total}
                                    </div>
                                    <div className="text-secondary mb-2">
                                        Total Klien
                                    </div>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between">
                                    <span className="badge bg-secondary rounded-pill">Cold</span>
                                    <span>{clients.cold}</span>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <span className="badge bg-warning text-dark rounded-pill">Warm</span>
                                    <span>{clients.warm}</span>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <span className="badge bg-danger rounded-pill">Hot Prospect</span>
                                    <span>{clients.hot}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="col-12">
                        <div className="ap-card card border-0 shadow-sm">
                            <div className="card-body p-3 p-md-4">
                                <div className="fw-semibold mb-3">
                                    Laporan Properti Aktif
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle small w-100">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-3">Properti</th>
                                                <th>Lokasi</th>
                                                <th>Harga</th>
                                                <th>Listed Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {props.list.length ? (
                                                props.list.map((p: any) => (
                                                    <tr key={p.id}>
                                                        <td className="ps-3 fw-semibold text-break">
                                                            <Link
                                                                href={`/app/listing/${p.id}`}
                                                                className="text-decoration-none text-dark"
                                                            >
                                                                {p.title}
                                                            </Link>
                                                        </td>
                                                        <td className="text-secondary text-break">
                                                            {p.location}
                                                        </td>
                                                        <td>{Utils.fmtIDR(p.price)}</td>
                                                        <td className="text-secondary">
                                                            {Utils.fmtDate(p.createdAt)}
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill">
                                                                Active
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-secondary py-4">
                                                        Tidak ada properti aktif.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* JOURNAL */}
            {tab === "journal" && (
                <div className="row g-3">
                    <div className="col-12">
                        <div className="ap-card card border-0 shadow-sm">
                            <div className="card-body p-3 p-md-4">

                                <div className="d-flex align-items-center gap-2 flex-wrap mb-4">
                                    <div>
                                        <div className="fw-semibold">
                                            Jurnal Laporan Manual
                                        </div>
                                        <div className="text-secondary small">
                                            Catatan harian, insiden, atau laporan mingguan.
                                        </div>
                                    </div>

                                    <div className="ms-md-auto w-100 w-md-auto">
                                        <button
                                            className="btn btn-dark rounded-4 w-100 w-md-auto"
                                            data-bs-toggle="modal"
                                            data-bs-target="#newReportModal"
                                        >
                                            <ion-icon name="add-outline" className="me-1" />
                                            Buat Laporan
                                        </button>
                                    </div>
                                </div>

                                <div className="d-grid gap-3">
                                    {reports.length ? (
                                        reports.map((r: any) => (
                                            <div key={r.id} className="card border-0 bg-light">
                                                <div className="card-body">

                                                    <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                                                        <span className="badge bg-dark rounded-pill">
                                                            {r.category}
                                                        </span>

                                                        <span className="fw-bold text-break w-100 w-md-auto">
                                                            {r.title}
                                                        </span>

                                                        <span className="ms-md-auto small text-secondary">
                                                            {Utils.fmtDate(r.createdAt)}
                                                        </span>

                                                        <button
                                                            onClick={() => handleDeleteReport(r.id)}
                                                            className="btn btn-link text-danger p-0"
                                                        >
                                                            <ion-icon name="trash-outline" />
                                                        </button>
                                                    </div>

                                                    <div
                                                        className="text-secondary text-break"
                                                        style={{ whiteSpace: "pre-line" }}
                                                    >
                                                        {r.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 text-secondary">
                                            Belum ada laporan manual yang dibuat.
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL */}
            <div className="modal fade" id="newReportModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header">
                            <h6 className="modal-title">Buat Laporan Baru</h6>
                            <button
                                id="close-report-modal"
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            />
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleCreateReport} className="d-grid gap-3">
                                <div>
                                    <label className="form-label small fw-semibold">
                                        Judul Laporan
                                    </label>
                                    <input
                                        name="title"
                                        required
                                        className="form-control rounded-4"
                                    />
                                </div>

                                <div>
                                    <label className="form-label small fw-semibold">
                                        Kategori
                                    </label>
                                    <select name="category" className="form-select rounded-4">
                                        <option value="GENERAL">Umum</option>
                                        <option value="ACTIVITY">Aktivitas</option>
                                        <option value="INCIDENT">Insiden</option>
                                        <option value="MARKETING">Marketing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label small fw-semibold">
                                        Isi Laporan
                                    </label>
                                    <textarea
                                        name="content"
                                        rows={6}
                                        required
                                        className="form-control rounded-4"
                                    />
                                </div>

                                <div className="d-flex gap-2 justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary rounded-4"
                                        data-bs-dismiss="modal"
                                    >
                                        Batal
                                    </button>
                                    <button className="btn btn-dark rounded-4 px-4">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
