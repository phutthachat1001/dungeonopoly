import type { ZoneDef, ZoneId, TileType } from '../engine/types';

export const ZONES: ZoneDef[] = [
  {
    id: 1,
    name: 'Greenfield',
    tileRange: [0, 19],
    levelRange: [1, 8],
    icon: '🌿',
    colors: {
      bg: 'from-green-900/80 to-green-950/90',
      border: 'border-green-500/50',
      glow: 'shadow-green-500/40',
      text: 'text-green-300',
    },
  },
  {
    id: 2,
    name: 'Dark Forest',
    tileRange: [20, 39],
    levelRange: [8, 20],
    icon: '🌲',
    colors: {
      bg: 'from-purple-950/80 to-slate-950/90',
      border: 'border-purple-500/50',
      glow: 'shadow-purple-500/40',
      text: 'text-purple-300',
    },
  },
  {
    id: 3,
    name: 'Volcanic Waste',
    tileRange: [40, 59],
    levelRange: [20, 35],
    icon: '🌋',
    colors: {
      bg: 'from-red-900/80 to-orange-950/90',
      border: 'border-orange-500/50',
      glow: 'shadow-orange-500/40',
      text: 'text-orange-300',
    },
  },
  {
    id: 4,
    name: 'Frozen Abyss',
    tileRange: [60, 79],
    levelRange: [35, 60],
    icon: '❄️',
    colors: {
      bg: 'from-sky-900/80 to-blue-950/90',
      border: 'border-sky-400/50',
      glow: 'shadow-sky-400/40',
      text: 'text-sky-300',
    },
  },
  {
    id: 5,
    name: 'Demon Realm',
    tileRange: [80, 99],
    levelRange: [60, 100],
    icon: '👹',
    colors: {
      bg: 'from-violet-950/90 to-black',
      border: 'border-violet-600/60',
      glow: 'shadow-violet-600/50',
      text: 'text-violet-300',
    },
  },
];

export function zoneForTile(tileIndex: number): ZoneDef {
  const zone = ZONES.find(
    (z) => tileIndex >= z.tileRange[0] && tileIndex <= z.tileRange[1],
  );
  return zone ?? ZONES[0];
}

export function zoneById(id: ZoneId): ZoneDef {
  return ZONES.find((z) => z.id === id) ?? ZONES[0];
}

// ---------- Tile visuals ----------

export const TILE_META: Record<TileType, { icon: string; name: string; description: string }> = {
  start:    { icon: '🚩', name: 'Start',    description: 'Where every legend begins. Passing grants a small gold bonus.' },
  monster:  { icon: '⚔️', name: 'Monster',  description: 'A wild enemy blocks your path. Fight for EXP and gold!' },
  dungeon:  { icon: '🏰', name: 'Dungeon',  description: 'A multi-room dungeon with elite enemies and rich loot.' },
  shop:     { icon: '🏪', name: 'Shop',     description: 'Buy equipment, potions, and enhance your gear.' },
  event:    { icon: '⭐', name: 'Event',    description: 'A random encounter — your choices decide the outcome.' },
  heal:     { icon: '❤️', name: 'Healing',  description: 'A safe haven. Restore HP and MP.' },
  curse:    { icon: '💀', name: 'Curse',    description: 'Dark magic lingers here. Something bad will happen…' },
  treasure: { icon: '🏆', name: 'Treasure', description: 'A treasure chest! Gold, items, maybe a relic.' },
  portal:   { icon: '🌀', name: 'Portal',   description: 'A swirling portal that teleports you elsewhere.' },
  arena:    { icon: '🎭', name: 'Arena',    description: 'Fight a champion for glory and big rewards.' },
  quest:    { icon: '📜', name: 'Quest',    description: 'A quest giver offers a task with a reward.' },
  upgrade:  { icon: '🏗️', name: 'Upgrade',  description: 'Improve one of your equipped items for free.' },
  boss:     { icon: '👑', name: 'Boss',     description: 'A zone boss. Defeat it to prove your strength!' },
};

/** Tile distribution weights (start tile handled separately) */
export const TILE_WEIGHTS: Array<[TileType, number]> = [
  ['monster', 35],
  ['event', 12],
  ['shop', 10],
  ['dungeon', 8],
  ['heal', 8],
  ['curse', 5],
  ['treasure', 5],
  ['quest', 5],
  ['portal', 4],
  ['arena', 3],
  ['upgrade', 3],
  ['boss', 2],
];
