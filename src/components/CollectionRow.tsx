import React from 'react';
import type { PlayerCollection, TierName } from '../../types';
import { getTierColorClass, formatNumber, getFishIcon } from '../lib/utils';

export const CollectionRow: React.FC<{ 
    fishName: string; 
    data: PlayerCollection[string]; 
    fishInfo: { name: string; tier: TierName; baseValue: number; } | undefined; 
}> = ({ fishName, data, fishInfo }) => {
    if (!fishInfo) return null;

    return (
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center p-2 rounded-lg hover:bg-jp-wood-light/50 transition-colors">
            <div className="text-2xl text-center w-8">{getFishIcon(fishName)}</div>
            <div className="font-semibold text-jp-cream truncate">{fishName}</div>
            <div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-slate-900 ${getTierColorClass(fishInfo.tier, 'bg')}`}>
                    {fishInfo.tier}
                </span>
            </div>
            <div className="text-right text-jp-cream/80 w-12">{data.count}</div>
            <div className="text-right text-jp-cream/80 w-24">{formatNumber(data.maxWeight)} kg</div>
        </div>
    );
};