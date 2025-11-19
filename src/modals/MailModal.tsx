import React from 'react';
import type { Mail } from '../../types';
import { usePlayer } from '../context/PlayerContext';
import { formatNumber } from '../lib/utils';
import { ModalWrapper } from '../components/ModalWrapper';

export const MailModal: React.FC<{ mail: Mail[]; onClose: () => void; }> = ({ mail, onClose }) => {
    const { actions } = usePlayer();
    
    const renderReward = (reward: keyof Mail['rewards'], value: number) => {
        let icon = '', color = 'text-white';
        switch (reward) {
            case 'coins': icon = '両'; color = 'text-jp-gold'; break;
            case 'bait': icon = '🎣'; color = 'text-amber-400'; break;
            case 'stonehengeCrystals': icon = '💎'; color = 'text-purple-400'; break;
        }
        return <span key={reward} className={`font-semibold ${color}`}>{formatNumber(value)} {icon}</span>;
    }

    const hasRewards = (rewards: Mail['rewards']) => {
        if (!rewards || Object.keys(rewards).length === 0) return false;
        return (rewards.coins || 0) > 0 || (rewards.bait || 0) > 0 || (rewards.stonehengeCrystals || 0) > 0;
    };
    
    const hasClaimedMail = mail.some(m => m.is_claimed);

    return (
        <ModalWrapper title="Mailbox" onClose={onClose} className="max-w-2xl">
            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                {mail.length === 0 ? (
                    <p className="text-center text-jp-cream/70 py-16">Your mailbox is empty.</p>
                ) : (
                    mail.map(m => {
                        const mailHasRewards = hasRewards(m.rewards);
                        return (
                        <div key={m.id} className={`p-4 rounded-lg border ${m.is_claimed ? 'border-jp-wood-light bg-jp-wood/50' : 'border-jp-gold/50 bg-jp-wood'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-white font-heading">{m.subject}</h3>
                                    <p className="text-xs text-jp-cream/60">From: {m.sender_name} - {new Date(m.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    {m.is_claimed ? (
                                        <>
                                            <span className="px-3 py-1 text-sm font-semibold rounded-md bg-jp-wood-light text-jp-cream/70">{mailHasRewards ? 'Claimed' : 'Read'}</span>
                                            <button onClick={() => actions.deleteMail(m.id)} className="px-3 py-1 bg-jp-red hover:bg-opacity-80 rounded-md text-sm font-semibold">Delete</button>
                                        </>
                                    ) : (
                                        <button onClick={() => actions.claimMail(m)} className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${mailHasRewards ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                             {mailHasRewards ? 'Claim' : 'Mark as Read'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-jp-cream/90 my-3">{m.body}</p>
                            {mailHasRewards && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 p-3 bg-jp-wood-dark/50 rounded-md border border-jp-wood-light">
                                    {/* FIX: The value from Object.entries can be unknown or undefined. Ensure it's a number before passing to renderReward. */}
                                    {Object.entries(m.rewards).map(([key, value]) => {
                                        if (typeof value === 'number') {
                                            return renderReward(key as keyof Mail['rewards'], value);
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </div>
                    )})
                )}
            </div>
             {mail.length > 0 && (
                <div className="mt-6 text-right">
                    <button onClick={actions.deleteAllClaimedMail} disabled={!hasClaimedMail} className="px-4 py-2 bg-jp-wood-light hover:bg-opacity-80 rounded-md font-semibold text-sm disabled:bg-opacity-50 disabled:text-jp-cream/50 disabled:cursor-not-allowed">
                        Delete All Claimed
                    </button>
                </div>
            )}
        </ModalWrapper>
    );
};