import type { TierName, FishingRod, Enchantment } from '../../types';
import { EnchantmentType } from '../../types';

export const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return Math.floor(num).toString();
};

export const getTierColorClass = (tier: TierName, type: 'bg' | 'text' | 'border'): string => {
    const colorName = tier.toLowerCase();
    return `${type}-${colorName}`;
}

export const formatDuration = (ms: number): string => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

export const getFishIcon = (fishName: string): string => {
    const fishEmojis = ['淡', '鯉', '鰻', '鮭', '鮪', '鯛', '鯵', '鮫', '河', '鮃', '鰒'];
    // Simple hash function to get a consistent emoji for each fish name
    let hash = 0;
    for (let i = 0; i < fishName.length; i++) {
        const char = fishName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % fishEmojis.length;
    return fishEmojis[index];
};

export const calculateEnchantedStats = (rod: FishingRod, enchantments: Enchantment[] = []) => {
    const enchantedStats = { luck: 0, speed: 0, weight: 0 };
    enchantments.forEach(e => {
        if (e.type === EnchantmentType.Luck) enchantedStats.luck += e.value;
        if (e.type === EnchantmentType.Speed) enchantedStats.speed += e.value;
        if (e.type === EnchantmentType.Weight) enchantedStats.weight += e.value;
    });
    return {
        luck: rod.luck + enchantedStats.luck,
        speed: rod.speed + enchantedStats.speed,
        maxWeight: rod.maxWeight * (1 + enchantedStats.weight / 100),
        bonuses: enchantedStats,
    };
};