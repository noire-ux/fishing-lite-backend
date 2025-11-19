import React, { useState } from 'react';
import { supabaseClient } from '../lib/supabase';
import { AuthInput, AuthButton } from './AuthScreen';

export const ResetPasswordView: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError("Kata sandi tidak cocok.");
            return;
        }
        if (password.length < 6) {
            setError("Kata sandi harus terdiri dari minimal 6 karakter.");
            return;
        }
        
        setLoading(true);
        const { error } = await supabaseClient.auth.updateUser({ password });
        
        if (error) {
            setError(`Gagal memperbarui kata sandi: ${error.message}`);
        } else {
            setMessage("Kata sandi berhasil diperbarui! Mengalihkan ke halaman login...");
            setTimeout(() => {
                window.location.href = window.location.origin;
            }, 3000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-jp-wood/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border-2 border-jp-wood-light z-10">
                {message ? (
                    <div className="text-center">
                        <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-md mb-4 text-sm">{message}</div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-heading mb-2 text-white">Atur Ulang Kata Sandi</h2>
                        <p className="text-jp-cream/70 mb-6">Masukkan kata sandi baru Anda.</p>
                        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
                        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
                            <AuthInput label="Kata Sandi Baru" id="password-reset" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                            <AuthInput label="Konfirmasi Kata Sandi Baru" id="confirm-password-reset" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                            <AuthButton type="submit" disabled={loading}>{loading ? "Memperbarui..." : "Perbarui Kata Sandi"}</AuthButton>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
