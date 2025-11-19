import React, { useState, useMemo } from 'react';
import type { FishingRod, Enchantment } from '../../types';
import { usePlayer } from '../context/PlayerContext';
import { RODS } from '../../constants';
import { formatNumber } from '../lib/utils';
import { FishCard } from '../components/FishCard';
import { RodCard } from '../components/RodCard';
import { RodInfoModal } from '../modals/RodInfoModal';

export const BackpackView: React.FC = () => {
    const { playerState, actions } = usePlayer();
    const [activeTab, setActiveTab] = useState<'FISH' | 'ITEMS' | 'RODS'>('FISH');
    const [infoRod, setInfoRod] = useState<{rod: FishingRod, enchantments: Enchantment[]} | null>(null);
    const [isFavoriteMode, setIsFavoriteMode] = useState(false);

    if (!playerState) return null;

    const ownedRods = useMemo(() => RODS.filter(r => playerState.ownedRodIds.includes(r.id)), [playerState.ownedRodIds]);

    return (
        <div className="p-4 sm:p-8">
            {infoRod && <RodInfoModal rod={infoRod.rod} enchantments={infoRod.enchantments} onClose={() => setInfoRod(null)} />}
            <h2 className="text-3xl font-heading mb-4 text-jp-cream">Backpack</h2>
            <div className="flex border-b border-jp-wood-light mb-6">
                <button onClick={() => setActiveTab('FISH')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'FISH' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Fish Bags</button>
                <button onClick={() => setActiveTab('RODS')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'RODS' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Fishing Rod</button>
                <button onClick={() => setActiveTab('ITEMS')} className={`px-6 py-3 text-lg font-semibold transition-all duration-200 rounded-t-lg border-b-2 ${activeTab === 'ITEMS' ? 'border-jp-gold text-jp-gold bg-jp-wood' : 'text-jp-cream/70 hover:text-white border-transparent hover:bg-jp-wood/50'}`}>Items</button>
            </div>
            {activeTab === 'FISH' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Fish ({playerState.backpack.length}/{formatNumber(playerState.backpackCapacity)})</h3>
                         <div className="flex gap-2">
                            <button onClick={() => setIsFavoriteMode(!isFavoriteMode)} className={`font-bold py-2 px-5 rounded-lg transition-all shadow-md ${isFavoriteMode ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                {isFavoriteMode ? 'Unfavorite' : 'Favorite'}
                            </button>
                            <button onClick={actions.sellAllFish} disabled={playerState.backpack.length === 0} className="bg-jp-red hover:bg-opacity-80 text-white font-bold py-2 px-5 rounded-lg transition-all shadow-md disabled:bg-jp-wood-light disabled:cursor-not-allowed">Sell All</button>
                        </div>
                    </div>
                     {isFavoriteMode && (
                        <div className="mb-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg text-center text-blue-300">
                            <p><strong>Mode Favorit Aktif:</strong> Klik pada ikan untuk menandainya sebagai favorit. Ikan yang difavoritkan tidak dapat dijual.</p>
                        </div>
                    )}
                    {playerState.backpack.length === 0 ? (
                        <p className="text-center text-jp-cream/70 py-16">Your fish bag is empty. Go catch some fish!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {playerState.backpack.map(fish => (
                                <FishCard 
                                    key={fish.id} 
                                    fish={fish} 
                                    onCardClick={isFavoriteMode ? () => actions.toggleFavoriteFish(fish.id) : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'ITEMS' && (
                 <div>
                    <h3 className="text-xl font-semibold mb-6">Valuable Items</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl shadow-lg border border-purple-600 bg-jp-wood flex flex-col">
                           <h4 className="text-lg font-heading">💎 Stonehenge Crystal</h4>
                           <p className="text-sm text-jp-cream/70 my-2 flex-grow">A mysterious crystal pulsing with ancient energy. Used to purchase powerful rods and for enchanting.</p>
                           <p className="text-right text-2xl font-bold">{playerState.stonehengeCrystals}</p>
                        </div>
                        <div className="p-4 rounded-xl shadow-lg border border-amber-600 bg-jp-wood flex flex-col">
                           <h4 className="text-lg font-heading">🎣 Bait</h4>
                           <p className="text-sm text-jp-cream/70 my-2 flex-grow">Essential for casting your line. You can buy more in the shop.</p>
                           <p className="text-right text-2xl font-bold">{playerState.bait}</p>
                        </div>
                     </div>
                 </div>
            )}
            {activeTab === 'RODS' && (
                <div>
                    <h3 className="text-xl font-semibold mb-6">Your Fishing Rods ({ownedRods.length})</h3>
                    {ownedRods.length === 0 ? (
                         <p className="text-center text-jp-cream/70 py-16">You don't own any rods.</p>
                    ) : (
                        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 sm:-mx-8 px-4 sm:px-8 snap-x snap-mandatory">
                           {ownedRods.map(rod => {
                               const enchantments = playerState.rodEnchantments?.[rod.id] ?? [];
                               return <RodCard key={rod.id} rod={rod} player={playerState} onBuy={() => {}} onEquip={actions.equipRod} onInfoClick={(r, e) => setInfoRod({rod: r, enchantments: e})} enchantments={enchantments} onPurchaseRequest={() => {}} />
                           })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};