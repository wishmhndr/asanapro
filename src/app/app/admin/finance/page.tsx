"use client";
import React, { useEffect, useState } from 'react';
import { getExpenses, createExpense, deleteExpense, getAdminReports } from '../../../actions';
import { Utils } from '@/lib/utils';
import CurrencyInput from '@/components/CurrencyInput';

export default function AdminFinancePage() {
    const [data, setData] = useState<any>(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    async function load() {
        const [rep, exp] = await Promise.all([getAdminReports(), getExpenses()]);
        setData(rep);
        setExpenses(exp);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const res = await createExpense(fd);
        setSaving(false);
        if (res.success) { setShowModal(false); (e.target as HTMLFormElement).reset(); load(); }
        else alert(res.message);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus pengeluaran ini?')) return;
        await deleteExpense(id);
        load();
    };

    if (loading) return <div className="p-4 text-secondary">Memuat data keuangan...</div>;
    if (!data) return <div className="p-4 text-danger">Akses ditolak atau gagal memuat data.</div>;

    const { summary } = data;
    const totalExpFromList = expenses.reduce((s: number, e: any) => s + e.amount, 0);

    return (
        <div className="d-grid gap-3 px-0">
            {/* Summary */}
            <div className="row g-2 g-md-3">
                <div className="col-12 col-md-4">
                    <div className="ap-card card border-0 shadow-sm ap-kpi ap-kpi-emerald">
                        <div className="card-body p-3 p-md-4">
                            <div className="small opacity-75">Total Revenue Masuk</div>
                            <div className="fw-bold fs-4 mt-1">{Utils.fmtIDR(summary.totalPaid)}</div>
                            <div className="small opacity-75">Dari seluruh pembayaran</div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="ap-card card border-0 shadow-sm ap-kpi ap-kpi-rose">
                        <div className="card-body p-3 p-md-4">
                            <div className="small opacity-75">Total Pengeluaran</div>
                            <div className="fw-bold fs-4 mt-1">{Utils.fmtIDR(totalExpFromList)}</div>
                            <div className="small opacity-75">Biaya operasional</div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className={`ap-card card border-0 shadow-sm ${summary.netProfit >= 0 ? 'ap-kpi' : 'ap-kpi ap-kpi-rose'}`}>
                        <div className="card-body p-3 p-md-4">
                            <div className="small opacity-75">Net Profit</div>
                            <div className="fw-bold fs-4 mt-1">{Utils.fmtIDR(summary.totalPaid - totalExpFromList)}</div>
                            <div className="small opacity-75">Revenue – Pengeluaran</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense List */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div>
                            <div className="fw-semibold">Pengeluaran Operasional</div>
                            <div className="small text-secondary">Biaya agency & marketing</div>
                        </div>
                        <button className="btn btn-dark rounded-4 btn-sm ms-auto" onClick={() => setShowModal(true)}>
                            + Tambah
                        </button>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="text-secondary small text-center py-4">Belum ada data pengeluaran.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle small">
                                <thead className="table-light">
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Deskripsi</th>
                                        <th>Kategori</th>
                                        <th className="text-end">Jumlah</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((e: any) => (
                                        <tr key={e.id}>
                                            <td className="text-secondary">{Utils.fmtDate(e.expenseDate)}</td>
                                            <td>{e.description}</td>
                                            <td>
                                                <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.65rem' }}>
                                                    {e.category.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="text-end fw-semibold">{Utils.fmtIDR(e.amount)}</td>
                                            <td className="text-end">
                                                <button onClick={() => handleDelete(e.id)}
                                                    className="btn btn-link text-danger p-0">
                                                    <ion-icon name="trash-outline"></ion-icon>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="fw-semibold">
                                        <td colSpan={3}>Total</td>
                                        <td className="text-end">{Utils.fmtIDR(totalExpFromList)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Deal Payment detail */}
            <div className="ap-card card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="fw-semibold mb-3">Rincian Revenue per Deal</div>
                    {data.deals.filter((d: any) => d.payments?.length > 0).length === 0 ? (
                        <div className="text-secondary small text-center py-4">Belum ada pembayaran masuk.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle small">
                                <thead className="table-light">
                                    <tr>
                                        <th>Properti</th>
                                        <th>Klien</th>
                                        <th>Marketing</th>
                                        <th className="text-end">Harga Deal</th>
                                        <th className="text-end">Total Dibayar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.deals.filter((d: any) => d.payments?.length > 0).map((d: any) => (
                                        <tr key={d.id}>
                                            <td className="fw-semibold text-truncate" style={{ maxWidth: '140px' }}>{d.property?.title}</td>
                                            <td>{d.client?.name}</td>
                                            <td><span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">{d.marketing?.name}</span></td>
                                            <td className="text-end">{Utils.fmtIDR(d.dealPrice)}</td>
                                            <td className="text-end fw-semibold text-success">{Utils.fmtIDR(d.payments.reduce((s: number, p: any) => s + p.amount, 0))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Pengeluaran */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h6 className="modal-title fw-semibold">Tambah Pengeluaran</h6>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAdd} className="d-grid gap-3">
                                    <div>
                                        <label className="form-label small fw-semibold">Deskripsi <span className="text-danger">*</span></label>
                                        <input name="description" required className="form-control rounded-4" placeholder="Biaya iklan properti..." />
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Jumlah (Rp) <span className="text-danger">*</span></label>
                                            <CurrencyInput name="amount" required className="form-control rounded-4" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-semibold">Kategori</label>
                                            <select name="category" className="form-select rounded-4">
                                                <option value="OPERATIONAL">Operasional</option>
                                                <option value="MARKETING_FEE">Biaya Marketing</option>
                                                <option value="SALARY">Gaji</option>
                                                <option value="OTHER">Lainnya</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold">Tanggal <span className="text-danger">*</span></label>
                                            <input name="expenseDate" type="date" required className="form-control rounded-4"
                                                defaultValue={new Date().toISOString().split('T')[0]} />
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button disabled={saving} className="btn btn-dark rounded-4 flex-grow-1">
                                            {saving ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary rounded-4" onClick={() => setShowModal(false)}>Batal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
