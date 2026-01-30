"use client";

import React, { useState } from 'react';
import { addProperty } from './actions';
import { useActionState } from 'react';

export default function AddPropertyModal() {
    const [state, action, isPending] = useActionState(addProperty, null);
    const [images, setImages] = useState<string[]>([]);
    const [priceDisplay, setPriceDisplay] = useState('');
    const [priceValue, setPriceValue] = useState('');

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setPriceValue(raw);
        if (raw) {
            setPriceDisplay(new Intl.NumberFormat('id-ID').format(Number(raw)));
        } else {
            setPriceDisplay('');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="modal fade" id="newPropertyModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header bg-dark text-white border-0 py-3">
                        <h6 className="modal-title fw-bold">Tambah Listing Properti Baru</h6>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" id="close-modal-btn"></button>
                    </div>
                    <div className="modal-body p-4">
                        <form action={action} className="row g-3">
                            <input type="hidden" name="images" value={JSON.stringify(images)} />

                            <div className="col-12">
                                <label className="form-label small fw-bold text-secondary text-uppercase">Informasi Utama</label>
                                <input name="title" required className="form-control form-control-lg rounded-4 border-2" placeholder="Nama Properti (ex: Grand Permata Residence)" />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">Harga (IDR)</label>
                                <input
                                    type="text"
                                    required
                                    value={priceDisplay}
                                    onChange={handlePriceChange}
                                    className="form-control form-control-lg rounded-4 border-2"
                                    placeholder="1.500.000.000"
                                />
                                <input type="hidden" name="price" value={priceValue} />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">Lokasi / Area</label>
                                <input name="location" required className="form-control form-control-lg rounded-4 border-2" placeholder="Contoh: BSD City, Tangerang" />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-secondary">Luas Tanah (m²)</label>
                                <input name="landArea" type="number" className="form-control form-control-lg rounded-4 border-2" placeholder="120" />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-secondary">Luas Bangunan (m²)</label>
                                <input name="buildingArea" type="number" className="form-control form-control-lg rounded-4 border-2" placeholder="90" />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-secondary">Tahun Dibangun</label>
                                <input name="yearBuilt" type="number" className="form-control form-control-lg rounded-4 border-2" placeholder="2023" />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">Legalitas</label>
                                <select name="legality" className="form-select form-select-lg rounded-4 border-2">
                                    <option value="SHM">SHM (Sertifikat Hak Milik)</option>
                                    <option value="HGB">HGB (Hak Guna Bangunan)</option>
                                    <option value="Lainnya">Lainnya / Surat Ijo / Girik</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">Status Listing</label>
                                <select name="status" className="form-select form-select-lg rounded-4 border-2">
                                    <option value="AVAILABLE">Tersedia (Available)</option>
                                    <option value="SOLD">Terjual (Sold)</option>
                                    <option value="RENTED">Disewakan (Rented)</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold text-secondary">Fasilitas / Spesifikasi</label>
                                <textarea name="features" className="form-control rounded-4 border-2" rows={2} placeholder="3 Kamar Tidur, 2 Kamar Mandi, Kolam Renang, CCTV..."></textarea>
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold text-secondary">Deskripsi Pendek</label>
                                <textarea name="description" className="form-control rounded-4 border-2" rows={2} placeholder="Ceritakan keunggulan properti ini..."></textarea>
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold text-secondary d-block">Galeri Foto</label>
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                    {images.map((img, i) => (
                                        <div key={i} className="position-relative" style={{ width: '80px', height: '80px' }}>
                                            <img src={img} className="w-100 h-100 object-fit-cover rounded-3 border" alt="preview" />
                                            <button type="button" onClick={() => removeImage(i)} className="position-absolute top-0 end-0 btn btn-danger btn-sm p-0 rounded-circle" style={{ width: '20px', height: '20px', marginTop: '-8px', marginRight: '-8px' }}>×</button>
                                        </div>
                                    ))}
                                    <label className="btn btn-outline-dark d-flex flex-column align-items-center justify-content-center border-dashed rounded-3" style={{ width: '80px', height: '80px', borderStyle: 'dashed' }}>
                                        <ion-icon name="camera-outline" style={{ fontSize: '24px' }}></ion-icon>
                                        <span className="small mt-1">Upload</span>
                                        <input type="file" multiple accept="image/*" className="d-none" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <div className="small text-secondary">Tips: Foto pertama akan menjadi cover utama.</div>
                            </div>

                            {state?.message && <div className="col-12 text-danger small bg-danger-subtle p-2 rounded-3">{state.message}</div>}

                            <div className="col-12 d-flex gap-2 mt-2">
                                <button disabled={isPending} className="btn btn-dark btn-lg rounded-4 flex-grow-1 py-3 fw-bold">
                                    {isPending ? 'Proses Menyimpan...' : 'Tayangkan Properti'}
                                </button>
                                <button type="button" className="btn btn-outline-secondary btn-lg rounded-4 px-4" data-bs-dismiss="modal">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
