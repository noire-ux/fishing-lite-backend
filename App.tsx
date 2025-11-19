import React, { useState, useEffect } from 'react';
import { useGameTime } from './src/hooks/useGameTime';
import { supabaseClient } from './src/lib/supabase';
import { AuthScreen } from './src/auth/AuthScreen';
import { VerificationSuccessView } from './src/auth/VerificationSuccessView';
import { ResetPasswordView } from './src/auth/ResetPasswordView';
import { Game } from './src/Game';
import { DynamicSky } from './src/components/DynamicSky';
import { PlayerProvider } from './src/context/PlayerContext';

// @ts-ignore
const { Session } = supabase;

const App: React.FC = () => {
    const [session, setSession] = useState<InstanceType<typeof Session> | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialAuthAction, setInitialAuthAction] = useState<'default' | 'verified' | 'resetPassword'>('default');
    const { hour, minute } = useGameTime();

    useEffect(() => {
        // Check URL hash once on load to handle email flows
        const hash = window.location.hash;
        if (hash.includes('type=signup')) {
            setInitialAuthAction('verified');
        } else if (hash.includes('type=recovery')) {
            setInitialAuthAction('resetPassword');
        }

        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
            // If the user is on the password reset page, don't change the session so the token stays valid
            if (_event === 'PASSWORD_RECOVERY') {
                setInitialAuthAction('resetPassword');
            } else {
                 setSession(session);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const renderContent = () => {
        if (initialAuthAction === 'verified') {
            return <VerificationSuccessView />;
        }
        if (initialAuthAction === 'resetPassword') {
            return <ResetPasswordView />;
        }
    
        if (loading) {
            return (
                 <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-jp-gold"></div>
                    <p className="text-lg text-jp-cream/80">Connecting to the server...</p>
                </div>
            );
        }
        
        if (!session) {
            return <AuthScreen />;
        }

        return (
            <PlayerProvider session={session}>
                <Game hour={hour} minute={minute} />
            </PlayerProvider>
        );
    };

    return (
        <div className="relative">
            <DynamicSky hour={hour} minute={minute} />
            <div className="relative z-10">
                {renderContent()}
            </div>
        </div>
    );
};

export default App;