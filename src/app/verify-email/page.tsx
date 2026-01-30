"use client";
import { useActionState, useState, useRef, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { verifyOTP, resendOTP, getPendingVerificationUser } from '../actions';

export default function VerifyEmailPage() {
    const [state, action, isPending] = useActionState(verifyOTP, null);
    const [resendMessage, setResendMessage] = useState('');
    const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null);
    const [isResending, setIsResending] = useState(false);

    // OTP Input refs
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

    useEffect(() => {
        // Get user info
        getPendingVerificationUser().then((user) => {
            if (user) setUserInfo(user);
        });

        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value.slice(-1); // Only take last character
        setOtpValues(newOtpValues);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (newOtpValues.every(v => v) && index === 5) {
            const formData = new FormData();
            formData.append('otp', newOtpValues.join(''));
            // We need to use the action which requires FormData
            const form = document.getElementById('otp-form') as HTMLFormElement;
            if (form) form.requestSubmit();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtpValues = [...otpValues];

        for (let i = 0; i < pastedData.length; i++) {
            newOtpValues[i] = pastedData[i];
        }

        setOtpValues(newOtpValues);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();

        // Auto-submit if complete
        if (pastedData.length === 6) {
            const formData = new FormData();
            formData.append('otp', pastedData);
            const form = document.getElementById('otp-form') as HTMLFormElement;
            if (form) setTimeout(() => form.requestSubmit(), 100);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setResendMessage('');
        const result = await resendOTP();
        setIsResending(false);

        if (result.success) {
            setResendMessage(result.message || 'Kode OTP baru telah dikirim!');
            setTimeout(() => setResendMessage(''), 5000);
        } else {
            setResendMessage(result.message || 'Gagal mengirim kode OTP');
        }
    };

    const maskedEmail = userInfo?.email
        ? userInfo.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
        : '';

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
            <div className="ap-card card border-0 shadow-sm" style={{ maxWidth: '480px', width: '100%' }}>
                <div className="card-body p-4">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '64px', height: '64px' }}>
                            <svg width="32" height="32" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
                            </svg>
                        </div>
                        <h1 className="h4 fw-bold mt-3 mb-2">Verifikasi Email Anda</h1>
                        <p className="text-secondary small mb-0">
                            Kami telah mengirim kode 6-digit ke<br />
                            <span className="fw-semibold text-dark">{maskedEmail}</span>
                        </p>
                    </div>

                    {/* OTP Form */}
                    <form id="otp-form" className="mt-4" action={action}>
                        <input type="hidden" name="otp" value={otpValues.join('')} />

                        <div className="d-flex gap-2 justify-content-center mb-3">
                            {otpValues.map((value, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={value}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="form-control form-control-lg text-center fw-bold rounded-3"
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        fontSize: '24px',
                                        caretColor: 'transparent'
                                    }}
                                    disabled={isPending}
                                />
                            ))}
                        </div>

                        {state?.message && (
                            <div className="alert alert-danger small py-2 mb-3" role="alert">
                                {state.message}
                            </div>
                        )}

                        {resendMessage && (
                            <div className="alert alert-info small py-2 mb-3" role="alert">
                                {resendMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending || otpValues.some(v => !v)}
                            className="btn btn-dark btn-lg rounded-4 w-100 mb-3"
                        >
                            {isPending ? 'Memverifikasi...' : 'Verifikasi Email'}
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="text-center">
                        <p className="small text-secondary mb-2">
                            Tidak menerima kode?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="btn btn-link text-dark fw-semibold text-decoration-none p-0"
                        >
                            {isResending ? 'Mengirim...' : 'Kirim Ulang Kode'}
                        </button>
                    </div>

                    <div className="mt-4 pt-3 border-top text-center">
                        <Link href="/login" className="small text-dark fw-semibold text-decoration-none">
                            ← Kembali ke Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
