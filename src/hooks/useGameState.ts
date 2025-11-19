
import { useState, useEffect, useCallback, useRef } from 'react';
import type { PlayerState, Fish, Mail, PatchNote } from '../../types';
import { TierName, PotionType, EnchantmentType } from '../../types';
import { RODS, TIERS, FISH_DATA, MAPS, LEVEL_SCALING_FACTOR, BASE_XP, POTIONS, ENCHANTMENT_COST, MAX_ENCHANTMENTS, AUTO_FISHING_UNLOCK_LEVEL } from '../../constants';
import { supabaseClient } from '../lib/supabase';
import { formatNumber } from '../lib/utils';
// @ts-ignore
const { RealtimeChannel } = supabase;


export const useGameState = (userId: string | null) => {
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const [mail, setMail] = useState<Mail[]>([]);
    const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
    const [patchNotesError, setPatchNotesError] = useState<boolean>(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [lastCaughtFish, setLastCaughtFish] = useState<Fish | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchAttempt = useRef(0);

    const showNotification = useCallback((message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000); // Changed to 4 seconds
    }, []);
    
    const updatePlayerState = useCallback(async (updates: Partial<PlayerState>) => {
        if (!userId || !playerState) return;
        
        const previousState = { ...playerState };
        setPlayerState(prev => prev ? { ...prev, ...updates } : null);

        const { error } = await supabaseClient.from('players').update(updates).eq('userId', userId);
        if (error) {
            console.error("Error updating player state:", error);
            showNotification("Failed to save progress.");
            setPlayerState(previousState);
        }
    }, [userId, playerState, showNotification]);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setPlayerState(null);
            return;
        }

        let playerChannel: InstanceType<typeof RealtimeChannel> | null = null;
        let mailChannel: InstanceType<typeof RealtimeChannel> | null = null;
        let patchNotesChannel: InstanceType<typeof RealtimeChannel> | null = null;
        let retryTimeout: ReturnType<typeof setTimeout> | null = null;

        const fetchPlayer = async () => {
            if (fetchAttempt.current === 0) setLoading(true);
            
            const { data, error } = await supabaseClient.from('players').select('*').eq('userId', userId).single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching player data:", error);
                showNotification(`Error: ${error.message}`);
                setPlayerState(null);
                setLoading(false);
                return;
            }
            
            if (data) {
                setPlayerState(data);
                setLoading(false);
            } else {
                fetchAttempt.current += 1;
                if (fetchAttempt.current <= 3) {
                    retryTimeout = setTimeout(fetchPlayer, 1500 * fetchAttempt.current);
                } else {
                    console.error("Player profile not found for userId:", userId);
                    showNotification("Could not load profile. If you're new, the profile might be creating. Please re-login.");
                    setPlayerState(null);
                    setLoading(false);
                }
            }
        };
        
        const fetchMail = async (isInitialLoad = false) => {
             const { data, error } = await supabaseClient.from('mail').select('*').eq('recipient_user_id', userId).order('created_at', { ascending: false });
            if (error) {
                console.error("Error fetching mail:", error);
                if (error.code === 'PGRST205') { 
                    showNotification("Mail system not set up. See App.tsx instructions.");
                } else {
                    showNotification(`Error fetching mail: ${error.message}`);
                }
            } else if (data) {
                setMail(data as Mail[]);
                // Check for unread mail on initial load (User offline -> online)
                if (isInitialLoad) {
                    const hasUnread = (data as Mail[]).some(m => !m.is_claimed);
                    if (hasUnread) {
                        showNotification("Please check your Mailbox, click the avatar icon.");
                    }
                }
            }
        }

        const fetchPatchNotes = async () => {
            const { data, error } = await supabaseClient.from('patch_notes').select('*').order('created_at', { ascending: false });
            if (error) {
                console.error("Error fetching patch notes:", error);
                // Check for missing table error codes (PGRST205 or 42P01)
                if (error.code === 'PGRST205' || error.code === '42P01') {
                    setPatchNotesError(true);
                }
            } else if (data) {
                setPatchNotes(data as PatchNote[]);
                setPatchNotesError(false);
            }
        };

        fetchPlayer();
        fetchMail(true); // Pass true for initial load
        fetchPatchNotes();

        playerChannel = supabaseClient.channel(`player-${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `userId=eq.${userId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        if (retryTimeout) clearTimeout(retryTimeout);
                        fetchAttempt.current = 0;
                        setPlayerState(payload.new as PlayerState);
                        setLoading(false);
                    } else if (payload.eventType === 'DELETE') {
                        setPlayerState(null);
                    }
                }
            ).subscribe();

        mailChannel = supabaseClient.channel(`mail-${userId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mail', filter: `recipient_user_id=eq.${userId}` },
                (payload) => {
                    // Realtime notification when new mail arrives
                    if (payload.eventType === 'INSERT') {
                        showNotification("Please check your Mailbox, click the avatar icon.");
                    }
                    fetchMail(false);
                }
            ).subscribe();

        patchNotesChannel = supabaseClient.channel('public-patch-notes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'patch_notes' }, 
                () => {
                    fetchPatchNotes();
                }
            ).subscribe();
            
        return () => {
            if (playerChannel) supabaseClient.removeChannel(playerChannel);
            if (mailChannel) supabaseClient.removeChannel(mailChannel);
            if (patchNotesChannel) supabaseClient.removeChannel(patchNotesChannel);
            if (retryTimeout) clearTimeout(retryTimeout);
            fetchAttempt.current = 0;
        };
    }, [userId, showNotification]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (playerState?.activePotionEffects) {
                const now = Date.now();
                const effects = { ...playerState.activePotionEffects };
                let changed = false;
                for (const potionType of Object.keys(effects) as PotionType[]) {
                    const effect = effects[potionType];
                    if (effect && effect.expiresAt < now) {
                        delete effects[potionType];
                        changed = true;
                        showNotification(`${potionType} Potion has worn off.`);
                    }
                }
                if (changed) {
                    updatePlayerState({ activePotionEffects: effects });
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [playerState?.activePotionEffects, updatePlayerState, showNotification]);
    
    useEffect(() => {
        if (lastCaughtFish) {
            const timer = setTimeout(() => setLastCaughtFish(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [lastCaughtFish]);

    const addCaughtFish = useCallback(async (fish: Omit<Fish, 'id' | 'value'> & { value?: number }) => {
        if (!playerState) return;

        const finalValue = fish.value ?? Math.floor((FISH_DATA[fish.map]?.find(f => f.name === fish.name)?.baseValue || 10) * TIERS[fish.tier].valueMultiplier * (fish.weight / 1000));
        const finalFish: Fish = { ...fish, id: crypto.randomUUID(), value: finalValue, isFavorited: false };

        if (playerState.backpack.length >= playerState.backpackCapacity) {
            showNotification("Backpack is full! Sell some fish to make space.");
            setLastCaughtFish(finalFish);
            return;
        }
        
        const newBackpack = [...playerState.backpack, finalFish];
        const newCollection = { ...playerState.collection };
        if (!newCollection[finalFish.name] || newCollection[finalFish.name].maxWeight < finalFish.weight) {
            newCollection[finalFish.name] = { count: (newCollection[finalFish.name]?.count || 0) + 1, maxWeight: finalFish.weight };
        } else {
             newCollection[finalFish.name].count += 1;
        }
        
        let newCrystals = playerState.stonehengeCrystals;
        if (playerState.currentMapId === 'corrust' && Math.random() < 0.04021) {
            newCrystals += 1;
            showNotification("You found a Stonehenge Crystal!");
        }

        setLastCaughtFish(finalFish);
        
        const xpGained = TIERS[finalFish.tier].valueMultiplier * 10 + Math.floor(finalFish.weight / 100);
        let newXp = playerState.xp + xpGained;
        let newLevel = playerState.level;
        let newXpToNext = playerState.xpToNextLevel;

        while (newXp >= newXpToNext) {
            newXp -= newXpToNext;
            newLevel += 1;
            newXpToNext = Math.floor(BASE_XP * Math.pow(newLevel, LEVEL_SCALING_FACTOR));
            showNotification(`Level Up! You are now level ${newLevel}!`);
        }
        
        await updatePlayerState({ backpack: newBackpack, collection: newCollection, stonehengeCrystals: newCrystals, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext });
    }, [playerState, showNotification, updatePlayerState]);
    
    const consumeBait = useCallback(async () => {
        if (!playerState || playerState.bait <= 0) return;
        await updatePlayerState({ bait: playerState.bait - 1 });
    }, [playerState, updatePlayerState]);

    const buyBait = useCallback(async (amount: number, price: number) => {
        if (!playerState) return;
        if (playerState.coins < price) {
            showNotification("Not enough coins.");
            return;
        }
        showNotification(`Bought ${amount} bait!`);
        await updatePlayerState({ coins: playerState.coins - price, bait: playerState.bait + amount });
    }, [playerState, showNotification, updatePlayerState]);

    const sellFish = useCallback(async (fishId: string) => {
        if (!playerState) return;
        const fishToSell = playerState.backpack.find(f => f.id === fishId);
        if (!fishToSell) return;

        if (fishToSell.isFavorited) {
            showNotification("Cannot sell a favorited fish.");
            return;
        }

        let crystalsGained = 0;
        const tier = fishToSell.tier;
        if (tier === TierName.Epic && Math.random() < 0.25) crystalsGained = 1;
        else if (tier === TierName.Legendary && Math.random() < 0.50) crystalsGained = 1 + Math.floor(Math.random() * 2);
        else if (tier === TierName.Mythic) crystalsGained = 2 + Math.floor(Math.random() * 3);
        else if (tier === TierName.Secret) crystalsGained = 5 + Math.floor(Math.random() * 6);

        if (crystalsGained > 0) showNotification(`You found ${crystalsGained} Stonehenge Crystal(s)! 💎`);

        showNotification(`Sold ${fishToSell.name} for ${formatNumber(fishToSell.value)} 両`);
        await updatePlayerState({
            coins: playerState.coins + fishToSell.value,
            backpack: playerState.backpack.filter(f => f.id !== fishId),
            stonehengeCrystals: playerState.stonehengeCrystals + crystalsGained,
        });
    }, [playerState, showNotification, updatePlayerState]);

    const sellAllFish = useCallback(async () => {
        if (!playerState) return;
        const fishToSell = playerState.backpack.filter(f => !f.isFavorited);
        if (fishToSell.length === 0) {
            showNotification("No unfavorited fish to sell.");
            return;
        }
        const totalValue = fishToSell.reduce((sum, f) => sum + f.value, 0);
        
        let totalCrystalsGained = 0;
        fishToSell.forEach(fish => {
            let crystalsGained = 0;
            const tier = fish.tier;
            if (tier === TierName.Epic && Math.random() < 0.25) crystalsGained = 1;
            else if (tier === TierName.Legendary && Math.random() < 0.50) crystalsGained = 1 + Math.floor(Math.random() * 2);
            else if (tier === TierName.Mythic) crystalsGained = 2 + Math.floor(Math.random() * 3);
            else if (tier === TierName.Secret) crystalsGained = 5 + Math.floor(Math.random() * 6);
            totalCrystalsGained += crystalsGained;
        });

        if (totalCrystalsGained > 0) showNotification(`You found ${totalCrystalsGained} Stonehenge Crystal(s)! 💎`);
        
        const favoritedFish = playerState.backpack.filter(f => f.isFavorited);
        showNotification(`Sold ${fishToSell.length} fish for ${formatNumber(totalValue)} 両`);
        await updatePlayerState({
            coins: playerState.coins + totalValue,
            backpack: favoritedFish,
            stonehengeCrystals: playerState.stonehengeCrystals + totalCrystalsGained,
        });
    }, [playerState, showNotification, updatePlayerState]);

    const buyRod = useCallback(async (rodId: number) => {
        if (!playerState) return;
        const rodToBuy = RODS.find(r => r.id === rodId);
        if (!rodToBuy) return;
        if (playerState.ownedRodIds.includes(rodId)) {
            showNotification("You already own this rod."); return;
        }

        let updates: Partial<PlayerState> | null = null;
        if (typeof rodToBuy.price === 'number') {
            if (playerState.coins < rodToBuy.price) { showNotification("Not enough coins."); return; }
            updates = { coins: playerState.coins - rodToBuy.price, ownedRodIds: [...playerState.ownedRodIds, rodId] };
        } 
        else if (rodToBuy.price.includes("Stonehenge")) {
             const requiredCrystals = parseInt(rodToBuy.price.split(" ")[0]);
             if (playerState.stonehengeCrystals < requiredCrystals) { showNotification(`You need ${requiredCrystals} Stonehenge Crystals.`); return; }
             updates = { stonehengeCrystals: playerState.stonehengeCrystals - requiredCrystals, ownedRodIds: [...playerState.ownedRodIds, rodId] };
        }
        else if (rodToBuy.price.startsWith("Lv.")) {
            if (playerState.level < rodToBuy.levelReq) { showNotification("You are not high enough level to unlock this rod."); return; }
            updates = { ownedRodIds: [...playerState.ownedRodIds, rodId] };
        }

        if (updates) {
            showNotification(`Purchased ${rodToBuy.name}!`);
            await updatePlayerState(updates);
        } else {
            showNotification("This rod cannot be acquired at this time.");
        }
    }, [playerState, showNotification, updatePlayerState]);
    
    const equipRod = useCallback(async (rodId: number) => {
        if (!playerState || !playerState.ownedRodIds.includes(rodId)) return;
        showNotification(`Equipped ${RODS.find(r=>r.id===rodId)?.name}.`);
        await updatePlayerState({ currentRodId: rodId });
    }, [playerState, showNotification, updatePlayerState]);

    const buyPotion = useCallback(async (potionId: PotionType) => {
        if (!playerState) return;
        const potion = POTIONS.find(p => p.id === potionId);
        if (!potion) return;

        if (playerState.coins < potion.price) { showNotification("Not enough coins."); return; }

        const now = Date.now();
        const currentEffect = playerState.activePotionEffects[potionId];
        const currentStacks = currentEffect && currentEffect.expiresAt > now ? currentEffect.stacks : 0;
        const currentExpiresAt = currentEffect && currentEffect.expiresAt > now ? currentEffect.expiresAt : now;
        
        const newEffects = {
            ...playerState.activePotionEffects,
            [potionId]: { expiresAt: currentExpiresAt + potion.durationMinutes * 60 * 1000, stacks: currentStacks + 1 },
        };
        
        showNotification(`Used ${potion.name}!`);
        await updatePlayerState({ coins: playerState.coins - potion.price, activePotionEffects: newEffects });
    }, [playerState, showNotification, updatePlayerState]);

    const changeMap = useCallback(async (mapId: string) => {
        if (!playerState) return;
        const map = MAPS.find(m => m.id === mapId);
        if (!map) return;
        showNotification(`Traveled to ${map.name}.`);
        await updatePlayerState({ currentMapId: mapId });
    }, [playerState, showNotification, updatePlayerState]);
    
    const changeAvatar = useCallback(async (avatar: string) => {
        if (!playerState) return;
        showNotification(`Avatar changed!`);
        await updatePlayerState({ avatar });
    }, [playerState, showNotification, updatePlayerState]);

    const toggleAutoFishing = useCallback(async () => {
        if (!playerState) return;
        if (playerState.level < AUTO_FISHING_UNLOCK_LEVEL) { showNotification(`Auto-fishing unlocks at Level ${AUTO_FISHING_UNLOCK_LEVEL}.`); return; }
        if (!playerState.isAutoFishing && playerState.bait <= 0) { showNotification("You need bait to start auto-fishing!"); return; }
        if (!playerState.isAutoFishing && playerState.backpack.length >= playerState.backpackCapacity) { showNotification("Backpack is full! Cannot start auto-fishing."); return; }

        const newAutoFishingState = !playerState.isAutoFishing;
        showNotification(`Auto-fishing ${newAutoFishingState ? 'enabled' : 'disabled'}.`);
        await updatePlayerState({ isAutoFishing: newAutoFishingState });
    }, [playerState, showNotification, updatePlayerState]);

    const enchantRod = useCallback(async (rodId: number) => {
        if (!playerState) return;

        const currentEnchantments = playerState.rodEnchantments?.[rodId] ?? [];
        if (playerState.stonehengeCrystals < ENCHANTMENT_COST) { showNotification("Not enough Stonehenge Crystals."); return; }
        if (currentEnchantments.length >= MAX_ENCHANTMENTS) { showNotification("This rod cannot be enchanted further."); return; }

        const enchantmentTypes = [EnchantmentType.Luck, EnchantmentType.Speed, EnchantmentType.Weight, EnchantmentType.Coins, EnchantmentType.XP];
        const type = enchantmentTypes[Math.floor(Math.random() * enchantmentTypes.length)];
        let value = 0;
        switch (type) {
            case EnchantmentType.Luck: value = 2 + Math.floor(Math.random() * 4); break;
            case EnchantmentType.Speed: value = 2 + Math.floor(Math.random() * 4); break;
            case EnchantmentType.Weight: value = 3 + Math.floor(Math.random() * 8); break;
            case EnchantmentType.Coins: value = 1 + Math.floor(Math.random() * 5); break;
            case EnchantmentType.XP: value = 1 + Math.floor(Math.random() * 5); break;
        }

        const newRodEnchantments = { ...playerState.rodEnchantments, [rodId]: [...currentEnchantments, { type, value }] };
        showNotification(`Enchanted! +${value}% ${type}`);
        await updatePlayerState({ stonehengeCrystals: playerState.stonehengeCrystals - ENCHANTMENT_COST, rodEnchantments: newRodEnchantments });
    }, [playerState, showNotification, updatePlayerState]);

    const claimMail = useCallback(async (mailItem: Mail) => {
        if (!playerState || mailItem.is_claimed) return;

        const hasAnyRewards = (mailItem.rewards.coins || 0) > 0 || (mailItem.rewards.bait || 0) > 0 || (mailItem.rewards.stonehengeCrystals || 0) > 0;
        const { error: updateError } = await supabaseClient.from('mail').update({ is_claimed: true }).eq('id', mailItem.id);
        if (updateError) {
            showNotification("Failed to process mail. Please try again.");
            console.error("Error processing mail:", updateError);
            return;
        }
        
        if (hasAnyRewards) {
            await updatePlayerState({
                coins: playerState.coins + (mailItem.rewards.coins || 0),
                bait: playerState.bait + (mailItem.rewards.bait || 0),
                stonehengeCrystals: playerState.stonehengeCrystals + (mailItem.rewards.stonehengeCrystals || 0),
            });
        }

        setMail(prevMail => prevMail.map(m => m.id === mailItem.id ? { ...m, is_claimed: true } : m));
        showNotification(hasAnyRewards ? "Rewards claimed!" : "Mail marked as read.");
    }, [playerState, updatePlayerState, showNotification]);

    const deleteMail = useCallback(async (mailId: string) => {
        const { error } = await supabaseClient.from('mail').delete().eq('id', mailId);
        if (error) {
            showNotification("Failed to delete mail.");
            console.error("Error deleting mail:", error);
        } else {
            setMail(prevMail => prevMail.filter(m => m.id !== mailId));
            showNotification("Mail deleted.");
        }
    }, [showNotification]);

    const deleteAllClaimedMail = useCallback(async () => {
        const claimedMailIds = mail.filter(m => m.is_claimed).map(m => m.id);
        if (claimedMailIds.length === 0) { showNotification("No claimed mail to delete."); return; }

        const { error } = await supabaseClient.from('mail').delete().in('id', claimedMailIds);
        if (error) {
            showNotification("Failed to delete all claimed mail.");
            console.error("Error deleting mail:", error);
        } else {
            setMail(prevMail => prevMail.filter(m => !m.is_claimed));
            showNotification("All claimed mail deleted.");
        }
    }, [mail, showNotification]);

    const toggleFavoriteFish = useCallback(async (fishId: string) => {
        if (!playerState) return;

        const newBackpack = playerState.backpack.map(fish => {
            if (fish.id === fishId) {
                return { ...fish, isFavorited: !fish.isFavorited };
            }
            return fish;
        });
        
        await updatePlayerState({ backpack: newBackpack });
    }, [playerState, updatePlayerState]);

    const completeTutorial = useCallback(async () => {
        if (!playerState) return;
        await updatePlayerState({ hasCompletedTutorial: true });
    }, [playerState, updatePlayerState]);

    const resetTutorial = useCallback(async () => {
        if (!playerState) return;
        await updatePlayerState({ hasCompletedTutorial: false });
    }, [playerState, updatePlayerState]);

    return {
        playerState, loading, notification, lastCaughtFish, mail, patchNotes, patchNotesError,
        actions: {
            addCaughtFish, consumeBait, buyBait, sellFish, sellAllFish, buyRod,
            equipRod, buyPotion, changeMap, changeAvatar, toggleAutoFishing,
            enchantRod, claimMail, deleteMail, deleteAllClaimedMail, showNotification,
            toggleFavoriteFish, completeTutorial, resetTutorial
        }
    };
};
