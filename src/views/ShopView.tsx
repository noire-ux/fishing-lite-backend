import React, { useState } from 'react';
import type { FishingRod, Enchantment } from '../../types';
import { usePlayer } from '../context/PlayerContext';
import { RODS, POTIONS } from '../../constants';
import { RodCard } from '../components/RodCard';
import { PotionCard } from '../components/PotionCard';
import { BaitCard } from '../components/BaitCard';
import { RodInfoModal } from '../modals/RodInfoModal';

export const ShopView: React.FC<{ onPurchaseRequest: (details: { item: { name: string; price: string | number; }; onConfirm: () => void; }) => void; }> = ({ onPurchaseRequest }) => {
    const { playerState, actions } = usePlayer();
    const [activeTab, setActiveTab] = useState<'RODS' | 'POTIONS' | 'ITEMS'>('RODS');
    const [infoRod, setInfoRod] = useState<{rod: FishingRod, enchantments: Enchantment[]} | null>(null);

    if (!playerState) return null;
    
    return (
        <div className="p-4 sm:p-8">
             {infoRod && <RodInfoModal rod={infoRod.rod} enchantments={infoRod.enchantments} onClose={() => setInfoRod(null)} />}
            <h2 className="text-3xl font-heading mb-4">Shop</h2>
             <div className="flex border-b border-jp-wood-light mb-6">
                <button onClick={() => setActiveTab('RODS')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'RODS' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Fishing Rod</button>
                <button onClick={() => setActiveTab('POTIONS')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'POTIONS' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Potion</button>
                <button onClick={() => setActiveTab('ITEMS')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'ITEMS' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Items</button>
            </div>

            {activeTab === 'RODS' && (
                <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 sm:-mx-8 px-4 sm:px-8 snap-x snap-mandatory">
                    {RODS.map(rod => {
                        const enchantments = playerState.rodEnchantments?.[rod.id] ?? [];
                        return <RodCard key={rod.id} rod={rod} player={playerState} onBuy={actions.buyRod} onEquip={actions.equipRod} onInfoClick={(r, e) => setInfoRod({rod: r, enchantments: e})} enchantments={enchantments} onPurchaseRequest={onPurchaseRequest} />
                    })}
                </div>
            )}

            {activeTab === 'POTIONS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {POTIONS.map(potion => <PotionCard key={potion.id} potion={potion} player={playerState} onBuy={actions.buyPotion} onPurchaseRequest={onPurchaseRequest} />)}
                </div>
            )}

             {activeTab === 'ITEMS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   <BaitCard onBuy={actions.buyBait} player={playerState} onPurchaseRequest={onPurchaseRequest} />
                </div>
            )}
        </div>
    );
};