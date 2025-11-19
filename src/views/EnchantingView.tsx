import React, { useState, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { RODS, ENCHANTMENT_COST, MAX_ENCHANTMENTS } from '../../constants';
import { formatNumber } from '../lib/utils';

export const EnchantingView: React.FC = () => {
    const { playerState, actions } = usePlayer();
    if (!playerState) return null;

    const ownedRods = useMemo(() => RODS.filter(r => playerState.ownedRodIds.includes(r.id)), [playerState.ownedRodIds]);
    const [selectedRodId, setSelectedRodId] = useState<number | null>(ownedRods[0]?.id ?? null);
    
    const selectedRod = useMemo(() => selectedRodId ? RODS.find(r => r.id === selectedRodId) : null, [selectedRodId]);
    const enchantments = useMemo(() => selectedRodId ? playerState.rodEnchantments?.[selectedRodId] ?? [] : [], [selectedRodId, playerState.rodEnchantments]);
    
    const canEnchant = playerState.stonehengeCrystals >= ENCHANTMENT_COST && enchantments.length < MAX_ENCHANTMENTS;

    if (ownedRods.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-3xl font-heading mb-4">Enchanting Altar</h2>
                <p className="text-jp-cream/70">You do not own any fishing rods to enchant.</p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8">
            <h2 className="text-3xl font-heading mb-2">Enchanting Altar</h2>
            <p className="text-jp-cream/70 mb-6">Select a rod and spend Stonehenge Crystals to grant it a powerful, random bonus.</p>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                    <h3 className="text-xl font-semibold mb-3">Your Rods</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {ownedRods.map(rod => (
                            <button key={rod.id} onClick={() => setSelectedRodId(rod.id)} className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedRodId === rod.id ? 'bg-jp-wood-light border-jp-gold' : 'bg-jp-wood border-jp-wood-light hover:bg-jp-wood-light/50'}`}>
                                {rod.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-2/3">
                    {selectedRod ? (
                        <div className="bg-jp-wood/80 p-6 rounded-lg border border-jp-wood-light">
                           <h3 className="text-2xl font-heading mb-4 text-jp-gold">{selectedRod.name}</h3>
                           <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                               <p>Luck: <span className="font-semibold">{selectedRod.luck}%</span></p>
                               <p>Speed: <span className="font-semibold">{selectedRod.speed}%</span></p>
                               <p>Max Weight: <span className="font-semibold">{formatNumber(selectedRod.maxWeight)} kg</span></p>
                           </div>
                           <div className="border-t border-jp-wood-light pt-4">
                                <h4 className="font-semibold mb-2">Enchantments ({enchantments.length}/{MAX_ENCHANTMENTS})</h4>
                                {enchantments.length > 0 ? (
                                    <ul className="space-y-1">
                                        {enchantments.map((e, i) => <li key={i} className="font-semibold text-purple-300">🔮 +{e.value}% {e.type}</li>)}
                                    </ul>
                                ) : ( <p className="text-jp-cream/70 italic">No enchantments yet.</p> )}
                           </div>
                           <div className="mt-6 border-t border-jp-wood-light pt-6 text-center">
                                <p className="text-lg">Cost: <span className="font-bold text-purple-400">{ENCHANTMENT_COST} Stonehenge Crystals</span></p>
                                <p className="mb-4">Your balance: <span className="font-bold text-purple-400">{playerState.stonehengeCrystals} 💎</span></p>
                                <button onClick={() => actions.enchantRod(selectedRod.id)} disabled={!canEnchant} className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 disabled:bg-jp-wood-light disabled:cursor-not-allowed text-lg">
                                    {enchantments.length >= MAX_ENCHANTMENTS ? 'Max Enchantments' : 'Enchant'}
                                </button>
                           </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-jp-wood/50 rounded-lg">
                            <p className="text-jp-cream/70">Select a rod to begin enchanting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};