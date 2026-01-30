import { Utils } from './utils';

export interface Agency {
    id: string;
    name: string;
    licenseNo: string;
    whatsappDefault: string;
    createdAt: string;
}

export interface User {
    id: string;
    agencyId: string;
    name: string;
    phone: string;
    email: string;
    pin: string;
    role: string;
    createdAt: string;
}

export interface Property {
    id: string;
    agencyId: string;
    name: string;
    slug: string;
    price: number;
    status: string;
    location: string;
    description: string;
    landArea: number | null;
    buildingArea: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    electricity: number | null;
    facing: string;
    yearBuilt: number | null;
    legality: string;
    photos: { id: string; dataUrl: string; sort: number }[];
    attachments: { id: string; name: string; size: number; type: string }[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Client {
    id: string;
    agencyId: string;
    name: string;
    whatsapp: string;
    prospect: string;
    budgetMin: number | null;
    budgetMax: number | null;
    prefLocation: string;
    lastContactAt: string | null;
    createdAt: string;
    interactions: { id: string; at: string; note: string }[];
}

export interface Activity {
    id: string;
    agencyId: string;
    at: string;
    type: string;
    by: string;
    refId: string | null;
    text: string;
}

export interface AppData {
    agencies: Agency[];
    users: User[];
    properties: Property[];
    clients: Client[];
    activity: Activity[];
}

export class LocalDB {
    keys = { DATA: 'ap.data', SESSION: 'ap.session' };

    load(): AppData {
        if (typeof window === 'undefined') return this.blankData();
        const raw = localStorage.getItem(this.keys.DATA);
        if (raw) {
            try { return JSON.parse(raw); } catch { }
        }
        const seeded = this.defaultData();
        this.save(seeded);
        return seeded;
    }

    save(data: AppData) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.keys.DATA, JSON.stringify(data));
    }

    reset() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.keys.DATA);
        localStorage.removeItem(this.keys.SESSION);
    }

    blankData(): AppData {
        return { agencies: [], users: [], properties: [], clients: [], activity: [] };
    }

    defaultData(): AppData {
        const agencyId = Utils.uid();
        const adminId = Utils.uid();

        const property1: Property = {
            id: Utils.uid(), agencyId,
            name: 'Rumah Modern Minimalis Dekat Tol',
            slug: 'rumah-modern-minimalis-dekat-tol',
            price: 1450000000,
            status: 'Available',
            location: 'Bekasi • Jatiasih',
            description: 'Rumah siap huni, akses cepat ke tol, lingkungan aman.\nCocok untuk keluarga muda.',
            landArea: 90, buildingArea: 120,
            bedrooms: 3, bathrooms: 2,
            electricity: 2200,
            facing: 'Timur',
            yearBuilt: 2022,
            legality: 'SHM',
            photos: [
                { id: Utils.uid(), dataUrl: Utils.demoImg('Modern House', '#0f172a', '#ffffff'), sort: 0 },
                { id: Utils.uid(), dataUrl: Utils.demoImg('Living Room', '#0b3b3c', '#e2e8f0'), sort: 1 },
                { id: Utils.uid(), dataUrl: Utils.demoImg('Kitchen', '#4c1d95', '#f8fafc'), sort: 2 },
            ],
            attachments: [
                { id: Utils.uid(), name: 'Sertifikat_SHM.pdf', size: 234512, type: 'application/pdf' }
            ],
            createdBy: adminId,
            createdAt: Utils.nowISO(), updatedAt: Utils.nowISO(),
        };

        const property2: Property = {
            id: Utils.uid(), agencyId,
            name: 'Villa View Laut — Semi Furnished',
            slug: 'villa-view-laut-semi-furnished',
            price: 5200000000,
            status: 'Sold',
            location: 'Bali • Jimbaran',
            description: 'Villa view laut, 10 menit ke pantai.\nCocok untuk investasi dan homestay.',
            landArea: 200, buildingArea: 180,
            bedrooms: 4, bathrooms: 3,
            electricity: 4400,
            facing: 'Barat',
            yearBuilt: 2019,
            legality: 'HGB',
            photos: [
                { id: Utils.uid(), dataUrl: Utils.demoImg('Villa', '#0f172a', '#ffffff'), sort: 0 },
                { id: Utils.uid(), dataUrl: Utils.demoImg('Pool', '#064e3b', '#ecfeff'), sort: 1 },
            ],
            attachments: [],
            createdBy: adminId,
            createdAt: Utils.nowISO(), updatedAt: Utils.nowISO(),
        };

        const client1: Client = {
            id: Utils.uid(), agencyId,
            name: 'Andi Pratama',
            whatsapp: '6281234567890',
            prospect: 'Warm',
            budgetMin: 1200000000,
            budgetMax: 1700000000,
            prefLocation: 'Bekasi',
            lastContactAt: Utils.nowISO(),
            createdAt: Utils.nowISO(),
            interactions: [
                { id: Utils.uid(), at: Utils.nowISO(), note: 'Sudah telepon. Tertarik rumah minimalis dekat tol, minta video walkthrough.' }
            ]
        };

        const client2: Client = {
            id: Utils.uid(), agencyId,
            name: 'Siti Aisyah',
            whatsapp: '6287772221111',
            prospect: 'Hot',
            budgetMin: 4500000000,
            budgetMax: 6000000000,
            prefLocation: 'Bali',
            lastContactAt: Utils.nowISO(),
            createdAt: Utils.nowISO(),
            interactions: [
                { id: Utils.uid(), at: Utils.nowISO(), note: 'Chat WA: siap survey minggu depan, fokus villa view laut.' }
            ]
        };

        return {
            agencies: [{ id: agencyId, name: 'AsanaPro Demo Agency', licenseNo: 'AP-2026-0001', whatsappDefault: '6281230001111', createdAt: Utils.nowISO() }],
            users: [{ id: adminId, agencyId, name: 'Admin Demo', phone: '6281230001111', email: 'demo@asanapro.id', pin: '123456', role: 'Admin', createdAt: Utils.nowISO() }],
            properties: [property1, property2],
            clients: [client1, client2],
            activity: [
                { id: Utils.uid(), agencyId, at: Utils.nowISO(), type: 'property.create', by: adminId, refId: property1.id, text: `Upload properti: ${property1.name}` },
                { id: Utils.uid(), agencyId, at: Utils.nowISO(), type: 'client.interaction', by: adminId, refId: client1.id, text: `Catat interaksi klien: ${client1.name}` },
            ]
        };
    }
}

export class Session {
    db: LocalDB;
    key: string;

    constructor(db: LocalDB) {
        this.db = db;
        this.key = db.keys.SESSION;
    }

    get() {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(this.key);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    }

    set(s: { userId: string }) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.key, JSON.stringify(s));
    }

    clear() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.key);
    }
}

export class ActivityService {
    db: LocalDB;
    constructor(db: LocalDB) { this.db = db; }

    add({ agencyId, by, type, refId, text }: { agencyId: string, by: string, type: string, refId?: string | null, text?: string }) {
        const d = this.db.load();
        d.activity = d.activity || [];
        d.activity.unshift({ id: Utils.uid(), agencyId, at: Utils.nowISO(), type, by, refId: refId || null, text: text || type });
        d.activity = d.activity.slice(0, 50);
        this.db.save(d);
    }
}

export const db = new LocalDB();
export const session = new Session(db);
export const activityService = new ActivityService(db);
