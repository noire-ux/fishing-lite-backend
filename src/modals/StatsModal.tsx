import React from 'react';
import { PotionType } from '../../types';
import { usePlayer } from '../context/PlayerContext';
import { RODS } from '../../constants';
import { ModalWrapper } from '../components/ModalWrapper';

export const StatsModal: React.FC<{ onClose: () => void; currentTime: number; }> = ({ onClose, currentTime }) => {
    const { playerState } = usePlayer();
    if (!playerState) return null;

    const currentRod = RODS.find(r => r.id === playerState.currentRodId)!;
    const now = currentTime;

    const luckyEffect = playerState.activePotionEffects[PotionType.Lucky];
    const luckyStacks = luckyEffect && luckyEffect.expiresAt > now ? luckyEffect.stacks : 0;
    const totalLuck = currentRod.luck + (luckyStacks * 50);

    const mutationEffect = playerState.activePotionEffects[PotionType.Mutation];
    const mutationStacks = mutationEffect && mutationEffect.expiresAt > now ? mutationEffect.stacks : 0;
    const totalMutationChance = (currentRod.luck / 500) + (mutationStacks * 0.33);

    return (
        <ModalWrapper title="Player Stats" onClose={onClose}>
            <div className="space-y-4 text-lg">
                <div className="flex justify-between">
                    <span className="text-jp-cream/80">Username:</span>
                    <span className="font-bold text-jp-gold">{playerState.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-jp-cream/80">Level:</span>
                    <span className="font-bold">{playerState.level}</span>
                </div>
                <div className="flex justify-between">
                     <span className="text-jp-cream/80">Total Luck:</span>
                     <span className="font-bold text-green-400">{totalLuck.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                     <span className="text-jp-cream/80">Mutation Chance:</span>
                     <span className="font-bold text-purple-400">{(totalMutationChance * 100).toFixed(2)}%</span>
                </div>
            </div>
        </ModalWrapper>
    );
};