import type { EquipSlot, Item, Rarity, Stats, WeaponKind, ZoneId } from '../engine/types';

// ============================================================
// Procedural item generation
// ============================================================

const RARITY_TABLE: Array<[Rarity, number, number]> = [
  // rarity, weight, stat multiplier
  ['common', 45, 1.0],
  ['uncommon', 28, 1.3],
  ['rare', 16, 1.7],
  ['epic', 8, 2.2],
  ['legendary', 3, 3.0],
];

export const RARITY_COLORS: Record<Rarity, string> = {
  common: 'text-gray-200 border-gray-400/50',
  uncommon: 'text-green-400 border-green-400/60',
  rare: 'text-blue-400 border-blue-400/60',
  epic: 'text-purple-400 border-purple-400/60',
  legendary: 'text-amber-400 border-amber-400/70',
};

const SLOT_ICONS: Record<EquipSlot, string> = {
  weapon: '⚔️', armor: '🛡️', helmet: '⛑️', pants: '👖', boots: '👢', accessory: '💍',
};

const WEAPON_NAMES: Record<Exclude<WeaponKind, 'any'>, string[]> = {
  sword: ['Shortsword', 'Longsword', 'Greatsword', 'Runeblade'],
  staff: ['Oak Staff', 'Crystal Staff', 'Archstaff', 'Voidrod'],
  dagger: ['Knife', 'Stiletto', 'Twinfang', 'Nightpiercer'],
  mace: ['Club', 'Morningstar', 'Warhammer', 'Skullcrusher'],
  bow: ['Shortbow', 'Longbow', 'Recurve Bow', 'Stormbow'],
};

const ARMOR_NAMES: Record<Exclude<EquipSlot, 'weapon'>, string[]> = {
  armor: ['Tunic', 'Chainmail', 'Plate Armor', 'Dragonscale'],
  helmet: ['Cap', 'Helm', 'Greathelm', 'Crown of Ages'],
  pants: ['Trousers', 'Greaves', 'Legplates', 'Titan Greaves'],
  boots: ['Shoes', 'Boots', 'Warboots', 'Windstriders'],
  accessory: ['Ring', 'Amulet', 'Talisman', 'Relic Sigil'],
};

const RARITY_PREFIX: Record<Rarity, string> = {
  common: '', uncommon: 'Fine ', rare: 'Enchanted ', epic: 'Mythic ', legendary: 'Legendary ',
};

const SLOTS: EquipSlot[] = ['weapon', 'armor', 'helmet', 'pants', 'boots', 'accessory'];
const WEAPON_KINDS: Array<Exclude<WeaponKind, 'any'>> = ['sword', 'staff', 'dagger', 'mace', 'bow'];

const randOf = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

function rollRarity(luckBonus = 0): [Rarity, number] {
  const total = RARITY_TABLE.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total - luckBonus * total * 0.1;
  for (const [rarity, weight, mult] of RARITY_TABLE) {
    roll -= weight;
    if (roll <= 0) return [rarity, mult];
  }
  return ['legendary', 3.0];
}

let itemCounter = 0;

export function generateItem(level: number, opts?: { slot?: EquipSlot; luckBonus?: number }): Item {
  const slot = opts?.slot ?? randOf(SLOTS);
  const [rarity, rarityMult] = rollRarity(opts?.luckBonus ?? 0);
  const tierIndex = Math.min(3, Math.floor(level / 25));
  const power = (4 + level * 1.1) * rarityMult;

  const stats: Partial<Stats> = {};
  let name: string;
  let weaponKind: WeaponKind | undefined;
  let hpBonus = 0;
  let mpBonus = 0;

  if (slot === 'weapon') {
    weaponKind = randOf(WEAPON_KINDS);
    name = WEAPON_NAMES[weaponKind][tierIndex];
    if (weaponKind === 'staff') {
      stats.int = Math.round(power);
      stats.wis = Math.round(power * 0.4);
    } else {
      stats.atk = Math.round(power);
      if (weaponKind === 'dagger' || weaponKind === 'bow') stats.dex = Math.round(power * 0.4);
    }
  } else {
    name = ARMOR_NAMES[slot][tierIndex];
    switch (slot) {
      case 'armor':
        stats.def = Math.round(power * 0.9);
        hpBonus = Math.round(power * 2.5);
        break;
      case 'helmet':
        stats.def = Math.round(power * 0.5);
        stats.wis = Math.round(power * 0.35);
        mpBonus = Math.round(power * 1.5);
        break;
      case 'pants':
        stats.def = Math.round(power * 0.6);
        hpBonus = Math.round(power * 1.5);
        break;
      case 'boots':
        stats.spd = Math.round(power * 0.6);
        stats.def = Math.round(power * 0.3);
        break;
      case 'accessory': {
        const key = randOf(['atk', 'int', 'spd', 'dex', 'wis'] as const);
        stats[key] = Math.round(power * 0.7);
        break;
      }
    }
  }

  return {
    id: `item_${Date.now()}_${itemCounter++}`,
    name: `${RARITY_PREFIX[rarity]}${name}`,
    icon: SLOT_ICONS[slot],
    slot,
    weaponKind,
    rarity,
    level,
    stats,
    hpBonus: hpBonus || undefined,
    mpBonus: mpBonus || undefined,
    enhancement: 0,
    price: Math.round((20 + level * 12) * rarityMult),
  };
}

/** Shop stock: 6 items around the player's level. */
export function generateShopInventory(playerLevel: number, _zone: ZoneId): Item[] {
  return Array.from({ length: 6 }, () =>
    generateItem(Math.max(1, playerLevel + randInt(-2, 3))),
  );
}

/** Enhancement success rates for +1 → +15 */
export function enhancementSuccessRate(currentLevel: number): number {
  const rates = [1, 1, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2];
  return rates[Math.min(currentLevel, rates.length - 1)];
}

export function enhancementCost(item: Item): number {
  return Math.round(item.price * 0.3 * (1 + item.enhancement * 0.5));
}
