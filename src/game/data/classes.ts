import type { ClassDef, ClassId, Stats } from '../engine/types';

const mult = (
  atk: number, def: number, spd: number, int: number, wis: number, dex: number,
): Stats => ({ atk, def, spd, int, wis, dex });

// ============================================================
// Class tree:
//   Novice (Lv.1)
//   ├─ Warrior (10) ─ Knight (35) ── Guardian (70)
//   │               └ Berserker (35) Warlord (70)
//   ├─ Mage (10) ──── Sorcerer (35) ─ Archmage (70)
//   │               └ Battlemage (35) Spellblade (70)
//   ├─ Rogue (10) ─── Assassin (35) ─ Shadowlord (70)
//   │               └ Ranger (35) ─── Windwalker (70)
//   └─ Cleric (10) ── Priest (35) ─── Saint (70)
//                   └ Paladin (35) ── Crusader (70)
// ============================================================

export const CLASSES: Record<ClassId, ClassDef> = {
  // ---------- Tier 0 ----------
  novice: {
    id: 'novice', name: 'Novice', tier: 0, parent: null, unlockLevel: 1,
    description: 'A fresh adventurer with big dreams and a wooden stick.',
    statMultipliers: mult(1, 1, 1, 1, 1, 1),
    hpPerLevel: 10, mpPerLevel: 4,
    skillIds: ['novice_strike', 'novice_focus'],
    allowedWeapons: ['any'],
  },

  // ---------- Tier 1 (Lv.10) ----------
  warrior: {
    id: 'warrior', name: 'Warrior', tier: 1, parent: 'novice', unlockLevel: 10,
    description: 'A frontline fighter clad in steel. High ATK and DEF.',
    statMultipliers: mult(1.3, 1.25, 0.9, 0.7, 0.8, 1.0),
    hpPerLevel: 14, mpPerLevel: 3,
    skillIds: ['power_slash', 'shield_bash', 'war_cry', 'whirlwind'],
    allowedWeapons: ['sword', 'mace'],
  },
  mage: {
    id: 'mage', name: 'Mage', tier: 1, parent: 'novice', unlockLevel: 10,
    description: 'A scholar of the arcane. Devastating spells, fragile body.',
    statMultipliers: mult(0.7, 0.8, 0.95, 1.4, 1.2, 0.95),
    hpPerLevel: 8, mpPerLevel: 8,
    skillIds: ['fireball', 'ice_lance', 'arcane_shield', 'meteor'],
    allowedWeapons: ['staff'],
  },
  rogue: {
    id: 'rogue', name: 'Rogue', tier: 1, parent: 'novice', unlockLevel: 10,
    description: 'A shadow with knives. Fast, precise, deadly criticals.',
    statMultipliers: mult(1.15, 0.85, 1.35, 0.8, 0.8, 1.3),
    hpPerLevel: 10, mpPerLevel: 5,
    skillIds: ['backstab', 'poison_blade', 'shadow_step', 'fan_of_knives'],
    allowedWeapons: ['dagger', 'bow'],
  },
  cleric: {
    id: 'cleric', name: 'Cleric', tier: 1, parent: 'novice', unlockLevel: 10,
    description: 'A servant of the light. Heals wounds and smites evil.',
    statMultipliers: mult(0.9, 1.1, 0.9, 1.1, 1.4, 0.9),
    hpPerLevel: 12, mpPerLevel: 7,
    skillIds: ['holy_smite', 'heal', 'blessing', 'divine_wrath'],
    allowedWeapons: ['mace', 'staff'],
  },

  // ---------- Tier 2 (Lv.35) ----------
  knight: {
    id: 'knight', name: 'Knight', tier: 2, parent: 'warrior', unlockLevel: 35,
    description: 'An unbreakable wall. The ultimate defender.',
    statMultipliers: mult(1.35, 1.6, 0.85, 0.7, 0.9, 1.0),
    hpPerLevel: 18, mpPerLevel: 3,
    skillIds: ['power_slash', 'shield_bash', 'war_cry', 'whirlwind'],
    allowedWeapons: ['sword', 'mace'],
  },
  berserker: {
    id: 'berserker', name: 'Berserker', tier: 2, parent: 'warrior', unlockLevel: 35,
    description: 'Rage incarnate. Trades defense for overwhelming power.',
    statMultipliers: mult(1.7, 0.95, 1.1, 0.6, 0.7, 1.1),
    hpPerLevel: 15, mpPerLevel: 3,
    skillIds: ['power_slash', 'shield_bash', 'war_cry', 'whirlwind'],
    allowedWeapons: ['sword'],
  },
  sorcerer: {
    id: 'sorcerer', name: 'Sorcerer', tier: 2, parent: 'mage', unlockLevel: 35,
    description: 'A master of raw elemental destruction.',
    statMultipliers: mult(0.7, 0.85, 1.0, 1.75, 1.3, 1.0),
    hpPerLevel: 9, mpPerLevel: 11,
    skillIds: ['fireball', 'ice_lance', 'arcane_shield', 'meteor'],
    allowedWeapons: ['staff'],
  },
  battlemage: {
    id: 'battlemage', name: 'Battlemage', tier: 2, parent: 'mage', unlockLevel: 35,
    description: 'Spell in one hand, sword in the other.',
    statMultipliers: mult(1.25, 1.05, 1.0, 1.35, 1.0, 1.05),
    hpPerLevel: 12, mpPerLevel: 7,
    skillIds: ['fireball', 'ice_lance', 'arcane_shield', 'meteor'],
    allowedWeapons: ['sword', 'staff'],
  },
  assassin: {
    id: 'assassin', name: 'Assassin', tier: 2, parent: 'rogue', unlockLevel: 35,
    description: 'One strike, one kill. The blade from the dark.',
    statMultipliers: mult(1.5, 0.85, 1.5, 0.8, 0.8, 1.6),
    hpPerLevel: 11, mpPerLevel: 5,
    skillIds: ['backstab', 'poison_blade', 'shadow_step', 'fan_of_knives'],
    allowedWeapons: ['dagger'],
  },
  ranger: {
    id: 'ranger', name: 'Ranger', tier: 2, parent: 'rogue', unlockLevel: 35,
    description: 'A hunter of the wilds. Never misses.',
    statMultipliers: mult(1.35, 1.0, 1.35, 0.9, 1.0, 1.5),
    hpPerLevel: 12, mpPerLevel: 6,
    skillIds: ['backstab', 'poison_blade', 'shadow_step', 'fan_of_knives'],
    allowedWeapons: ['bow', 'dagger'],
  },
  priest: {
    id: 'priest', name: 'Priest', tier: 2, parent: 'cleric', unlockLevel: 35,
    description: 'A vessel of divine grace. Unmatched healing.',
    statMultipliers: mult(0.85, 1.1, 0.9, 1.3, 1.8, 0.9),
    hpPerLevel: 13, mpPerLevel: 10,
    skillIds: ['holy_smite', 'heal', 'blessing', 'divine_wrath'],
    allowedWeapons: ['staff', 'mace'],
  },
  paladin: {
    id: 'paladin', name: 'Paladin', tier: 2, parent: 'cleric', unlockLevel: 35,
    description: 'A holy knight — shield of the weak, hammer of the wicked.',
    statMultipliers: mult(1.3, 1.45, 0.85, 1.0, 1.3, 0.95),
    hpPerLevel: 16, mpPerLevel: 6,
    skillIds: ['holy_smite', 'heal', 'blessing', 'divine_wrath'],
    allowedWeapons: ['sword', 'mace'],
  },

  // ---------- Tier 3 (Lv.70) ----------
  guardian: {
    id: 'guardian', name: 'Guardian', tier: 3, parent: 'knight', unlockLevel: 70,
    description: 'A living fortress blessed by the earth itself.',
    statMultipliers: mult(1.5, 2.1, 0.85, 0.8, 1.1, 1.05),
    hpPerLevel: 24, mpPerLevel: 4,
    skillIds: ['power_slash', 'shield_bash', 'war_cry', 'whirlwind'],
    allowedWeapons: ['sword', 'mace'],
  },
  warlord: {
    id: 'warlord', name: 'Warlord', tier: 3, parent: 'berserker', unlockLevel: 70,
    description: 'A conqueror whose fury levels armies.',
    statMultipliers: mult(2.2, 1.1, 1.2, 0.7, 0.8, 1.2),
    hpPerLevel: 19, mpPerLevel: 4,
    skillIds: ['power_slash', 'shield_bash', 'war_cry', 'whirlwind'],
    allowedWeapons: ['sword'],
  },
  archmage: {
    id: 'archmage', name: 'Archmage', tier: 3, parent: 'sorcerer', unlockLevel: 70,
    description: 'Reality bends to their will.',
    statMultipliers: mult(0.8, 0.95, 1.1, 2.3, 1.5, 1.1),
    hpPerLevel: 11, mpPerLevel: 15,
    skillIds: ['fireball', 'ice_lance', 'arcane_shield', 'meteor'],
    allowedWeapons: ['staff'],
  },
  spellblade: {
    id: 'spellblade', name: 'Spellblade', tier: 3, parent: 'battlemage', unlockLevel: 70,
    description: 'Steel and sorcery fused into one perfect art.',
    statMultipliers: mult(1.65, 1.2, 1.15, 1.65, 1.1, 1.2),
    hpPerLevel: 15, mpPerLevel: 9,
    skillIds: ['fireball', 'ice_lance', 'arcane_shield', 'meteor'],
    allowedWeapons: ['sword', 'staff'],
  },
  shadowlord: {
    id: 'shadowlord', name: 'Shadowlord', tier: 3, parent: 'assassin', unlockLevel: 70,
    description: 'Death itself walks in their shadow.',
    statMultipliers: mult(2.0, 0.9, 1.9, 0.9, 0.9, 2.1),
    hpPerLevel: 13, mpPerLevel: 6,
    skillIds: ['backstab', 'poison_blade', 'shadow_step', 'fan_of_knives'],
    allowedWeapons: ['dagger'],
  },
  windwalker: {
    id: 'windwalker', name: 'Windwalker', tier: 3, parent: 'ranger', unlockLevel: 70,
    description: 'Faster than the storm, sharper than its lightning.',
    statMultipliers: mult(1.75, 1.1, 1.8, 1.0, 1.1, 1.95),
    hpPerLevel: 14, mpPerLevel: 7,
    skillIds: ['backstab', 'poison_blade', 'shadow_step', 'fan_of_knives'],
    allowedWeapons: ['bow', 'dagger'],
  },
  saint: {
    id: 'saint', name: 'Saint', tier: 3, parent: 'priest', unlockLevel: 70,
    description: 'A miracle given form. Death holds no dominion here.',
    statMultipliers: mult(0.95, 1.25, 0.95, 1.7, 2.4, 1.0),
    hpPerLevel: 16, mpPerLevel: 13,
    skillIds: ['holy_smite', 'heal', 'blessing', 'divine_wrath'],
    allowedWeapons: ['staff', 'mace'],
  },
  crusader: {
    id: 'crusader', name: 'Crusader', tier: 3, parent: 'paladin', unlockLevel: 70,
    description: 'The wrath of heaven, armored and unstoppable.',
    statMultipliers: mult(1.7, 1.85, 0.9, 1.2, 1.6, 1.05),
    hpPerLevel: 20, mpPerLevel: 8,
    skillIds: ['holy_smite', 'heal', 'blessing', 'divine_wrath'],
    allowedWeapons: ['sword', 'mace'],
  },
};

export function getClass(id: ClassId): ClassDef {
  return CLASSES[id];
}

/** Classes reachable from `current` at the next class-change level */
export function evolutionOptions(current: ClassId): ClassDef[] {
  const cur = CLASSES[current];
  if (cur.tier === 0) {
    return Object.values(CLASSES).filter((c) => c.tier === 1);
  }
  return Object.values(CLASSES).filter((c) => c.parent === current);
}
