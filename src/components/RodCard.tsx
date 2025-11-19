import React from 'react';
import type { FishingRod, Enchantment, PlayerState } from '../../types';
import { calculateEnchantedStats, formatNumber } from '../lib/utils';

const RodVisual: React.FC<{ rod: FishingRod }> = ({ rod }) => {
    const gradientId = `rod-gradient-${rod.id}`;
    return (
        <div className="h-48 w-full flex items-center justify-center my-2">
            <svg width="24" height="180" viewBox="0 0 24 180" className="mx-auto -rotate-12">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={rod.color} />
                        <stop offset="50%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="100%" stopColor={rod.color} />
                    </linearGradient>
                </defs>
                <rect x="9" y="0" width="6" height="180" fill={rod.color} />
                <rect x="9" y="0" width="6" height="180" fill={`url(#${gradientId})`} />
                <rect x="8" y="30" width="8" height="3" fill="#6d4c41" rx="1" />
                <rect x="8" y="80" width="8" height="3" fill="#6d4c41" rx="1" />
                <rect x="8" y="130" width="8" height="3" fill="#6d4c41" rx="1" />
                <rect x="7" y="150" width="10" height="30" fill="#4e342e" rx="2" />
            </svg>
        </div>
    );
};

export const RodCard: React.FC<{ 
    rod: FishingRod; 
    player: PlayerState; 
    onBuy: (id: number) => void; 
    onEquip: (id: number) => void; 
    onInfoClick: (rod: FishingRod, enchantments: Enchantment[]) => void; 
    enchantments: Enchantment[]; 
    onPurchaseRequest: (details: { item: { name: string; price: string | number; }; onConfirm: () => void; }) => void; 
}> = ({ rod, player, onBuy, onEquip, onInfoClick, enchantments, onPurchaseRequest }) => {
    const isOwned = player.ownedRodIds.includes(rod.id);
    const isEquipped = player.currentRodId === rod.id;
    const stats = calculateEnchantedStats(rod, enchantments);

    let canAcquire = false;
    if (typeof rod.price === 'number') canAcquire = player.coins >= rod.price;
    else if (rod.price.includes("Stonehenge")) canAcquire = player.stonehengeCrystals >= parseInt(rod.price.split(" ")[0]);
    else if (rod.price.startsWith("Lv.")) canAcquire = player.level >= rod.levelReq;

    const priceString = typeof rod.price === 'number' ? `${formatNumber(rod.price)} 両` : rod.price;

    return (
        <div className={`relative flex-shrink-0 w-64 bg-jp-wood border-2 rounded-xl shadow-lg flex flex-col p-4 snap-start transition-all duration-300 ${isEquipped ? 'border-jp-gold shadow-jp-gold/20' : 'border-jp-wood-light'}`}>
            <button onClick={() => onInfoClick(rod, enchantments)} className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-jp-wood-light/50 hover:bg-jp-wood-light rounded-full text-lg font-bold text-jp-gold transition-colors">i</button>
            <h3 className="text-xl font-heading text-center truncate text-jp-cream">{rod.name}</h3>
            <p className="text-xs text-jp-cream/60 text-center mb-1 h-4">Lv. {rod.levelReq} Req.</p>
            <RodVisual rod={rod} />
            <div className="my-2 space-y-1 text-sm text-jp-cream/80">
                <div className="flex justify-between"><span>Luck:</span> <span className="font-semibold text-white">{stats.luck}% {stats.bonuses.luck > 0 && <span className="text-fuchsia-400">(+{stats.bonuses.luck})</span>}</span></div>
                <div className="flex justify-between"><span>Speed:</span> <span className="font-semibold text-white">{stats.speed}% {stats.bonuses.speed > 0 && <span className="text-fuchsia-400">(+{stats.bonuses.speed})</span>}</span></div>
                <div className="flex justify-between"><span>Kg. Maks:</span> <span className="font-semibold text-white">{formatNumber(stats.maxWeight)} {stats.bonuses.weight > 0 && <span className="text-fuchsia-400">(+{rod.maxWeight * (stats.bonuses.weight/100)})</span>}</span></div>
            </div>
            {enchantments.length > 0 && (
                <div className="text-xs text-purple-300 border-t border-jp-wood-light mt-2 pt-2">
                    {enchantments.map((e, i) => <p key={i}>🔮 +{e.value}% {e.type}</p>)}
                </div>
            )}
            <div className="mt-auto pt-2">
                {isOwned ? (
                    <button onClick={() => onEquip(rod.id)} disabled={isEquipped} className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md disabled:shadow-none ${isEquipped ? 'bg-jp-wood-light cursor-not-allowed' : 'bg-jp-red hover:bg-opacity-80'}`}>
                        {isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                ) : (
                    <button onClick={() => onPurchaseRequest({ item: { name: rod.name, price: rod.price }, onConfirm: () => onBuy(rod.id) })} disabled={!canAcquire} className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md disabled:shadow-none disabled:bg-jp-wood-light disabled:cursor-not-allowed ${canAcquire ? 'bg-jp-gold hover:bg-opacity-80 text-jp-wood' : ''}`}>
                        {priceString}
                    </button>
                )}
            </div>
        </div>
    );
};