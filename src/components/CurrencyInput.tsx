"use client";
import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Partial<React.InputHTMLAttributes<HTMLInputElement>> {
    name: string;
    defaultValue?: number | string;
}

export default function CurrencyInput({ name, defaultValue, className, required, placeholder, ...rest }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [rawValue, setRawValue] = useState('');

    useEffect(() => {
        if (defaultValue !== undefined && defaultValue !== null) {
            const num = defaultValue.toString().replace(/\D/g, '');
            if (num) {
                setRawValue(num);
                setDisplayValue(num.replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
            }
        }
    }, [defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Hanya ambil angka
        const num = val.replace(/\D/g, '');
        setRawValue(num);
        // Format dengan titik sebagai pemisah ribuan
        const formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        setDisplayValue(formatted);
    };

    return (
        <>
            {/* Input Tersembunyi (untuk FormData Server Action) */}
            <input type="hidden" name={name} value={rawValue} />
            {/* Input Tampilan ke User */}
            <input
                type="text"
                inputMode="numeric"
                className={className}
                required={required}
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
                {...rest}
            />
        </>
    );
}
