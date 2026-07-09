import type { RelicDef } from '../engine/types';

// ============================================================
// 12 relics — passive effects are applied inside the store
// (see relic hooks in store.ts).
// ============================================================

export const RELICS: Record<string, RelicDef> = {
  golden_idol:    { id: 'golden_idol',    name: 'Golden Idol',      icon: '🗿', description: '+25% gold from all sources' },
  tome_knowledge: { id: 'tome_knowledge', name: 'Tome of Knowledge', icon: '📖', description: '+25% EXP from all sources' },
  vampire_fang:   { id: 'vampire_fang',   name: 'Vampire Fang',     icon: '🧛', description: 'Heal 5% max HP after each kill' },
  lucky_clover:   { id: 'lucky_clover',   name: 'Lucky Clover',     icon: '🍀', description: '+10% critical hit chance' },
  iron_heart:     { id: 'iron_heart',     name: 'Iron Heart',       icon: '🫀', description: '+15% max HP' },
  berserker_totem:{ id: 'berserker_totem',name: 'Berserker Totem',  icon: '🗿', description: '+15% ATK' },
  guardian_shell: { id: 'guardian_shell', name: 'Guardian Shell',   icon: '🐢', description: '+15% DEF' },
  swift_boots:    { id: 'swift_boots',    name: 'Boots of the Gale', icon: '🌬️', description: '+15% SPD' },
  phoenix_feather:{ id: 'phoenix_feather',name: 'Phoenix Feather',  icon: '🪶', description: 'Survive death once per run (revive at 50% HP)' },
  cursed_skull:   { id: 'cursed_skull',   name: 'Cursed Skull',     icon: '💀', description: '+30% damage dealt, +15% damage taken' },
  merchant_seal:  { id: 'merchant_seal',  name: 'Merchant Seal',    icon: '🪪', description: 'Shop prices reduced by 20%' },
  hunters_eye:    { id: 'hunters_eye',    name: "Hunter's Eye",     icon: '👁️', description: '+15% item drop chance' },
};

export const RELIC_IDS = Object.keys(RELICS);

export function getRelic(id: string): RelicDef {
  return RELICS[id];
}
