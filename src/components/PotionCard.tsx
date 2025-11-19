import React from 'react';
import type { Potion, PlayerState } from '../../types';
import { PotionType } from '../../types';
import { formatNumber } from '../lib/utils';

export const PotionCard: React.FC<{ 
    potion: Potion; 
    player: PlayerState; 
    onBuy: (id: PotionType) => void; 
    onPurchaseRequest: (details: { item: { name: string; price: string | number; }; onConfirm: () => void; }) => void; 
}> = ({ potion, player, onBuy, onPurchaseRequest }) => {
    const canAfford = player.coins >= potion.price;
    const icon = potion.id === PotionType.Lucky ? '🍀' : '✨';

    return (
        <div className="p-4 rounded-xl shadow-lg border border-jp-wood-light bg-jp-wood flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-jp-gold">
            <h3 className="text-xl font-heading">{icon} {potion.name}</h3>
            <p className="text-sm text-jp-cream/70 flex-grow my-4">{potion.description}</p>
            <button 
                onClick={() => onPurchaseRequest({ item: { name: potion.name, price: potion.price }, onConfirm: () => onBuy(potion.id) })} 
                disabled={!canAfford} 
                className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md disabled:shadow-none disabled:bg-jp-wood-light disabled:cursor-not-allowed ${canAfford ? 'bg-purple-700 hover:bg-purple-600' : ''}`}
            >
                {formatNumber(potion.price)} 両
            </button>
        </div>
    );
};