import React from 'react';
import type { FishingRod, Enchantment } from '../../types';
import { calculateEnchantedStats, formatNumber } from '../lib/utils';
import { ModalWrapper } from '../components/ModalWrapper';

export const RodInfoModal: React.FC<{ rod: FishingRod; enchantments: Enchantment[]; onClose: () => void }> = ({ rod, enchantments, onClose }) => {
    const stats = calculateEnchantedStats(rod, enchantments);
    
    return (
        <ModalWrapper title={rod.name} onClose={onClose}>
            <div className="space-y-3">
                 <p className="text-jp-cream/80">Level Requirement: <span className="font-semibold text-white">{rod.levelReq}</span></p>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-jp-wood-light">
                    <p className="text-jp-cream/80">Luck:</p><p className="font-semibold text-white">{stats.luck}% {stats.bonuses.luck > 0 && <span className="text-fuchsia-400">(+{stats.bonuses.luck}%)</span>}</p>
                    <p className="text-jp-cream/80">Speed:</p><p className="font-semibold text-white">{stats.speed}% {stats.bonuses.speed > 0 && <span className="text-fuchsia-400">(+{stats.bonuses.speed}%)</span>}</p>
                    <p className="text-jp-cream/80">Max Weight:</p><p className="font-semibold text-white">{formatNumber(stats.maxWeight)} kg {stats.bonuses.weight > 0 && <span className="text-fuchsia-400">(+{stats.bonuses.weight}%)</span>}</p>
                </div>
                 <div className="pt-3 border-t border-jp-wood-light">
                     <p className="text-jp-cream/80 mb-1">Passive Ability:</p>
                     <p className="italic text-jp-gold/90">{rod.passive}</p>
                 </div>
                 {enchantments.length > 0 && (
                    <div className="pt-3 border-t border-jp-wood-light">
                         <p className="text-jp-cream/80 mb-1">Enchantments:</p>
                         <ul className="space-y-1">
                            {enchantments.map((e, i) => <li key={i} className="font-semibold text-purple-300">🔮 +{e.value}% {e.type}</li>)}
                         </ul>
                    </div>
                 )}
            </div>
        </ModalWrapper>
    );
};