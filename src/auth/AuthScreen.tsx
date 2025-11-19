
import React, { useState } from 'react';
import { supabaseClient } from '../lib/supabase';
import { AVATARS, BASE_XP } from '../../constants';

export const AuthInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-jp-cream/80 mb-1">{label}</label>
        <input {...props} className="w-full p-3 bg-jp-wood-dark/50 rounded-lg border-2 border-jp-wood-light focus:outline-none focus:ring-2 focus:ring-jp-gold focus:border-jp-gold transition" />
    </div>
);

export const AuthButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button {...props} className="w-full bg-jp-red hover:bg-opacity-80 text-white font-bold text-base py-3 px-4 rounded-lg transition-all shadow-md disabled:bg-jp-wood-light disabled:cursor-not-allowed disabled:shadow-none">
        {children}
    </button>
);

export const AuthScreen: React.FC = () => {
    const [view, setView] = useState<'landing' | 'signIn' | 'signUp' | 'forgotPassword'>('landing');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (!playerName.trim()) {
            setError("Please enter a player name.");
            setLoading(false);
            return;
        }

        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    name: playerName.trim(),
                    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
                    level: 1, xp: 0, xpToNextLevel: BASE_XP, coins: 100, currentRodId: 0,
                    ownedRodIds: [0], backpack: [], backpackCapacity: 5500, collection: {},
                    currentMapId: 'etonia', stonehengeCrystals: 0, bait: 50,
                    isAutoFishing: false, activePotionEffects: {},
                    role: 'user',
                    rodEnchantments: {},
                    hasCompletedTutorial: false
                }
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Check your email for a confirmation link to complete registration.");
        }
        setLoading(false);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) setError(error.message);
        setLoading(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Check your email for a password reset link.");
        }
        setLoading(false);
    }
    
    const renderContent = () => {
        switch(view) {
            case 'signIn':
                return (
                    <>
                        <h2 className="text-3xl font-heading mb-2 text-white">Welcome Back!</h2>
                        <p className="text-jp-cream/70 mb-6">Sign in to continue your adventure.</p>
                        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                            <AuthInput label="Email" id="email-signin" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <AuthInput label="Password" id="password-signin" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            <AuthButton type="submit" disabled={loading}>{loading ? "Signing In..." : "Sign In"}</AuthButton>
                        </form>
                         <button onClick={() => setView('forgotPassword')} className="text-sm text-jp-gold/80 hover:underline mt-4">Forgot password?</button>
                         <p className="text-sm text-jp-cream/70 mt-6">
                            Don't have an account? <button onClick={() => setView('signUp')} className="font-semibold text-jp-gold hover:underline">Sign Up</button>
                        </p>
                    </>
                );
            case 'signUp':
                 return (
                    <>
                        <h2 className="text-3xl font-heading mb-2 text-white">Create Your Account</h2>
                        <p className="text-jp-cream/70 mb-6">Join the saga and become a legendary angler.</p>
                        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                            <AuthInput label="Player Name" id="player-name-signup" type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} maxLength={16} required />
                            <AuthInput label="Email" id="email-signup" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <AuthInput label="Password" id="password-signup" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                            <AuthButton type="submit" disabled={loading}>{loading ? "Creating Account..." : "Sign Up"}</AuthButton>
                        </form>
                        <p className="text-sm text-jp-cream/70 mt-6">
                            Already have an account? <button onClick={() => setView('signIn')} className="font-semibold text-jp-gold hover:underline">Sign In</button>
                        </p>
                    </>
                );
             case 'forgotPassword':
                return (
                    <>
                        <h2 className="text-3xl font-heading mb-2 text-white">Reset Password</h2>
                        <p className="text-jp-cream/70 mb-6">Enter your email to receive a password reset link.</p>
                        <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
                            <AuthInput label="Email" id="email-reset" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            <AuthButton type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</AuthButton>
                        </form>
                        <p className="text-sm text-jp-cream/70 mt-6">
                            Remember your password? <button onClick={() => setView('signIn')} className="font-semibold text-jp-gold hover:underline">Sign In</button>
                        </p>
                    </>
                );
            case 'landing':
            default:
                return (
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-heading mb-4 text-jp-gold">Fishing Lite</h1>
                        <p className="text-jp-cream/80 text-lg mb-10 max-w-xl mx-auto">An RNG-based fishing adventure. Upgrade your gear, test your luck, and catch legendary fish across vast worlds.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => setView('signIn')} className="bg-jp-red hover:bg-opacity-80 text-white font-bold text-lg py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg">Login</button>
                            <button onClick={() => setView('signUp')} className="bg-jp-wood-light hover:bg-opacity-80 border border-jp-wood-light/50 hover:border-jp-gold text-white font-bold text-lg py-3 px-8 rounded-lg transition-all hover:scale-105 shadow-lg">Register</button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
             <div className="w-full max-w-md bg-jp-wood/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border-2 border-jp-wood-light z-10">
                {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
                {message && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-md mb-4 text-sm">{message}</div>}
                {renderContent()}
            </div>
        </div>
    );
};