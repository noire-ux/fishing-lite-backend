import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Fish, FishingRod } from '../../types';
import { PotionType, TierName } from '../../types';
import { usePlayer } from '../context/PlayerContext';
import { RODS, MAPS, TIERS, TIER_ORDER, MUTATIONS, FISH_DATA } from '../../constants';
import { formatNumber, formatDuration } from '../lib/utils';

type FishingPhase = 'idle' | 'casting' | 'hooked' | 'pulling' | 'cooldown';

const WaterVisualizer: React.FC = () => (
    <div className="relative w-full h-32 my-2 rounded-lg overflow-hidden bg-gradient-to-t from-cyan-800 to-blue-900/40 shadow-inner">
        <div className="absolute inset-0 bg-wave-3 bg-repeat-x bg-bottom animate-wave-flow-3" style={{ backgroundSize: '2880px auto' }}></div>
        <div className="absolute inset-0 bg-wave-2 bg-repeat-x bg-bottom animate-wave-flow-2 animate-float" style={{ backgroundSize: '2880px auto' }}></div>
        <div className="absolute inset-0 bg-wave-1 bg-repeat-x bg-bottom animate-wave-flow-1 animate-float" style={{ backgroundSize: '2880px auto' }}></div>
    </div>
);

const HorizontalRodVisual: React.FC<{ rod: FishingRod }> = ({ rod }) => {
    const gradientId = `rod-gradient-horizontal-${rod.id}`;
    return (
        <div className="h-16 w-full flex items-center justify-center my-1">
            <svg width="100%" height="24" viewBox="0 0 180 24" className="max-w-xs">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={rod.color} />
                        <stop offset="50%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="100%" stopColor={rod.color} />
                    </linearGradient>
                </defs>
                <rect x="0" y="9" width="180" height="6" fill={rod.color} />
                <rect x="0" y="9" width="180" height="6" fill={`url(#${gradientId})`} />
                <rect x="30" y="8" width="3" height="8" fill="#6d4c41" rx="1" />
                <rect x="80" y="8" width="3" height="8" fill="#6d4c41" rx="1" />
                <rect x="130" y="8" width="3" height="8" fill="#6d4c41" rx="1" />
                <rect x="150" y="7" width="30" height="10" fill="#4e342e" rx="2" />
            </svg>
        </div>
    );
};

export const FishingView: React.FC<{ currentTime: number; gameHour: number; gameMinute: number; }> = ({ currentTime, gameHour, gameMinute }) => {
    const { playerState, actions } = usePlayer();
    const [phase, setPhase] = useState<FishingPhase>('idle');
    const [statusText, setStatusText] = useState('Cast your line to begin.');
    const [pullProgress, setPullProgress] = useState(0);
    const [isStruggling, setIsStruggling] = useState(false);
    const [isRodPanelOpen, setIsRodPanelOpen] = useState(true);

    const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
    const phaseRef = useRef(phase);
    phaseRef.current = phase;
    const isStrugglingRef = useRef(isStruggling);
    isStrugglingRef.current = isStruggling;

    const { playerState: player } = usePlayer(); // Non-null asserted because this view only renders for logged-in users.
    if (!player) return null;

    const equippedRod = useMemo(() => RODS.find(r => r.id === player.currentRodId) || RODS[0], [player.currentRodId]);
    const currentMapData = useMemo(() => MAPS.find(m => m.id === player.currentMapId) || MAPS[0], [player.currentMapId]);
    const canFish = useMemo(() => player.bait > 0, [player.bait]);
    
    const totalCaught = useMemo(() => {
        // FIX: Data from DB might be inconsistent. Ensure collection exists and items have a count property.
        if (!player.collection) return 0;
        return Object.values(player.collection).reduce((sum: number, item: any) => sum + (item?.count || 0), 0);
    }, [player.collection]);
    
    const activePotionEffects = player.activePotionEffects || {};
    const luckyEffect = activePotionEffects[PotionType.Lucky];
    const luckyStacks = (luckyEffect && luckyEffect.expiresAt > currentTime) ? luckyEffect.stacks : 0;
    const totalLuck = equippedRod.luck + (luckyStacks * 50);

    const enchantments = useMemo(() => player.rodEnchantments?.[player.currentRodId] ?? [], [player.rodEnchantments, player.currentRodId]);

    const getTimeOfDay = () => {
        const totalMinutes = gameHour * 60 + gameMinute;
        if (totalMinutes >= 120 && totalMinutes < 360) return "Dawn 🌄";
        if (totalMinutes >= 360 && totalMinutes < 570) return "Morning 🌅";
        if (totalMinutes >= 570 && totalMinutes < 870) return "Day ☀️";
        if (totalMinutes >= 870 && totalMinutes < 1110) return "Afternoon 🌇";
        if (totalMinutes >= 1110 && totalMinutes < 1120) return "Dusk 🌆";
        if (totalMinutes >= 1120 && totalMinutes < 1320) return "Night 🌙";
        return "Late Night 🌌";
    };

    const cleanupTimers = useCallback(() => {
        timerRefs.current.forEach(clearTimeout);
        timerRefs.current = [];
    }, []);

    const setManagedTimeout = useCallback((callback: () => void, duration: number) => {
        const timer = setTimeout(callback, duration);
        timerRefs.current.push(timer);
        return timer;
    }, []);

    const resetToIdle = useCallback((delay: number) => {
        cleanupTimers();
        setManagedTimeout(() => {
            setPhase('idle');
            setPullProgress(0);
            setStatusText('Cast your line to begin.');
            setIsStruggling(false);
        }, delay);
    }, [cleanupTimers, setManagedTimeout]);
    
    useEffect(() => cleanupTimers, [cleanupTimers]);

    useEffect(() => {
        if (!player.isAutoFishing || phase !== 'idle') return;
        if (!canFish) { actions.showNotification("Out of bait! Auto-fishing stopped."); actions.toggleAutoFishing(); return; }
        if (player.backpack.length >= player.backpackCapacity) { actions.showNotification("Backpack is full! Auto-fishing stopped."); actions.toggleAutoFishing(); return; }

        setPhase('cooldown');
        setStatusText('Auto-casting...');
        actions.consumeBait();

        const autoFishDelay = 4000 + Math.random() * 2000 - (equippedRod.speed * 20);

        setManagedTimeout(() => {
             const tierRoll = Math.random() * 100;
             let caughtTier: TierName = TierName.Common;
             let cumulativeChance = 0;
             for (const tierName of TIER_ORDER) {
                 const chance = currentMapData.fishTiers[tierName] || 0;
                 cumulativeChance += chance;
                 if (tierRoll < cumulativeChance) { caughtTier = tierName; break; }
             }

             const mapIndex = MAPS.findIndex(m => m.id === player.currentMapId);
             const tierIndex = TIER_ORDER.indexOf(caughtTier);
             const baseWeight = (mapIndex + 1) * 200 + (tierIndex * 500);
             const weight = parseFloat((baseWeight * (Math.random() + 0.5) * TIERS[caughtTier].valueMultiplier).toFixed(2));

             if (weight > equippedRod.maxWeight) {
                 setStatusText('Auto: The line snapped!');
             } else {
                 const mutationEffect = activePotionEffects[PotionType.Mutation];
                 const mutationBonus = (mutationEffect && mutationEffect.expiresAt > Date.now()) ? mutationEffect.stacks * 0.33 : 0;
                 const caughtMutation = Math.random() < (equippedRod.luck / 500 + mutationBonus) ? MUTATIONS[Math.floor(Math.random() * MUTATIONS.length)] : undefined;
                 const possibleFish = FISH_DATA[player.currentMapId].filter(f => f.tier === caughtTier);
                 const fishToCatch = possibleFish.length > 0 ? possibleFish[Math.floor(Math.random() * possibleFish.length)] : FISH_DATA[player.currentMapId][0];
                 const fishData = { name: fishToCatch.name, tier: caughtTier, weight, mutation: caughtMutation, map: player.currentMapId };
                 actions.addCaughtFish(fishData);
                 setStatusText(`Auto: Caught a ${fishData.name}!`);
             }
             resetToIdle(1500);
        }, Math.max(1000, autoFishDelay));

    }, [player.isAutoFishing, phase, canFish, player.backpack.length, player.backpackCapacity, equippedRod, currentMapData, actions, setManagedTimeout, resetToIdle, player.currentMapId, activePotionEffects]);

    const handleCastLine = useCallback(() => {
        if (phase !== 'idle' || player.isAutoFishing) return;
        if (!canFish) { actions.showNotification("You need bait to fish! Visit the shop."); return; }

        actions.consumeBait();
        setPhase('casting');
        const steps = [{ text: "Wait a minute...", duration: 2000 }, { text: "Approaching the fishing hook...", duration: 2000 }, { text: "Eating the bait...", duration: 1500 }];
        let cumulativeDelay = 0;
        steps.forEach(step => {
            setManagedTimeout(() => setStatusText(step.text), cumulativeDelay);
            cumulativeDelay += step.duration;
        });

        setManagedTimeout(() => {
            const currentLuckyEffect = activePotionEffects[PotionType.Lucky];
            const luckBonus = (currentLuckyEffect && currentLuckyEffect.expiresAt > Date.now()) ? currentLuckyEffect.stacks * 50 : 0;
            const totalLuck = equippedRod.luck + luckBonus;
            const successThreshold = Math.min(98, 30 + totalLuck / 1.2);

            if (Math.random() * 100 > successThreshold) {
                setStatusText("Nothing seems to be biting...");
                setPhase('cooldown');
                resetToIdle(2000);
                return;
            }

            setStatusText("Pull the fish!");
            setPhase('hooked');
            timerRefs.current = [setManagedTimeout(() => { actions.showNotification("Too slow! The fish got away."); setStatusText("It got away..."); setPhase('cooldown'); resetToIdle(2000); }, 3500)];
        }, cumulativeDelay);
    }, [phase, canFish, player, equippedRod, actions, setManagedTimeout, resetToIdle, activePotionEffects]);
    
    const handleFishPullClick = useCallback(() => {
        if (phase === 'hooked') {
            cleanupTimers();
            setPhase('pulling');
            setPullProgress(30);

            const scheduleStruggle = () => {
                setIsStruggling(false);
                setStatusText('Reel it in! Keep clicking!');
                timerRefs.current.push(setManagedTimeout(() => {
                    setIsStruggling(true);
                    setStatusText('It\'s struggling! Click faster!');
                    timerRefs.current.push(setManagedTimeout(() => { if (phaseRef.current === 'pulling') scheduleStruggle(); }, Math.max(800, 2000 - (equippedRod.speed * 10))));
                }, 2000 + (equippedRod.speed * 10)));
            };
            scheduleStruggle();
            timerRefs.current.push(setManagedTimeout(() => { if (phaseRef.current === 'pulling') { cleanupTimers(); actions.showNotification("Ran out of time!"); setStatusText("It got away..."); setPhase('cooldown'); resetToIdle(2000); } }, 15000));
        }

        if (phase === 'pulling') {
            const pullStrength = 2 + (equippedRod.speed / 25);
            setPullProgress(prev => {
                const newProgress = Math.min(100, prev + pullStrength - (isStrugglingRef.current ? (Math.max(0.15, 2.0 - (equippedRod.luck / 100))) : 0));
                if (newProgress <= 0) { cleanupTimers(); actions.showNotification("The fish was too strong and escaped!"); setStatusText("It got away..."); setPhase('cooldown'); resetToIdle(2000); return 0; }
                if (newProgress >= 100) {
                    cleanupTimers();
                    setStatusText('Fish Caught!');
                    setPhase('cooldown');
                    setIsStruggling(false);

                    const tierRoll = Math.random() * 100;
                    let caughtTier: TierName = TierName.Common;
                    let cumulativeChance = 0;
                    for (const tierName of TIER_ORDER) {
                        const chance = currentMapData.fishTiers[tierName] || 0;
                        cumulativeChance += chance;
                        if (tierRoll < cumulativeChance) { caughtTier = tierName; break; }
                    }
                    
                    const mapIndex = MAPS.findIndex(m => m.id === player.currentMapId);
                    const tierIndex = TIER_ORDER.indexOf(caughtTier);
                    const baseWeight = (mapIndex + 1) * 200 + (tierIndex * 500);
                    const weight = parseFloat((baseWeight * (Math.random() + 0.5) * TIERS[caughtTier].valueMultiplier).toFixed(2));

                    if (weight > equippedRod.maxWeight) {
                        actions.showNotification("The line snapped! The fish was too heavy.");
                    } else {
                        const mutationEffect = activePotionEffects[PotionType.Mutation];
                        const mutationBonus = (mutationEffect && mutationEffect.expiresAt > Date.now()) ? mutationEffect.stacks * 0.33 : 0;
                        const caughtMutation = Math.random() < (equippedRod.luck / 500 + mutationBonus) ? MUTATIONS[Math.floor(Math.random() * MUTATIONS.length)] : undefined;
                        const possibleFish = FISH_DATA[player.currentMapId].filter(f => f.tier === caughtTier);
                        const fishToCatch = possibleFish.length > 0 ? possibleFish[Math.floor(Math.random() * possibleFish.length)] : FISH_DATA[player.currentMapId][0];
                        actions.addCaughtFish({ name: fishToCatch.name, tier: caughtTier, weight, mutation: caughtMutation, map: player.currentMapId });
                    }
                    resetToIdle(1500);
                }
                return newProgress;
            });
        }
    }, [phase, player, equippedRod, currentMapData, actions, resetToIdle, cleanupTimers, setManagedTimeout, activePotionEffects]);

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col gap-4">
            <div className="flex-grow flex flex-col">
                 <div className="text-center bg-jp-wood/70 backdrop-blur-sm p-4 sm:p-8 rounded-2xl h-full flex flex-col border border-jp-wood-light shadow-2xl">
                    <div className="flex-grow flex flex-col justify-center">
                        <p className={`text-xl mb-4 h-8 transition-colors duration-300 font-semibold ${phase === 'hooked' ? 'text-green-400 animate-pulse' : 'text-jp-cream'}`}>{statusText}</p>
                        <WaterVisualizer />
                        {phase === 'pulling' && (
                            <div className={`my-4 max-w-md mx-auto transition-transform duration-100 ${isStruggling ? 'animate-struggle' : ''}`}>
                                <div className="w-full bg-jp-wood-light rounded-full h-8 border-2 border-jp-wood-dark overflow-hidden">
                                    <div className="bg-green-600 h-full rounded-full transition-all duration-100 flex items-center justify-end pr-3 text-white font-bold text-sm shadow-inner" style={{ width: `${pullProgress}%` }}>{Math.round(pullProgress)}%</div>
                                </div>
                                <p className="text-xs text-jp-cream/70 mt-2 animate-pulse">{isStruggling ? "It's putting up a fight!" : "Keep reeling it in!"}</p>
                            </div>
                        )}
                        {!canFish && phase === 'idle' && (
                            <div className="my-4 p-3 bg-amber-800/20 border border-amber-600/30 rounded-lg text-amber-400 text-sm max-w-md mx-auto">You have no bait! Visit the shop to buy more.</div>
                        )}
                        <div className="flex justify-center items-center space-x-4 h-16">
                            <button onClick={handleCastLine} disabled={phase !== 'idle' || !canFish || player.isAutoFishing} className="px-8 py-4 bg-jp-red text-white font-bold rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 disabled:bg-jp-wood-light disabled:cursor-not-allowed text-base transform hover:-translate-y-1">Cast Line</button>
                            <button onClick={handleFishPullClick} disabled={phase !== 'hooked' && phase !== 'pulling'} className="px-8 py-4 font-bold rounded-lg shadow-lg transition-all duration-300 text-base bg-green-600 hover:bg-green-700 text-white disabled:bg-jp-wood-light disabled:cursor-not-allowed disabled:opacity-50">Pull Fish</button>
                            {player.level >= 5 && <button onClick={actions.toggleAutoFishing} title={player.isAutoFishing ? "Disable auto-fishing" : "Enable auto-fishing"} className={`px-5 py-4 font-bold rounded-lg shadow-lg transition-all duration-300 text-sm ${player.isAutoFishing ? 'bg-purple-600 animate-pulse-fast' : 'bg-jp-wood-light hover:bg-opacity-80'} text-white`}>Auto {player.isAutoFishing ? 'ON' : 'OFF'}</button>}
                        </div>
                    </div>
                    <div className="mt-8 text-left max-w-md mx-auto text-sm text-jp-cream/70 border-t border-jp-wood-light pt-4">
                        <h4 className="font-heading text-jp-cream mb-2 text-lg">Location: {currentMapData.name}</h4>
                        <p>{currentMapData.description}</p>
                        {currentMapData.specialItem && <p className="text-amber-400 mt-1">Special Find: Chance to find {currentMapData.specialItem.name}.</p>}
                    </div>
                </div>
            </div>

            <div className="bg-jp-wood/70 backdrop-blur-sm rounded-2xl border border-jp-wood-light shadow-lg">
                <button onClick={() => setIsRodPanelOpen(!isRodPanelOpen)} className="w-full flex justify-between items-center p-4 text-left">
                    <h3 className="text-xl font-heading text-jp-cream">
                        Equipped: <span className="text-jp-gold">{equippedRod.name}</span>
                    </h3>
                     <svg className={`w-6 h-6 text-jp-cream/80 transition-transform duration-300 ${isRodPanelOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isRodPanelOpen ? 'max-h-48' : 'max-h-0'}`}>
                    <div className="px-4 pb-4">
                        <HorizontalRodVisual rod={equippedRod} />
                        <div className="border-t border-jp-wood-light/50 mt-1 mb-2"></div>
                        <div className="flex justify-between items-center text-sm flex-wrap gap-2">
                            <div className="text-purple-300 flex-grow">
                                {enchantments.length > 0 ? (
                                    enchantments.map((e, i) => <span key={i} className="mr-3 text-xs whitespace-nowrap">🔮 +{e.value}% {e.type}</span>)
                                ) : (
                                    <span className="text-jp-cream/70 italic text-xs">No enchantments</span>
                                )}
                            </div>
                            <div className="text-amber-400 font-semibold whitespace-nowrap">
                                Bait: {player.bait} 🎣
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-jp-wood/80 backdrop-blur-sm p-4 rounded-xl flex-shrink-0 border border-jp-wood-light/50">
                <div className="flex items-stretch">
                    <div className="flex flex-col justify-around text-center pr-4 border-r border-jp-wood-light/50">
                        <div>
                            <p className="text-jp-cream/70 text-[10px] uppercase tracking-widest leading-tight">IN-GAME TIME</p>
                            <p className="text-base font-bold font-mono tracking-wider">{String(gameHour).padStart(2, '0')}:{String(gameMinute).padStart(2, '0')}</p>
                        </div>
                        <div className="mt-2">
                            <p className="text-jp-cream/70 text-[10px] uppercase tracking-widest leading-tight">TIME OF DAY</p>
                            <p className="text-base font-bold whitespace-nowrap">{getTimeOfDay()}</p>
                        </div>
                    </div>
                    <div className="flex-grow grid grid-cols-3 gap-2 text-center items-center pl-4">
                        <div><p className="font-semibold text-jp-cream text-lg">{totalCaught}</p><p className="text-xs text-jp-cream/70">Total Caught</p></div>
                        <div><p className="font-semibold text-green-400 text-lg">{totalLuck}%</p><p className="text-xs text-jp-cream/70">Luck</p></div>
                        <div><p className="font-semibold text-cyan-400 text-lg">{player.backpack.length}<span className="text-base">/{formatNumber(player.backpackCapacity)}</span></p><p className="text-xs text-jp-cream/70">Fish Bags</p></div>
                    </div>
                </div>
                {Object.values(activePotionEffects).some(e => e && e.expiresAt > currentTime) && (
                    <div className="flex justify-center items-center flex-wrap gap-4 mt-3 pt-3 border-t border-jp-wood-light/50">
                        {(Object.keys(activePotionEffects) as Array<keyof typeof activePotionEffects>).map((key) => {
                            const effect = activePotionEffects[key];
                            if (!effect || effect.expiresAt < currentTime) return null;
                            const icon = key === PotionType.Lucky ? '🍀' : '✨';
                            return (<div key={key} className="bg-jp-wood-light/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-sm border border-jp-wood-dark shadow-md">
                                  <span className="text-lg">{icon}</span><span>x{effect.stacks}</span><span className="font-mono text-jp-cream/80">{formatDuration(effect.expiresAt - currentTime)}</span>
                               </div>)
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
