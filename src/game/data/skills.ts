import type { SkillDef } from '../engine/types';

// ============================================================
// Skill definitions — base classes fully implemented;
// tier 2/3 skills arrive with the class system phase.
// ============================================================

export const SKILLS: Record<string, SkillDef> = {
  // ---------- Novice ----------
  novice_strike: {
    id: 'novice_strike', name: 'Clumsy Strike', icon: '🪵',
    description: 'A wobbly but earnest attack. 110% ATK damage.',
    mpCost: 0, kind: 'damage', element: 'physical', power: 1.1, scaling: 'atk',
  },
  novice_focus: {
    id: 'novice_focus', name: 'Focus', icon: '🧘',
    description: 'Steady your breathing. +20% ATK for 3 turns.',
    mpCost: 4, kind: 'buff', element: 'physical', power: 0.2, scaling: 'atk',
    targetStat: 'atk', duration: 3,
  },

  // ---------- Warrior ----------
  power_slash: {
    id: 'power_slash', name: 'Power Slash', icon: '⚔️',
    description: 'A mighty overhead slash. 160% ATK damage.',
    mpCost: 6, kind: 'damage', element: 'physical', power: 1.6, scaling: 'atk',
  },
  shield_bash: {
    id: 'shield_bash', name: 'Shield Bash', icon: '🛡️',
    description: '120% ATK damage with a 40% chance to stun for 1 turn.',
    mpCost: 8, kind: 'damage', element: 'physical', power: 1.2, scaling: 'atk',
    status: 'stun', statusChance: 0.4, duration: 1,
  },
  war_cry: {
    id: 'war_cry', name: 'War Cry', icon: '📣',
    description: 'A battle roar. +30% ATK for 4 turns.',
    mpCost: 10, kind: 'buff', element: 'physical', power: 0.3, scaling: 'atk',
    targetStat: 'atk', duration: 4,
  },
  whirlwind: {
    id: 'whirlwind', name: 'Whirlwind', icon: '🌪️',
    description: 'Spin with blades out. 220% ATK damage.',
    mpCost: 14, kind: 'damage', element: 'physical', power: 2.2, scaling: 'atk',
  },

  // ---------- Mage ----------
  fireball: {
    id: 'fireball', name: 'Fireball', icon: '🔥',
    description: 'Hurl a blazing orb. 170% INT fire damage, 30% chance to burn.',
    mpCost: 8, kind: 'damage', element: 'fire', power: 1.7, scaling: 'int',
    status: 'burn', statusChance: 0.3, duration: 3,
  },
  ice_lance: {
    id: 'ice_lance', name: 'Ice Lance', icon: '🧊',
    description: 'A piercing icicle. 150% INT ice damage, 25% chance to freeze.',
    mpCost: 7, kind: 'damage', element: 'ice', power: 1.5, scaling: 'int',
    status: 'freeze', statusChance: 0.25, duration: 1,
  },
  arcane_shield: {
    id: 'arcane_shield', name: 'Arcane Shield', icon: '🔮',
    description: 'A barrier of mana. +40% DEF for 3 turns.',
    mpCost: 9, kind: 'buff', element: 'physical', power: 0.4, scaling: 'int',
    targetStat: 'def', duration: 3,
  },
  meteor: {
    id: 'meteor', name: 'Meteor', icon: '☄️',
    description: 'Call a falling star. 260% INT fire damage.',
    mpCost: 18, kind: 'damage', element: 'fire', power: 2.6, scaling: 'int',
  },

  // ---------- Rogue ----------
  backstab: {
    id: 'backstab', name: 'Backstab', icon: '🗡️',
    description: 'Strike a vital point. 140% ATK damage with +25% crit chance.',
    mpCost: 6, kind: 'damage', element: 'physical', power: 1.4, scaling: 'atk',
  },
  poison_blade: {
    id: 'poison_blade', name: 'Poison Blade', icon: '☠️',
    description: '110% ATK damage, 70% chance to poison for 3 turns.',
    mpCost: 7, kind: 'damage', element: 'nature', power: 1.1, scaling: 'atk',
    status: 'poison', statusChance: 0.7, duration: 3,
  },
  shadow_step: {
    id: 'shadow_step', name: 'Shadow Step', icon: '👤',
    description: 'Melt into shadow. +35% SPD for 3 turns.',
    mpCost: 8, kind: 'buff', element: 'dark', power: 0.35, scaling: 'atk',
    targetStat: 'spd', duration: 3,
  },
  fan_of_knives: {
    id: 'fan_of_knives', name: 'Fan of Knives', icon: '🔪',
    description: 'A storm of steel. 200% ATK damage.',
    mpCost: 13, kind: 'damage', element: 'physical', power: 2.0, scaling: 'atk',
  },

  // ---------- Cleric ----------
  holy_smite: {
    id: 'holy_smite', name: 'Holy Smite', icon: '✨',
    description: 'Divine light burns the wicked. 140% INT holy damage.',
    mpCost: 6, kind: 'damage', element: 'holy', power: 1.4, scaling: 'int',
  },
  heal: {
    id: 'heal', name: 'Heal', icon: '💚',
    description: 'Restore HP equal to 200% WIS.',
    mpCost: 8, kind: 'heal', element: 'holy', power: 2.0, scaling: 'wis',
  },
  blessing: {
    id: 'blessing', name: 'Blessing', icon: '🙏',
    description: 'Divine favor. +25% DEF for 4 turns.',
    mpCost: 9, kind: 'buff', element: 'holy', power: 0.25, scaling: 'wis',
    targetStat: 'def', duration: 4,
  },
  divine_wrath: {
    id: 'divine_wrath', name: 'Divine Wrath', icon: '⚡',
    description: 'Judgment falls. 230% INT holy damage.',
    mpCost: 16, kind: 'damage', element: 'holy', power: 2.3, scaling: 'int',
  },

  // ---------- Enemy skills ----------
  enemy_bite: {
    id: 'enemy_bite', name: 'Vicious Bite', icon: '🦷',
    description: 'A savage bite. 130% ATK damage.',
    mpCost: 0, kind: 'damage', element: 'physical', power: 1.3, scaling: 'atk',
  },
  enemy_dark_bolt: {
    id: 'enemy_dark_bolt', name: 'Dark Bolt', icon: '🌑',
    description: 'A bolt of void energy. 150% INT dark damage.',
    mpCost: 0, kind: 'damage', element: 'dark', power: 1.5, scaling: 'int',
  },
  enemy_flame_breath: {
    id: 'enemy_flame_breath', name: 'Flame Breath', icon: '🔥',
    description: 'Scorching breath. 160% INT fire damage, may burn.',
    mpCost: 0, kind: 'damage', element: 'fire', power: 1.6, scaling: 'int',
    status: 'burn', statusChance: 0.35, duration: 2,
  },
  enemy_frost_howl: {
    id: 'enemy_frost_howl', name: 'Frost Howl', icon: '❄️',
    description: 'A freezing howl. 140% INT ice damage, may freeze.',
    mpCost: 0, kind: 'damage', element: 'ice', power: 1.4, scaling: 'int',
    status: 'freeze', statusChance: 0.25, duration: 1,
  },
};

export function getSkill(id: string): SkillDef {
  const skill = SKILLS[id];
  if (!skill) throw new Error(`Unknown skill: ${id}`);
  return skill;
}
