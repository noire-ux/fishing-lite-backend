
import { Tier, TierName, FishingRod, GameMap, Potion, PotionType } from './types';

// VAPID Public Key untuk Web Push Notifications
export const VAPID_PUBLIC_KEY = "BCeJe4phmCV4Tfulku_8YEmZhJk7pilGYxWg9nSDtTnlHhZvUZNCVjvrfc51UrFlCtOQg0CCS0hmUDM-J7XxKVE";

export const TIERS: Record<TierName, Tier> = {
    [TierName.Common]: { name: TierName.Common, color: "bg-common", probability: 45, valueMultiplier: 1 },
    [TierName.Uncommon]: { name: TierName.Uncommon, color: "bg-uncommon", probability: 25, valueMultiplier: 2 },
    [TierName.Rare]: { name: TierName.Rare, color: "bg-rare", probability: 15, valueMultiplier: 3 },
    [TierName.Epic]: { name: TierName.Epic, color: "bg-epic", probability: 8, valueMultiplier: 5 },
    [TierName.Legendary]: { name: TierName.Legendary, color: "bg-legendary", probability: 4, valueMultiplier: 8 },
    [TierName.Mythic]: { name: TierName.Mythic, color: "bg-mythic", probability: 2, valueMultiplier: 12 },
    [TierName.Secret]: { name: TierName.Secret, color: "bg-secret", probability: 1, valueMultiplier: 20 },
};

export const TIER_ORDER: TierName[] = [TierName.Common, TierName.Uncommon, TierName.Rare, TierName.Epic, TierName.Legendary, TierName.Mythic, TierName.Secret];

export const RODS: FishingRod[] = [
    { id: 0, name: "Starter Rod", price: 0, levelReq: 1, speed: 35, luck: 25, maxWeight: 5000, passive: "+5% Luck to help new players.", color: '#A0522D' },
    { id: 100, name: "Celestial Rod", price: 75000, levelReq: 10, speed: 50, luck: 60, maxWeight: 50000, passive: "After 50 fish, +23% Luck for next cast. +3% Mutation chance.", color: '#87CEEB' },
    { id: 13, name: "Crystal Rod", price: 180000, levelReq: 20, speed: 65, luck: 85, maxWeight: 25000, passive: "Catching a Legendary gives +6% Luck (max 5 stacks).", color: '#AFEEEE' },
    { id: 15, name: "Thunder Rod", price: 350000, levelReq: 30, speed: 70, luck: 95, maxWeight: 30000, passive: "+25% Luck after a Rare catch for the next cast.", color: '#FFD700' },
    { id: 11, name: "Abyssal Rod", price: 600000, levelReq: 40, speed: 45, luck: 140, maxWeight: 35000, passive: "11% chance for 2.5x value mutation. -30% effectiveness in daytime.", color: '#483D8B' },
    { id: 5, name: "Rod of the Depths", price: 900000, levelReq: 50, speed: 65, luck: 130, maxWeight: 40000, passive: "After 3 Legendary catches, get a bonus Epic. +4% Stonehenge Crystal chance.", color: '#008080' },
    { id: 12, name: "Infernal Rod", price: 1250000, levelReq: 60, speed: 55, luck: 110, maxWeight: 40000, passive: "20% mutation chance. +17% speed after an Epic catch for next cast.", color: '#DC143C' },
    { id: 14, name: "Ancient Rod", price: 1750000, levelReq: 75, speed: 40, luck: 175, maxWeight: 45000, passive: "10% bonus Stonehenge Crystal chance. 5% chance for 10x value mutation.", color: '#DEB887' },
    { id: 6, name: "Kraken Rod", price: 2500000, levelReq: 100, speed: 60, luck: 185, maxWeight: 90000, passive: "+35% Luck after an Epic catch for next cast.", color: '#4682B4' },
    { id: 8, name: "Poseidon Rod", price: 3800000, levelReq: 125, speed: 50, luck: 165, maxWeight: 80000, passive: "20% chance to catch fish heavier than max weight.", color: '#5F9EA0' },
    { id: 4, name: "Heaven's Rod", price: 5500000, levelReq: 150, speed: 30, luck: 225, maxWeight: 95000, passive: "13% chance for a random mutation with 5x value.", color: '#FAFAD2' },
    { id: 16, name: "Galactic Rod", price: 8000000, levelReq: 200, speed: 85, luck: 155, maxWeight: 160000, passive: "A mutation catch gives +38% Luck & +9% Speed for next cast.", color: '#9400D3' },
    { id: 7, name: "Zeus Rod", price: 12500000, levelReq: 250, speed: 70, luck: 90, maxWeight: 330000, passive: "+45% Luck after a Rare catch. +10% mutation chance.", color: '#FFFF00' },
    { id: 9, name: "Spooky Rod", price: "10 Stonehenge", levelReq: 300, speed: 75, luck: 66, maxWeight: 170000, passive: "75% chance for a random mutation. +23% Luck.", color: '#FF8C00' },
    { id: 3, name: "No-Life Rod", price: "Lv. 500", levelReq: 500, speed: 97, luck: 175, maxWeight: 300000, passive: "+100% Luck, +50% Speed. -20% rare item chance.", color: '#696969' },
    { id: 2, name: "Ethereal Prism Rod", price: 25000000, levelReq: 750, speed: 95, luck: 225, maxWeight: 455000, passive: "38% high chance for mutation. +35% Luck after an Uncommon catch.", color: '#DA70D6' },
    { id: 1, name: "Seraphic Rod", price: "Lv. 1000", levelReq: 1000, speed: 138, luck: 368, maxWeight: 600000, passive: "Instant catch ability. +140% Luck, +60% Mutation chance.", color: '#FFFAF0' },
];

export const POTIONS: Potion[] = [
    { id: PotionType.Lucky, name: "Lucky Potion", price: 25000, description: "Boosts Luck by a flat 50% for 4 minutes. Stacks!", durationMinutes: 4 },
    { id: PotionType.Mutation, name: "Mutation Potion", price: 50000, description: "Increases mutation chance by a flat 33% for 4 minutes. Stacks!", durationMinutes: 4 },
];

export const AVATARS: string[] = [
    '😀', '😎', '🤠', '👽', '🤖', '🦊', '🐙', '🐳'
];

export const MUTATIONS: string[] = [
    "Ethereal Current", "Abyssal Sting", "Siren's Reflection", "Scale Tempest", "Deepest Echo",
    "Tidal Force", "Coral Net", "Neptune's Vortex", "Salt Mist", "Moss Aura",
    "Crystal Shard", "Triton's Aim", "Silent Wave", "Ocean Ritual", "Water Heart",
    "Chroma Shift", "Kelp Entwine", "Dawn Light", "Void Pressure", "Starlight Droplet",
    "Carbon Core", "Thread Bind", "Mermaid's Vow", "Spore Velocity", "Glacial Touch",
    "Mirror Surface", "Mineral Chain", "Shadow Strength", "Foam Resonance", "Tectonic Plate",
];

export const MAPS: GameMap[] = [
    { id: 'etonia', name: 'Etonia', description: 'A calm starting area, perfect for beginners.', fishTiers: { [TierName.Common]: 55, [TierName.Uncommon]: 25, [TierName.Rare]: 15, [TierName.Legendary]: 4, [TierName.Mythic]: 1 } },
    { id: 'corrust', name: 'Corrust Isle', description: 'A mysterious island with a chance to find Stonehenge Crystals.', fishTiers: { [TierName.Common]: 30, [TierName.Uncommon]: 25, [TierName.Rare]: 20, [TierName.Epic]: 12, [TierName.Legendary]: 8, [TierName.Mythic]: 4, [TierName.Secret]: 1 }, specialItem: { name: 'a Stonehenge Crystal' } },
    { id: 'aster', name: 'Aster Ragon', description: 'Volcanic waters where fiery fish dwell.', fishTiers: { [TierName.Common]: 10, [TierName.Uncommon]: 30, [TierName.Rare]: 28, [TierName.Epic]: 15, [TierName.Legendary]: 10, [TierName.Mythic]: 5, [TierName.Secret]: 2 } },
    { id: 'bafadu', name: 'Bafadu Void Isle', description: 'An eerie void where strange, dark creatures lurk.', fishTiers: { [TierName.Common]: 5, [TierName.Uncommon]: 15, [TierName.Rare]: 30, [TierName.Epic]: 25, [TierName.Legendary]: 15, [TierName.Mythic]: 8, [TierName.Secret]: 2 } },
    { id: 'zonoth', name: 'Zonoth Sea', description: 'Deep sea trenches holding ancient and massive fish.', fishTiers: { [TierName.Common]: 5, [TierName.Uncommon]: 10, [TierName.Rare]: 30, [TierName.Legendary]: 35, [TierName.Mythic]: 15, [TierName.Secret]: 5 } },
    { id: 'panamia', name: 'Panamia Lost Isle', description: 'A legendary, hidden island where mythical fish are rumored to live.', fishTiers: { [TierName.Common]: 2, [TierName.Uncommon]: 8, [TierName.Rare]: 15, [TierName.Epic]: 25, [TierName.Legendary]: 30, [TierName.Mythic]: 15, [TierName.Secret]: 5 } },
    { id: 'altar', name: 'Enchanting Altar', description: 'A sacred place to imbue your fishing rods with powerful enchantments.', fishTiers: {} },
];

export const FISH_DATA: Record<string, { name: string; tier: TierName; baseValue: number }[]> = {
    etonia: [
        // Common
        { name: "Etonian Fry", tier: TierName.Common, baseValue: 5 },
        { name: "Mud Skipper", tier: TierName.Common, baseValue: 6 },
        { name: "River Shrimp", tier: TierName.Common, baseValue: 7 },
        { name: "Pebble Loach", tier: TierName.Common, baseValue: 5 },
        { name: "Green Darter", tier: TierName.Common, baseValue: 8 },
        { name: "Common Roach", tier: TierName.Common, baseValue: 6 },
        { name: "Stickleback", tier: TierName.Common, baseValue: 7 },
        { name: "Small Bream", tier: TierName.Common, baseValue: 8 },
        // Uncommon
        { name: "Striped Perch", tier: TierName.Uncommon, baseValue: 12 },
        { name: "Bronze Carp", tier: TierName.Uncommon, baseValue: 15 },
        { name: "Glass Catfish", tier: TierName.Uncommon, baseValue: 14 },
        { name: "Spotted Bullhead", tier: TierName.Uncommon, baseValue: 16 },
        { name: "Rainbow Shiner", tier: TierName.Uncommon, baseValue: 18 },
        { name: "Eel Goby", tier: TierName.Uncommon, baseValue: 20 },
        // Rare
        { name: "Golden Tench", tier: TierName.Rare, baseValue: 30 },
        { name: "Silver Trout", tier: TierName.Rare, baseValue: 35 },
        { name: "Diamond Tetra", tier: TierName.Rare, baseValue: 40 },
        { name: "Ghost Pike", tier: TierName.Rare, baseValue: 45 },
        // Legendary
        { name: "First Sagefish", tier: TierName.Legendary, baseValue: 150 },
        { name: "River Guardian", tier: TierName.Legendary, baseValue: 175 },
        { name: "Etonian Jewel", tier: TierName.Legendary, baseValue: 200 },
        // Mythic
        { name: "Originator Guppy", tier: TierName.Mythic, baseValue: 500 },
    ],
    corrust: [
        // Common
        { name: "Rusty Sardine", tier: TierName.Common, baseValue: 20 },
        { name: "Ironhead Minnow", tier: TierName.Common, baseValue: 22 },
        { name: "Copperfin", tier: TierName.Common, baseValue: 25 },
        { name: "Lead Sinker", tier: TierName.Common, baseValue: 23 },
        { name: "Scrap Mackerel", tier: TierName.Common, baseValue: 26 },
        { name: "Barnacle Goby", tier: TierName.Common, baseValue: 28 },
        { name: "Salt-Stained Wrasse", tier: TierName.Common, baseValue: 30 },
        // Uncommon
        { name: "Geode Guppy", tier: TierName.Uncommon, baseValue: 45 },
        { name: "Cobalt Flounder", tier: TierName.Uncommon, baseValue: 50 },
        { name: "Quartz Bass", tier: TierName.Uncommon, baseValue: 55 },
        { name: "Pyrite Puffer", tier: TierName.Uncommon, baseValue: 60 },
        { name: "Obsidian Snapper", tier: TierName.Uncommon, baseValue: 65 },
        // Rare
        { name: "Crystal-Vein Tuna", tier: TierName.Rare, baseValue: 90 },
        { name: "Amethyst Eel", tier: TierName.Rare, baseValue: 100 },
        { name: "Jade-Eyed Shark", tier: TierName.Rare, baseValue: 110 },
        // Epic
        { name: "Corrupted Leviathan", tier: TierName.Epic, baseValue: 250 },
        { name: "Runic Stonelord", tier: TierName.Epic, baseValue: 275 },
        { name: "Heart of the Isle", tier: TierName.Epic, baseValue: 300 },
        // Legendary
        { name: "Stonehenge Sentinel", tier: TierName.Legendary, baseValue: 700 },
        { name: "Gilded Kraken", tier: TierName.Legendary, baseValue: 750 },
        { name: "Crystal Titan", tier: TierName.Legendary, baseValue: 800 },
        // Mythic
        { name: "World-Shaper's Remnant", tier: TierName.Mythic, baseValue: 2000 },
        { name: "The First Crystal", tier: TierName.Mythic, baseValue: 2200 },
        // Secret
        { name: "??-Type: Null", tier: TierName.Secret, baseValue: 10000 },
        { name: "Glitched Reality-Fish", tier: TierName.Secret, baseValue: 12000 },
    ],
    aster: [
        // Common
        { name: "Cinder Minnow", tier: TierName.Common, baseValue: 60 },
        { name: "Ash Guppy", tier: TierName.Common, baseValue: 62 },
        { name: "Smoldering Shrimp", tier: TierName.Common, baseValue: 65 },
        { name: "Pumice Stonefish", tier: TierName.Common, baseValue: 68 },
        { name: "Basalt Bass", tier: TierName.Common, baseValue: 70 },
        { name: "Lava-Warmed Crab", tier: TierName.Common, baseValue: 72 },
        { name: "Char Loach", tier: TierName.Common, baseValue: 75 },
        { name: "Soot Angelfish", tier: TierName.Common, baseValue: 78 },
        { name: "Ember Tetra", tier: TierName.Common, baseValue: 80 },
        // Uncommon
        { name: "Magma Grouper", tier: TierName.Uncommon, baseValue: 120 },
        { name: "Ignited Eel", tier: TierName.Uncommon, baseValue: 130 },
        { name: "Volcanic Glassfish", tier: TierName.Uncommon, baseValue: 140 },
        { name: "Fire-Bellied Newtfish", tier: TierName.Uncommon, baseValue: 150 },
        { name: "Sunken Cinderwyrm", tier: TierName.Uncommon, baseValue: 160 },
        // Rare
        { name: "Obsidian Shark", tier: TierName.Rare, baseValue: 250 },
        { name: "Blazing Coelacanth", tier: TierName.Rare, baseValue: 275 },
        { name: "Inferno-Core Lobster", tier: TierName.Rare, baseValue: 300 },
        { name: "Solar Flare Flounder", tier: TierName.Rare, baseValue: 325 },
        // Epic
        { name: "Molten Leviathan", tier: TierName.Epic, baseValue: 600 },
        { name: "Ragon's Rage", tier: TierName.Epic, baseValue: 650 },
        // Legendary
        { name: "Primordial Magmasaur", tier: TierName.Legendary, baseValue: 1500 },
        { name: "Heart of the Volcano", tier: TierName.Legendary, baseValue: 1600 },
        { name: "Phoenix Fish", tier: TierName.Legendary, baseValue: 1700 },
        // Mythic
        { name: "Aster, the World's Core", tier: TierName.Mythic, baseValue: 5000 },
        // Secret
        { name: "Comet Fragment", tier: TierName.Secret, baseValue: 15000 },
        { name: "Sun-Eater Serpent", tier: TierName.Secret, baseValue: 16000 },
        { name: "Star-Forged Whale", tier: TierName.Secret, baseValue: 17000 },
    ],
    bafadu: [
        // Common
        { name: "Shade Loach", tier: TierName.Common, baseValue: 100 },
        { name: "Voidling", tier: TierName.Common, baseValue: 105 },
        { name: "Gloom Carp", tier: TierName.Common, baseValue: 110 },
        { name: "Murky Darter", tier: TierName.Common, baseValue: 115 },
        { name: "Hollow-Eyed Guppy", tier: TierName.Common, baseValue: 120 },
        { name: "Abyss Shrimp", tier: TierName.Common, baseValue: 125 },
        { name: "Darkwater Driftfish", tier: TierName.Common, baseValue: 130 },
        // Uncommon
        { name: "Shadow Whisker", tier: TierName.Uncommon, baseValue: 200 },
        { name: "Umbral Trout", tier: TierName.Uncommon, baseValue: 210 },
        { name: "Rift Flounder", tier: TierName.Uncommon, baseValue: 220 },
        { name: "Nothingness Crab", tier: TierName.Uncommon, baseValue: 230 },
        { name: "Phantom Jelly", tier: TierName.Uncommon, baseValue: 240 },
        // Rare
        { name: "Void-Touched Angler", tier: TierName.Rare, baseValue: 400 },
        { name: "Gazer of the Deep", tier: TierName.Rare, baseValue: 425 },
        { name: "Nether-Fin Shark", tier: TierName.Rare, baseValue: 450 },
        // Epic
        { name: "Bafadu's Maw", tier: TierName.Epic, baseValue: 800 },
        { name: "Terror of the Trench", tier: TierName.Epic, baseValue: 850 },
        { name: "Void Kraken", tier: TierName.Epic, baseValue: 900 },
        { name: "The Silent Watcher", tier: TierName.Epic, baseValue: 950 },
        // Legendary
        { name: "Abyssal Horror", tier: TierName.Legendary, baseValue: 2000 },
        { name: "Isle-Devourer", tier: TierName.Legendary, baseValue: 2100 },
        { name: "God of the Void", tier: TierName.Legendary, baseValue: 2200 },
        // Mythic
        { name: "Un-Being", tier: TierName.Mythic, baseValue: 6000 },
        { name: "Eye of Bafadu", tier: TierName.Mythic, baseValue: 6500 },
        // Secret
        { name: "Echo of Creation", tier: TierName.Secret, baseValue: 20000 },
        { name: "A Tear in Spacetime", tier: TierName.Secret, baseValue: 22000 },
    ],
    zonoth: [
        // Common
        { name: "Trench Dweller", tier: TierName.Common, baseValue: 150 },
        { name: "Deep Sea Skulker", tier: TierName.Common, baseValue: 155 },
        { name: "Pressure-Proof Prawn", tier: TierName.Common, baseValue: 160 },
        { name: "Biolume Guppy", tier: TierName.Common, baseValue: 165 },
        { name: "Hadal Snailfish", tier: TierName.Common, baseValue: 170 },
        { name: "Brine Worm", tier: TierName.Common, baseValue: 175 },
        { name: "Ridgeback Cod", tier: TierName.Common, baseValue: 180 },
        { name: "Abyssal Skate", tier: TierName.Common, baseValue: 185 },
        { name: "Mariana Mite", tier: TierName.Common, baseValue: 190 },
        // Uncommon
        { name: "Giant Isopod", tier: TierName.Uncommon, baseValue: 300 },
        { name: "Viperfish", tier: TierName.Uncommon, baseValue: 310 },
        { name: "Fangtooth", tier: TierName.Uncommon, baseValue: 320 },
        { name: "Barreleye", tier: TierName.Uncommon, baseValue: 330 },
        { name: "Goblin Shark", tier: TierName.Uncommon, baseValue: 340 },
        { name: "Telescope Octopus", tier: TierName.Uncommon, baseValue: 350 },
        { name: "Vampire Squid", tier: TierName.Uncommon, baseValue: 360 },
        // Rare
        { name: "Zonothian Behemoth", tier: TierName.Rare, baseValue: 600 },
        { name: "Ancient Colossus", tier: TierName.Rare, baseValue: 625 },
        { name: "Deep Trench Leviathan", tier: TierName.Rare, baseValue: 650 },
        { name: "Sea Serpent", tier: TierName.Rare, baseValue: 675 },
        { name: "The Sunken King", tier: TierName.Rare, baseValue: 700 },
        // Legendary
        { name: "Elder God of the Deep", tier: TierName.Legendary, baseValue: 3000 },
        { name: "Last of the Megalodons", tier: TierName.Legendary, baseValue: 3200 },
        // Mythic
        { name: "Zonoth, the Unfathomable", tier: TierName.Mythic, baseValue: 8000 },
        // Secret
        { name: "Fossilized Titan", tier: TierName.Secret, baseValue: 25000 },
    ],
    panamia: [
        // Common
        { name: "Paradise Tetra", tier: TierName.Common, baseValue: 250 },
        { name: "Sunken Relic Fish", tier: TierName.Common, baseValue: 255 },
        { name: "Aether Guppy", tier: TierName.Common, baseValue: 260 },
        { name: "Lagoon Sprite", tier: TierName.Common, baseValue: 265 },
        { name: "Mystic Mangrove Crab", tier: TierName.Common, baseValue: 270 },
        { name: "Glimmering Sardine", tier: TierName.Common, baseValue: 275 },
        { name: "Coral Butterflyfish", tier: TierName.Common, baseValue: 280 },
        { name: "Ancient Algae-Eater", tier: TierName.Common, baseValue: 285 },
        { name: "Whispering Wrasse", tier: TierName.Common, baseValue: 290 },
        { name: "Ruin Dweller", tier: TierName.Common, baseValue: 295 },
        { name: "Lost Fry", tier: TierName.Common, baseValue: 300 },
        // Uncommon
        { name: "Sky-Tinted Trout", tier: TierName.Uncommon, baseValue: 500 },
        { name: "Enchanted Eel", tier: TierName.Uncommon, baseValue: 510 },
        { name: "Prismatic Puffer", tier: TierName.Uncommon, baseValue: 520 },
        { name: "Fey-Touched Flounder", tier: TierName.Uncommon, baseValue: 530 },
        { name: "Oracle Octopus", tier: TierName.Uncommon, baseValue: 540 },
        { name: "Midas Fish", tier: TierName.Uncommon, baseValue: 550 },
        { name: "Serpent of Paradise", tier: TierName.Uncommon, baseValue: 560 },
        { name: "Timeless Turtle", tier: TierName.Uncommon, baseValue: 570 },
        // Rare
        { name: "Aetherial Dragonfish", tier: TierName.Rare, baseValue: 1000 },
        { name: "Panamian World-Eater", tier: TierName.Rare, baseValue: 1050 },
        { name: "Guardian of the Lost Isle", tier: TierName.Rare, baseValue: 1100 },
        { name: "Living Map", tier: TierName.Rare, baseValue: 1150 },
        { name: "Celestial Whale", tier: TierName.Rare, baseValue: 1200 },
        // Epic
        { name: "Chronomancer's Carp", tier: TierName.Epic, baseValue: 2500 },
        { name: "Nexus Shark", tier: TierName.Epic, baseValue: 2600 },
        { name: "Reality-Bending Ray", tier: TierName.Epic, baseValue: 2700 },
        // Legendary
        { name: "The First Fish", tier: TierName.Legendary, baseValue: 6000 },
        { name: "Dream of Panamia", tier: TierName.Legendary, baseValue: 6200 },
        { name: "Genesis Jellyfish", tier: TierName.Legendary, baseValue: 6400 },
        { name: "Finality Fluke", tier: TierName.Legendary, baseValue: 6600 },
        // Mythic
        { name: "Fisherman's Soul", tier: TierName.Mythic, baseValue: 15000 },
        { name: "The One That Got Away", tier: TierName.Mythic, baseValue: 16000 },
        // Secret
        { name: "Panamia's Heartbeat", tier: TierName.Secret, baseValue: 50000 },
        { name: "The Rod of Creation", tier: TierName.Secret, baseValue: 55000 },
    ],
    altar: [],
};

export const LEVEL_SCALING_FACTOR = 1.25;
export const BASE_XP = 100;
export const ENCHANTMENT_COST = 5;
export const MAX_ENCHANTMENTS = 3;
export const AUTO_FISHING_UNLOCK_LEVEL = 5;
