import type { ActiveBuff, Enemy, Player, SkillDef, Stats } from './types';
import { getClass } from '../data/classes';

// ============================================================
// Core game math — leveling, stats, combat formulas
// ============================================================

// ---------- Leveling ----------

/** EXP needed to go from `level` to `level + 1` */
export function expToNext(level: number): number {
  return Math.round(50 * Math.pow(level, 1.55));
}

// ---------- Stats ----------

const BASE_STAT = 8;
const STAT_PER_LEVEL = 1.6;

/** Recompute a player's stats from level + class + equipment (buffs applied separately). */
export function computeStats(player: Pick<Player, 'level' | 'classId' | 'equipment'>): {
  stats: Stats; maxHp: number; maxMp: number;
} {
  const cls = getClass(player.classId);
  const raw = BASE_STAT + player.level * STAT_PER_LEVEL;

  const stats: Stats = {
    atk: Math.round(raw * cls.statMultipliers.atk),
    def: Math.round(raw * cls.statMultipliers.def),
    spd: Math.round(raw * cls.statMultipliers.spd),
    int: Math.round(raw * cls.statMultipliers.int),
    wis: Math.round(raw * cls.statMultipliers.wis),
    dex: Math.round(raw * cls.statMultipliers.dex),
  };

  let maxHp = 50 + player.level * cls.hpPerLevel;
  let maxMp = 20 + player.level * cls.mpPerLevel;

  for (const item of Object.values(player.equipment)) {
    if (!item) continue;
    const enh = 1 + item.enhancement * 0.05; // +5% item stats per enhancement level
    for (const [key, value] of Object.entries(item.stats)) {
      stats[key as keyof Stats] += Math.round((value ?? 0) * enh);
    }
    maxHp += Math.round((item.hpBonus ?? 0) * enh);
    maxMp += Math.round((item.mpBonus ?? 0) * enh);
  }

  return { stats, maxHp, maxMp };
}

/** Apply active buffs/debuffs to a stat block. */
export function effectiveStats(stats: Stats, buffs: ActiveBuff[]): Stats {
  const out = { ...stats };
  for (const buff of buffs) {
    out[buff.stat] = Math.max(1, Math.round(out[buff.stat] * (1 + buff.amount)));
  }
  return out;
}

// ---------- Combat ----------

export const ELEMENT_BONUS = 1.5; // damage vs weakness

export interface DamageResult {
  damage: number;
  crit: boolean;
  missed: boolean;
  elementBonus: boolean;
}

/**
 * Physical/magic damage:
 *   power_stat * skill_multiplier * (100 / (100 + enemy_DEF)) * element_bonus
 * Accuracy: base 90% + (attacker_DEX - defender_SPD) * 2%, clamped 40–100%.
 */
export function computeDamage(opts: {
  attackerStats: Stats;
  defenderStats: Stats;
  skill: SkillDef | null;         // null = basic attack
  defenderWeakness: Enemy['weakness'];
  critRate: number;
  critDamage: number;             // percent (150 = 1.5x)
  extraCritRate?: number;
}): DamageResult {
  const { attackerStats, defenderStats, skill, defenderWeakness, critRate, critDamage } = opts;

  const accuracy = Math.min(1, Math.max(0.4,
    0.9 + (attackerStats.dex - defenderStats.spd) * 0.02,
  ));
  if (Math.random() > accuracy) {
    return { damage: 0, crit: false, missed: true, elementBonus: false };
  }

  const scaling = skill?.scaling ?? 'atk';
  const powerStat = scaling === 'int' ? attackerStats.int
    : scaling === 'wis' ? attackerStats.wis
    : attackerStats.atk;
  const multiplier = skill?.power ?? 1.0;
  const element = skill?.element ?? 'physical';

  const elementBonus = defenderWeakness !== null && element === defenderWeakness;
  let damage = powerStat * multiplier * (100 / (100 + defenderStats.def));
  if (elementBonus) damage *= ELEMENT_BONUS;

  const totalCritRate = critRate + (opts.extraCritRate ?? 0);
  const crit = Math.random() < totalCritRate;
  if (crit) damage *= critDamage / 100;

  damage *= 0.9 + Math.random() * 0.2; // ±10% variance

  return { damage: Math.max(1, Math.round(damage)), crit, missed: false, elementBonus };
}

/** Healing: WIS * skill multiplier, ±10% */
export function computeHeal(wis: number, skill: SkillDef): number {
  return Math.max(1, Math.round(wis * skill.power * (0.9 + Math.random() * 0.2)));
}

/** Turn order: SPD + d20 each, attacker on tie */
export function playerGoesFirst(playerSpd: number, enemySpd: number): boolean {
  const d20 = () => 1 + Math.floor(Math.random() * 20);
  return playerSpd + d20() >= enemySpd + d20();
}

export function rollDice(sides = 6): number {
  return 1 + Math.floor(Math.random() * sides);
}
