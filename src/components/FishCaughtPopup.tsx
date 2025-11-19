import React from 'react';
import type { Fish } from '../../types';
import { getTierColorClass, formatNumber, getFishIcon } from '../lib/utils';

export const FishCaughtPopup: React.FC<{ fish: Fish | null }> = ({ fish }) => {
    if (!fish) return null;

    const icon = getFishIcon(fish.name);

    return (
        <div 
            key={fish.id}
            className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-lg shadow-xl border-2 ${getTierColorClass(fish.tier, 'border')} bg-jp-wood/90 backdrop-blur-sm animate-catch-popup`}
        >
            <span className="text-4xl">{icon}</span>
            <div className="text-left">
                <h3 className="text-xl font-bold text-jp-cream font-heading">{fish.name}</h3>
                <p className="text-lg text-jp-cream/80">{formatNumber(fish.weight)} Kg.</p>
            </div>
        </div>
    );
};