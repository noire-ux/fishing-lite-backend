
export enum TierName {
    Common = "Common",
    Uncommon = "Uncommon",
    Rare = "Rare",
    Epic = "Epic",
    Legendary = "Legendary",
    Mythic = "Mythic",
    Secret = "Secret",
}

export enum PotionType {
    Lucky = "Lucky",
    Mutation = "Mutation",
}

export enum EnchantmentType {
    Luck = "Luck",
    Speed = "Speed",
    Weight = "Max Weight",
    Coins = "Bonus Coins",
    XP = "Bonus XP",
}

export interface Enchantment {
    type: EnchantmentType;
    value: number;
}

export interface Tier {
    name: TierName;
    color: string;
    probability: number;
    valueMultiplier: number;
}

export interface FishingRod {
    id: number;
    name: string;
    price: number | string;
    levelReq: number;
    speed: number;
    luck: number;
    maxWeight: number;
    passive: string;
    color: string;
}

export interface Potion {
    id: PotionType;
    name: string;
    price: number;
    description: string;
    durationMinutes: number;
}

export interface Fish {
    id: string; // Unique instance ID
    name: string;
    map: string;
    tier: TierName;
    weight: number;
    mutation?: string;
    value: number;
    isFavorited?: boolean;
}

export interface GameMap {
    id: string;
    name: string;
    description: string;
    fishTiers: Partial<Record<TierName, number>>;
    specialItem?: { name: string };
}

export interface PlayerCollection {
    [fishName: string]: {
        count: number;
        maxWeight: number;
    };
}

export interface PlayerState {
    userId: string; // Unique identifier for Supabase
    name: string;
    avatar: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    coins: number;
    currentRodId: number;
    ownedRodIds: number[];
    backpack: Fish[];
    backpackCapacity: number;
    collection: PlayerCollection;
    currentMapId: string;
    stonehengeCrystals: number;
    rodEnchantments: Record<number, Enchantment[] | undefined>;
    bait: number;
    isAutoFishing: boolean;
    activePotionEffects: {
        [key in PotionType]?: {
            expiresAt: number; // timestamp
            stacks: number;
        };
    };
    role: 'admin' | 'user';
    hasCompletedTutorial?: boolean;
}

export interface Mail {
    id: string;
    recipient_user_id: string;
    sender_name: string;
    subject: string;
    body: string;
    rewards: {
        coins?: number;
        bait?: number;
        stonehengeCrystals?: number;
    };
    is_claimed: boolean;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    sender_name: string;
    sender_avatar: string;
    content: string;
    created_at: string;
}

export interface PatchNoteEntry {
    type: 'add' | 'update' | 'remove';
    text: string;
}

export interface PatchNote {
    id: string;
    version: string;
    release_date: string;
    content: PatchNoteEntry[];
    created_at: string;
}

export type GameView = "FISHING" | "INFO" | "BACKPACK" | "SHOP" | "MAPS" | "ADMIN";