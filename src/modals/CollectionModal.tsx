import React, { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { FISH_DATA, MAPS, TIER_ORDER } from '../../constants';
import type { TierName } from '../../types';
import { ModalWrapper } from '../components/ModalWrapper';
import { CollectionRow } from '../components/CollectionRow';

export const CollectionModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { playerState } = usePlayer();
    if (!playerState) return null;

    const allFishInfo = useMemo(() => {
        const map = new Map<string, { name: string; tier: TierName; baseValue: number }>();
        // FIX: Explicitly type the 'fish' parameter to resolve the 'unknown' type error.
        Object.values(FISH_DATA).flat().forEach((fish: { name: string; tier: TierName; baseValue: number }) => map.set(fish.name, fish));
        return map;
    }, []);
    
    return (
    <ModalWrapper title="Fish Collection" onClose={onClose} className="max-w-4xl">
        <div className="max-h-[75vh] overflow-y-auto pr-2">
            {Object.keys(playerState.collection).length === 0 ? (
                <p className="text-center text-jp-cream/70 py-16">You haven't caught any fish yet.</p>
            ) : (
                <div className="space-y-8">
                    {MAPS.filter(map => Object.keys(map.fishTiers).length > 0).map(map => {
                        const caughtFishInMap = Object.keys(playerState.collection)
                            .filter(fishName => FISH_DATA[map.id]?.some(f => f.name === fishName))
                            .sort((a, b) => {
                                const fishAInfo = allFishInfo.get(a);
                                const fishBInfo = allFishInfo.get(b);
                                if (!fishAInfo || !fishBInfo) return 0;
                                const tierIndexA = TIER_ORDER.indexOf(fishAInfo.tier);
                                const tierIndexB = TIER_ORDER.indexOf(fishBInfo.tier);
                                return tierIndexA !== tierIndexB ? tierIndexB - tierIndexA : a.localeCompare(b);
                            });
                        if (caughtFishInMap.length === 0) return null;

                        return (
                            <div key={map.id}>
                                <h3 className="text-2xl font-heading border-b-2 border-jp-wood-light pb-2 mb-4 text-jp-gold">{map.name}</h3>
                                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-2 pb-2 text-sm text-jp-cream/70 font-bold border-b border-jp-wood-light/50">
                                    <div className="w-8"></div>
                                    <div>Name</div>
                                    <div className="text-center">Tier</div>
                                    <div className="text-right w-12">Caught</div>
                                    <div className="text-right w-24">Max Weight</div>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {caughtFishInMap.map(fishName => (
                                        <CollectionRow key={fishName} fishName={fishName} data={playerState.collection[fishName]} fishInfo={allFishInfo.get(fishName)} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </ModalWrapper>
)};