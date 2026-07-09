import type { AchievementDef } from '../engine/types';

// ============================================================
// 20 achievements. Threshold checks run in the store's
// checkAchievements(); special ones unlock at their trigger site.
// ============================================================

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood',    name: 'First Blood',        icon: '🩸', description: 'Defeat your first monster' },
  { id: 'slayer_10',      name: 'Slayer',             icon: '⚔️', description: 'Defeat 10 monsters (lifetime)' },
  { id: 'slayer_50',      name: 'Veteran Slayer',     icon: '🗡️', description: 'Defeat 50 monsters (lifetime)' },
  { id: 'slayer_100',     name: 'Legendary Slayer',   icon: '🏆', description: 'Defeat 100 monsters (lifetime)' },
  { id: 'level_10',       name: 'Apprentice',         icon: '⬆️', description: 'Reach level 10' },
  { id: 'level_35',       name: 'Adept',              icon: '🌟', description: 'Reach level 35' },
  { id: 'level_70',       name: 'Master',             icon: '💫', description: 'Reach level 70' },
  { id: 'boss_slayer',    name: 'Boss Slayer',        icon: '👑', description: 'Defeat a zone boss' },
  { id: 'demon_slayer',   name: 'Realm Savior',       icon: '😇', description: 'Defeat the Demon Lord' },
  { id: 'rich_1000',      name: 'Well-Off',           icon: '🪙', description: 'Hold 1,000 gold at once' },
  { id: 'rich_10000',     name: 'Dragon\'s Envy',     icon: '💰', description: 'Hold 10,000 gold at once' },
  { id: 'shopaholic',     name: 'Shopaholic',         icon: '🛍️', description: 'Buy 10 items (lifetime)' },
  { id: 'enhancer',       name: 'Apprentice Smith',   icon: '🔨', description: 'Enhance an item to +5' },
  { id: 'max_enhance',    name: 'Master Smith',       icon: '⚒️', description: 'Enhance an item to +10' },
  { id: 'survivor',       name: 'Close Call',         icon: '💦', description: 'Win a battle with less than 10% HP' },
  { id: 'lap_master',     name: 'Marathon Runner',    icon: '🏁', description: 'Complete 3 laps in one run' },
  { id: 'class_change',   name: 'New Path',           icon: '🌱', description: 'Change class for the first time' },
  { id: 'tier3',          name: 'Apex Form',          icon: '🔱', description: 'Reach a Tier 3 class' },
  { id: 'relic_collector',name: 'Relic Collector',    icon: '🏺', description: 'Hold 3 relics in one run' },
  { id: 'gambler',        name: 'Lucky Streak',       icon: '🎰', description: 'Win a gamble' },
  { id: 'first_death',    name: 'The Price of Ambition', icon: '🪦', description: 'Fall in battle for the first time' },
];

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
