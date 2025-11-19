
import React, { useState, useEffect, useRef } from 'react';
import type { GameView } from '../types';
import { usePlayer } from './context/PlayerContext';
import { Header } from './components/Header';
import { Notification } from './components/Notification';
import { FishCaughtPopup } from './components/FishCaughtPopup';
import { ProfilePopup } from './modals/ProfilePopup';
import { StatsModal } from './modals/StatsModal';
import { CollectionModal } from './modals/CollectionModal';
import { MailModal } from './modals/MailModal';
import { SettingsModal } from './modals/SettingsModal';
import { AvatarChangerModal } from './modals/AvatarChangerModal';
import { PurchaseConfirmationModal } from './modals/PurchaseConfirmationModal';
import { FishingView } from './views/FishingView';
import { InfoView } from './views/InfoView';
import { BackpackView } from './views/BackpackView';
import { ShopView } from './views/ShopView';
import { MapView } from './views/MapView';
import { AdminView } from './views/AdminView';
import { EnchantingView } from './views/EnchantingView';
import { GlobalChat } from './components/GlobalChat';
import { WhatsAppIcon, InstagramIcon, DiscordIcon } from './components/icons';
import { supabaseClient } from './lib/supabase';
import { TutorialOverlay } from './components/TutorialOverlay';
import { usePushNotifications } from './hooks/usePushNotifications';

export const Game: React.FC<{ hour: number; minute: number; }> = ({ hour, minute }) => {
    const [view, setView] = useState<GameView>('FISHING');
    const { playerState, loading, notification, lastCaughtFish, mail, actions } = usePlayer();
    const { isSubscribed, subscribeUser } = usePushNotifications(playerState?.userId || null);
    const [currentTime, setCurrentTime] = useState(Date.now());
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isAvatarChangerOpen, setIsAvatarChangerOpen] = useState(false);
    const [isCollectionOpen, setIsCollectionOpen] = useState(false);
    const [isMailOpen, setIsMailOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [confirmPurchase, setConfirmPurchase] = useState<{ item: { name: string; price: string | number; }; onConfirm: () => void; } | null>(null);

    const [isMuted, setIsMuted] = useState(() => JSON.parse(localStorage.getItem('isMuted') || 'false'));
    const [volume, setVolume] = useState(() => JSON.parse(localStorage.getItem('volume') || '0.2'));
    const [isFpsBoostEnabled, setIsFpsBoostEnabled] = useState(() => JSON.parse(localStorage.getItem('isFpsBoostEnabled') || 'false'));
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    useEffect(() => {
        audioRef.current = document.getElementById('bg-music') as HTMLAudioElement;
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
            audioRef.current.play().catch(e => {
                console.log("Autoplay was prevented. User interaction is needed to start music.");
            });
        }
    }, []); 

    useEffect(() => {
        localStorage.setItem('isMuted', JSON.stringify(isMuted));
        if (audioRef.current) audioRef.current.muted = isMuted;
    }, [isMuted]);

    useEffect(() => {
        localStorage.setItem('volume', JSON.stringify(volume));
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        localStorage.setItem('isFpsBoostEnabled', JSON.stringify(isFpsBoostEnabled));
        document.body.classList.toggle('fps-boost-enabled', isFpsBoostEnabled);
    }, [isFpsBoostEnabled]);

    const handleToggleMute = () => {
        setIsMuted(prevMuted => {
            const newMutedState = !prevMuted;
            if (audioRef.current) {
                audioRef.current.muted = newMutedState;
                if (!newMutedState && audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Audio play failed:", e));
                }
            }
            return newMutedState;
        });
    };

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
    };

    if (loading || !playerState) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent gap-4">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-jp-gold"></div>
                <p className="text-lg text-jp-cream/80">Loading your angling data...</p>
            </div>
        );
    }
    
    const renderView = () => {
        switch (view) {
            case 'FISHING': 
                if (playerState.currentMapId === 'altar') {
                    return <EnchantingView />;
                }
                return <FishingView currentTime={currentTime} gameHour={hour} gameMinute={minute} />;
            case 'INFO': return <InfoView />;
            case 'BACKPACK': return <BackpackView />;
            case 'SHOP': return <ShopView onPurchaseRequest={setConfirmPurchase} />;
            case 'MAPS': return <MapView />;
            case 'ADMIN': return <AdminView />;
            default: return <FishingView currentTime={currentTime} gameHour={hour} gameMinute={minute} />;
        }
    };
    
    const navItems: { name: GameView, label: string, icon: string }[] = [
        { name: 'FISHING', label: 'Fish', icon: '釣' },
        { name: 'INFO', label: 'Info', icon: '巻' },
        { name: 'BACKPACK', label: 'Bag', icon: '袋' },
        { name: 'SHOP', label: 'Shop', icon: '店' },
        { name: 'MAPS', label: 'Maps', icon: '図' },
    ];

    if (playerState.role === 'admin') {
        navItems.push({ name: 'ADMIN', label: 'Admin', icon: '印' });
    }

    // Tutorial check: explicitly check for false. undefined means it's an old account (skip tutorial).
    const showTutorial = playerState.hasCompletedTutorial === false;
        
    return (
        <div className="min-h-screen flex flex-col relative bg-transparent">
            {showTutorial && <TutorialOverlay onComplete={actions.completeTutorial} onRequestViewChange={setView} />}
            
            <Notification message={notification} />
            <FishCaughtPopup fish={lastCaughtFish} />

            {confirmPurchase && <PurchaseConfirmationModal item={confirmPurchase.item} onConfirm={confirmPurchase.onConfirm} onClose={() => setConfirmPurchase(null)} />}
            {isProfileOpen && <ProfilePopup 
                onClose={() => setIsProfileOpen(false)} 
                onLogout={() => { setIsProfileOpen(false); handleLogout(); }}
                onStatsClick={() => { setIsProfileOpen(false); setIsStatsOpen(true); }}
                onMailClick={() => { setIsProfileOpen(false); setIsMailOpen(true); }}
                onChangeAvatarClick={() => { setIsProfileOpen(false); setIsAvatarChangerOpen(true); }}
                onCollectionClick={() => { setIsProfileOpen(false); setIsCollectionOpen(true); }}
                onSettingsClick={() => { setIsProfileOpen(false); setIsSettingsOpen(true); }}
            />}
            {isStatsOpen && <StatsModal onClose={() => setIsStatsOpen(false)} currentTime={currentTime} />}
            {isCollectionOpen && <CollectionModal onClose={() => setIsCollectionOpen(false)} />}
            {isMailOpen && <MailModal mail={mail} onClose={() => setIsMailOpen(false)} />}
            {isSettingsOpen && <SettingsModal 
                onClose={() => setIsSettingsOpen(false)} 
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                volume={volume}
                onVolumeChange={setVolume}
                isFpsBoostEnabled={isFpsBoostEnabled}
                onToggleFpsBoost={() => setIsFpsBoostEnabled(prev => !prev)}
                onResetTutorial={actions.resetTutorial}
                isPushEnabled={isSubscribed}
                onEnablePush={subscribeUser}
            />}
            {isAvatarChangerOpen && <AvatarChangerModal onClose={() => setIsAvatarChangerOpen(false)} />}

            <Header onAvatarClick={() => setIsProfileOpen(prev => !prev)} />

            <main className="flex-grow container mx-auto">
                {renderView()}
            </main>

            <GlobalChat />

            <footer className="sticky bottom-0 z-40">
                {view === 'INFO' && (
                    <div className="bg-jp-wood-dark/60 backdrop-blur-sm p-3 border-t-2 border-jp-wood">
                        <div className="container mx-auto flex justify-center items-center gap-8 text-jp-cream">
                            <a href="https://whatsapp.com/channel/0029Valfljv2phHS7yHJ6W1N" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-jp-wood-light transition-colors" aria-label="WhatsApp Community"><WhatsAppIcon /></a>
                            <a href="https://www.instagram.com/snn2ndd_?igsh=czVyZzYxcmI0NW9l" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-jp-wood-light transition-colors" aria-label="Instagram Page"><InstagramIcon /></a>
                            <a href="https://discord.gg/jFjkjwCz" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-jp-wood-light transition-colors" aria-label="Discord Server"><DiscordIcon /></a>
                        </div>
                    </div>
                )}
                <div className="bg-jp-wood/80 backdrop-blur-sm p-2 border-t-2 border-jp-wood-light/50">
                    <nav className="container mx-auto flex justify-around">
                        {navItems.map(item => (
                            <button
                                key={item.name}
                                onClick={() => setView(item.name)}
                                className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-20 group ${view === item.name ? 'text-jp-gold' : 'hover:bg-jp-wood-light/50 text-jp-cream/70 hover:text-jp-cream'}`}
                            >
                                <span className="text-2xl font-heading">{item.icon}</span>
                                <span className="text-xs mt-1">{item.label}</span>
                                <span className={`absolute -bottom-2 h-1 w-12 bg-jp-gold rounded-full transition-all duration-300 ${view === item.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                            </button>
                        ))}
                    </nav>
                </div>
            </footer>
        </div>
    );
};
