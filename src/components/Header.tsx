import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { formatNumber } from '../lib/utils';

export const Header: React.FC<{ onAvatarClick: () => void }> = ({ onAvatarClick }) => {
    const { playerState, mail } = usePlayer();
    if (!playerState) return null;

    const hasUnreadMail = mail.some(m => !m.is_claimed);

    return (
        <header className="bg-jp-wood/80 backdrop-blur-sm p-3 sticky top-0 z-40 border-b-2 border-jp-wood-light">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-heading text-jp-gold">Fishing Lite</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-lg font-bold text-jp-gold">{formatNumber(playerState.coins)} 両</p>
                            <div className="flex gap-3 justify-end">
                                {playerState.stonehengeCrystals > 0 && 
                                    <p className="text-xs text-purple-400">{playerState.stonehengeCrystals} 💎</p>
                                }
                            </div>
                        </div>
                        <button onClick={onAvatarClick} className="relative w-12 h-12 bg-jp-wood-light rounded-full flex items-center justify-center text-3xl border-2 border-jp-gold hover:border-jp-cream transition-colors shadow-md">
                            {playerState.avatar}
                            {hasUnreadMail && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-jp-wood" />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};