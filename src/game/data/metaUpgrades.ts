// ============================================================
// Permanent Soul Crystal upgrades (15). Effects applied in
// the store's recompute / reward pipelines.
// ============================================================

export interface MetaUpgradeDef {
  id: string;
  name: string;
  icon: string;
  /** description per rank */
  description: string;
  maxRank: number;
  baseCost: number;
}

export const META_UPGRADES: MetaUpgradeDef[] = [
  { id: 'vitality',        name: 'Soul Vitality',    icon: '❤️', description: '+5% max HP per rank',            maxRank: 5, baseCost: 40 },
  { id: 'wisdom',          name: 'Soul Wisdom',      icon: '💧', description: '+5% max MP per rank',            maxRank: 5, baseCost: 40 },
  { id: 'strength',        name: 'Eternal Strength', icon: '💪', description: '+2 ATK per rank',                maxRank: 5, baseCost: 50 },
  { id: 'ironskin',        name: 'Iron Skin',        icon: '🛡️', description: '+2 DEF per rank',                maxRank: 5, baseCost: 50 },
  { id: 'swiftness',       name: 'Ghost Step',       icon: '👟', description: '+2 SPD per rank',                maxRank: 5, baseCost: 50 },
  { id: 'insight',         name: 'Arcane Insight',   icon: '🔮', description: '+2 INT per rank',                maxRank: 5, baseCost: 50 },
  { id: 'clarity',         name: 'Divine Clarity',   icon: '✨', description: '+2 WIS per rank',                maxRank: 5, baseCost: 50 },
  { id: 'precision',       name: 'Deadeye',          icon: '🎯', description: '+2 DEX per rank',                maxRank: 5, baseCost: 50 },
  { id: 'fortune',         name: 'Golden Soul',      icon: '🪙', description: '+10% gold gain per rank',        maxRank: 5, baseCost: 60 },
  { id: 'scholar',         name: 'Old Soul',         icon: '📚', description: '+10% EXP gain per rank',         maxRank: 5, baseCost: 60 },
  { id: 'lucky_strike',    name: 'Lucky Strike',     icon: '🍀', description: '+2% crit chance per rank',       maxRank: 5, baseCost: 70 },
  { id: 'brutality',       name: 'Brutality',        icon: '🪓', description: '+10% crit damage per rank',      maxRank: 5, baseCost: 70 },
  { id: 'inheritance',     name: 'Inheritance',      icon: '👑', description: 'Start runs with +100 gold per rank', maxRank: 5, baseCost: 30 },
  { id: 'soul_bond',       name: 'Soul Bond',        icon: '💠', description: '+10% Soul Crystals earned per rank', maxRank: 5, baseCost: 80 },
  { id: 'treasure_hunter', name: 'Treasure Hunter',  icon: '🗝️', description: '+5% item drop chance per rank',  maxRank: 5, baseCost: 60 },
];

export function upgradeCost(def: MetaUpgradeDef, currentRank: number): number {
  return def.baseCost * (currentRank + 1);
}
