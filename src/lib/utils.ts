export class Utils {
    static esc(s: any) {
        return (s ?? '').toString().replace(/[&<>"']/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
    }
    static fmtIDR(n: any) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n || 0));
    }
    static slugify(input: any) {
        return (input || '').toString().trim().toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    static uid() {
        return (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ('id_' + Math.random().toString(16).slice(2) + Date.now().toString(16)));
    }
    static nowISO() { return new Date().toISOString(); }
    static fmtDate(iso: any) {
        if (!iso) return '-';
        const d = new Date(iso);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
    }
    static fmtShort(iso: any) {
        if (!iso) return '-';
        const d = new Date(iso);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(d);
    }
    static demoImg(label: string, bg = '#0f172a', fg = '#e2e8f0') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bg}"/>
          <stop offset="1" stop-color="#111827"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)"/>
      <circle cx="980" cy="220" r="120" fill="#ffffff10"/>
      <circle cx="220" cy="640" r="160" fill="#ffffff10"/>
      <text x="60" y="120" font-family="ui-sans-serif" font-size="64" fill="${fg}" font-weight="700">${label}</text>
      <text x="60" y="190" font-family="ui-sans-serif" font-size="28" fill="#cbd5e1">AsanaPro Professional Link</text>
    </svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    static readAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }
}
