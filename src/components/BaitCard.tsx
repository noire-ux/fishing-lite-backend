import React from 'react';
import type { PlayerState } from '../../types';
import { formatNumber } from '../lib/utils';

export const BaitCard: React.FC<{ 
    onBuy: (amount: number, price: number) => void; 
    player: PlayerState; 
    onPurchaseRequest: (details: { item: { name: string; price: string | number; }; onConfirm: () => void; }) => void; 
}> = ({ onBuy, player, onPurchaseRequest }) => {
    const amount = 10;
    const price = 100;
    const canAfford = player.coins >= price;

    return (
        <div className="p-4 rounded-xl shadow-lg border border-jp-wood-light bg-jp-wood flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-jp-gold">
            <h3 className="text-xl font-heading">釣り餌 (Bait)</h3>
            <p className="text-sm text-jp-cream/70 flex-grow my-4">Standard fishing bait. Essential for casting your line and attracting fish.</p>
            <button 
                onClick={() => onPurchaseRequest({ item: { name: `${amount} Bait`, price }, onConfirm: () => onBuy(amount, price) })} 
                disabled={!canAfford} 
                className={`w-full text-jp-wood font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md disabled:shadow-none disabled:bg-jp-wood-light disabled:cursor-not-allowed ${canAfford ? 'bg-jp-gold hover:bg-opacity-80' : ''}`}
            >
                Buy {amount} for {formatNumber(price)} 両
            </button>
        </div>
    );
};