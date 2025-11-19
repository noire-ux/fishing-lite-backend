import React from 'react';
import type { Fish } from '../../types';
import { usePlayer } from '../context/PlayerContext';
import { getTierColorClass, formatNumber } from '../lib/utils';

export const FishCard: React.FC<{ fish: Fish; onCardClick?: () => void; }> = ({ fish, onCardClick }) => {
    const { actions } = usePlayer();

    const handleSellClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the onCardClick from firing
        actions.sellFish(fish.id);
    };
    
    return (
        <div 
            onClick={onCardClick}
            className={`relative p-4 rounded-xl shadow-lg border bg-jp-wood flex flex-col justify-between transition-all duration-300 ${onCardClick ? 'cursor-pointer' : ''} ${fish.isFavorited ? 'border-yellow-400' : 'border-jp-wood-light'} hover:shadow-xl hover:-translate-y-1 hover:border-jp-gold`}
        >
            {fish.isFavorited && <span className="absolute top-2 right-2 text-2xl" aria-label="Favorited">⭐</span>}
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold font-heading pr-8">{fish.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-slate-900 ${getTierColorClass(fish.tier, 'bg')}`}>
                        {fish.tier}
                    </span>
                </div>
                <p className="text-sm text-jp-cream/70">{formatNumber(fish.weight)} kg</p>
                {fish.mutation &&
                    <p className="text-sm mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-shine font-bold">
                        ✨ {fish.mutation}
                    </p>
                }
            </div>
            <div className="mt-4 flex justify-between items-end">
                <p className="text-lg font-semibold text-jp-gold">{formatNumber(fish.value)} 両</p>
                <button 
                    onClick={handleSellClick} 
                    disabled={!!fish.isFavorited} 
                    className="bg-jp-red hover:bg-opacity-80 text-white font-bold py-1 px-4 rounded-md text-sm transition-all shadow-md disabled:bg-jp-wood-light disabled:cursor-not-allowed"
                >
                    Sell
                </button>
            </div>
        </div>
    );
};