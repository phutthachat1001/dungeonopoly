import type { ElementType, Enemy, ZoneId } from '../engine/types';

interface EnemyTemplate {
  id: string;
  name: string;
  icon: string;
  element: ElementType;
  weakness: ElementType | null;
  /** relative stat weights, scaled by level in generateEnemy */
  weights: { atk: number; def: number; spd: number; int: number; hp: number };
  skills: string[];
}

const ZONE_ENEMIES: Record<ZoneId, EnemyTemplate[]> = {
  1: [
    { id: 'slime', name: 'Green Slime', icon: '🟢', element: 'nature', weakness: 'fire',
      weights: { atk: 0.8, def: 0.7, spd: 0.7, int: 0.5, hp: 1.0 }, skills: ['enemy_bite'] },
    { id: 'rat', name: 'Giant Rat', icon: '🐀', element: 'physical', weakness: 'nature',
      weights: { atk: 1.0, def: 0.6, spd: 1.2, int: 0.4, hp: 0.8 }, skills: ['enemy_bite'] },
    { id: 'goblin', name: 'Goblin Scout', icon: '👺', element: 'physical', weakness: 'holy',
      weights: { atk: 1.1, def: 0.8, spd: 1.0, int: 0.6, hp: 0.9 }, skills: ['enemy_bite'] },
    { id: 'wolf', name: 'Grey Wolf', icon: '🐺', element: 'physical', weakness: 'fire',
      weights: { atk: 1.2, def: 0.7, spd: 1.3, int: 0.4, hp: 0.9 }, skills: ['enemy_bite'] },
  ],
  2: [
    { id: 'spider', name: 'Venom Spider', icon: '🕷️', element: 'nature', weakness: 'fire',
      weights: { atk: 1.1, def: 0.8, spd: 1.3, int: 0.6, hp: 0.9 }, skills: ['enemy_bite'] },
    { id: 'skeleton', name: 'Skeleton Warrior', icon: '💀', element: 'dark', weakness: 'holy',
      weights: { atk: 1.2, def: 1.0, spd: 0.9, int: 0.5, hp: 1.0 }, skills: ['enemy_bite'] },
    { id: 'wraith', name: 'Forest Wraith', icon: '👻', element: 'dark', weakness: 'holy',
      weights: { atk: 0.8, def: 0.8, spd: 1.1, int: 1.3, hp: 0.9 }, skills: ['enemy_dark_bolt'] },
    { id: 'treant', name: 'Corrupted Treant', icon: '🌳', element: 'nature', weakness: 'fire',
      weights: { atk: 1.1, def: 1.3, spd: 0.6, int: 0.7, hp: 1.3 }, skills: ['enemy_bite'] },
  ],
  3: [
    { id: 'imp', name: 'Fire Imp', icon: '👿', element: 'fire', weakness: 'ice',
      weights: { atk: 1.0, def: 0.8, spd: 1.2, int: 1.2, hp: 0.9 }, skills: ['enemy_flame_breath'] },
    { id: 'salamander', name: 'Salamander', icon: '🦎', element: 'fire', weakness: 'ice',
      weights: { atk: 1.3, def: 1.0, spd: 1.0, int: 0.9, hp: 1.1 }, skills: ['enemy_flame_breath'] },
    { id: 'golem', name: 'Magma Golem', icon: '🌋', element: 'fire', weakness: 'ice',
      weights: { atk: 1.2, def: 1.5, spd: 0.5, int: 0.7, hp: 1.4 }, skills: ['enemy_flame_breath'] },
    { id: 'drake', name: 'Ember Drake', icon: '🐉', element: 'fire', weakness: 'ice',
      weights: { atk: 1.4, def: 1.1, spd: 1.1, int: 1.1, hp: 1.2 }, skills: ['enemy_flame_breath'] },
  ],
  4: [
    { id: 'yeti', name: 'Yeti', icon: '🦍', element: 'ice', weakness: 'fire',
      weights: { atk: 1.4, def: 1.2, spd: 0.8, int: 0.5, hp: 1.3 }, skills: ['enemy_frost_howl'] },
    { id: 'frost_wolf', name: 'Frost Wolf', icon: '🐺', element: 'ice', weakness: 'fire',
      weights: { atk: 1.3, def: 0.9, spd: 1.4, int: 0.6, hp: 1.0 }, skills: ['enemy_frost_howl'] },
    { id: 'ice_wraith', name: 'Ice Wraith', icon: '🌨️', element: 'ice', weakness: 'fire',
      weights: { atk: 0.9, def: 0.9, spd: 1.2, int: 1.4, hp: 0.9 }, skills: ['enemy_frost_howl'] },
    { id: 'frozen_knight', name: 'Frozen Knight', icon: '🥶', element: 'ice', weakness: 'holy',
      weights: { atk: 1.3, def: 1.5, spd: 0.8, int: 0.8, hp: 1.3 }, skills: ['enemy_bite'] },
  ],
  5: [
    { id: 'demon', name: 'Lesser Demon', icon: '😈', element: 'dark', weakness: 'holy',
      weights: { atk: 1.3, def: 1.1, spd: 1.1, int: 1.2, hp: 1.1 }, skills: ['enemy_dark_bolt'] },
    { id: 'voidspawn', name: 'Voidspawn', icon: '🌑', element: 'dark', weakness: 'holy',
      weights: { atk: 1.1, def: 1.0, spd: 1.3, int: 1.4, hp: 1.0 }, skills: ['enemy_dark_bolt'] },
    { id: 'hellhound', name: 'Hellhound', icon: '🔥', element: 'fire', weakness: 'ice',
      weights: { atk: 1.5, def: 1.0, spd: 1.5, int: 0.8, hp: 1.1 }, skills: ['enemy_flame_breath'] },
    { id: 'archfiend', name: 'Archfiend', icon: '👹', element: 'dark', weakness: 'holy',
      weights: { atk: 1.5, def: 1.3, spd: 1.2, int: 1.4, hp: 1.3 }, skills: ['enemy_dark_bolt'] },
  ],
};

const ZONE_BOSSES: Record<ZoneId, EnemyTemplate> = {
  1: { id: 'boss_goblin_king', name: 'Goblin King', icon: '👺', element: 'physical', weakness: 'holy',
    weights: { atk: 1.4, def: 1.2, spd: 1.0, int: 0.8, hp: 2.2 }, skills: ['enemy_bite'] },
  2: { id: 'boss_lich', name: 'The Pale Lich', icon: '🧙', element: 'dark', weakness: 'holy',
    weights: { atk: 1.0, def: 1.1, spd: 1.0, int: 1.7, hp: 2.4 }, skills: ['enemy_dark_bolt'] },
  3: { id: 'boss_dragon', name: 'Inferno Dragon', icon: '🐲', element: 'fire', weakness: 'ice',
    weights: { atk: 1.6, def: 1.4, spd: 1.1, int: 1.3, hp: 2.6 }, skills: ['enemy_flame_breath'] },
  4: { id: 'boss_frost_giant', name: 'Frost Giant Jarl', icon: '🧊', element: 'ice', weakness: 'fire',
    weights: { atk: 1.7, def: 1.5, spd: 0.8, int: 1.0, hp: 2.8 }, skills: ['enemy_frost_howl'] },
  5: { id: 'boss_demon_lord', name: 'Demon Lord Azgaroth', icon: '👹', element: 'dark', weakness: 'holy',
    weights: { atk: 1.8, def: 1.6, spd: 1.3, int: 1.6, hp: 3.2 }, skills: ['enemy_dark_bolt', 'enemy_flame_breath'] },
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

/** Create a leveled enemy instance for a zone. */
export function generateEnemy(zone: ZoneId, levelRange: [number, number], boss = false): Enemy {
  const template = boss
    ? ZONE_BOSSES[zone]
    : ZONE_ENEMIES[zone][randInt(0, ZONE_ENEMIES[zone].length - 1)];

  const level = boss ? levelRange[1] : randInt(levelRange[0], levelRange[1]);
  const base = 4 + level * 2.2;
  const w = template.weights;

  const maxHp = Math.round((30 + level * 14) * w.hp * (boss ? 1.6 : 1));
  const bossMult = boss ? 1.25 : 1;

  return {
    id: `${template.id}_${Date.now()}`,
    name: boss ? template.name : `Lv.${level} ${template.name}`,
    icon: template.icon,
    level,
    hp: maxHp,
    maxHp,
    stats: {
      atk: Math.round(base * w.atk * bossMult),
      def: Math.round(base * w.def * bossMult),
      spd: Math.round(base * w.spd * bossMult),
      int: Math.round(base * w.int * bossMult),
      wis: Math.round(base * 0.6),
      dex: Math.round(base * 0.8),
    },
    element: template.element,
    weakness: template.weakness,
    expReward: Math.round((12 + level * 6) * (boss ? 5 : 1) * rand(0.9, 1.1)),
    goldReward: Math.round((8 + level * 4) * (boss ? 6 : 1) * rand(0.8, 1.3)),
    isBoss: boss,
    skills: template.skills,
    statuses: [],
    buffs: [],
  };
}
