"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../actions';

export default function ReportsRedirect() {
    const router = useRouter();

    useEffect(() => {
        getSession().then(s => {
            if (s?.role === 'ADMIN') router.replace('/app/admin/reports');
            else router.replace('/app/dashboard');
        });
    }, [router]);

    return <div className="p-4 text-secondary">Mengalihkan...</div>;
}
