import React, { useEffect } from 'react';

export const VerificationSuccessView: React.FC = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = window.location.origin; // Redirect to login
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-jp-wood/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border-2 border-jp-wood-light text-center">
                <svg className="w-24 h-24 mx-auto" viewBox="0 0 52 52">
                    <circle className="animate-draw-circle" cx="26" cy="26" r="25" fill="none" stroke="#22c55e" strokeWidth="4" style={{ strokeDasharray: 166, strokeDashoffset: 166 }}/>
                    <path className="animate-draw-check" fill="none" stroke="#22c55e" strokeWidth="5" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ strokeDasharray: 48, strokeDashoffset: 48 }}/>
                </svg>
                <h2 className="text-3xl font-heading mt-4 text-white">Verifikasi Berhasil!</h2>
                <p className="text-jp-cream/80 mt-2">Akun Anda telah berhasil diverifikasi.</p>
                <p className="text-jp-cream/70 mt-4 text-sm">Anda akan dialihkan ke halaman login dalam 5 detik...</p>
            </div>
        </div>
    );
};
