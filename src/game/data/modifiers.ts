import type { RunModifierId } from '../engine/types';

// ============================================================
// Run modifiers — chosen when starting a new run.
// Rule changes are enforced inside the store.
// ============================================================

export interface ModifierDef {
  id: RunModifierId;
  name: string;
  icon: string;
  description: string;
  risk: string;
  reward: string;
}

export const MODIFIERS: ModifierDef[] = [
  {
    id: 'none', name: 'Classic', icon: '🎲',
    description: 'The standard DUNGEONOPOLY experience.',
    risk: 'None', reward: 'None',
  },
  {
    id: 'cursed', name: 'Cursed', icon: '💀',
    description: 'Dark energy empowers every enemy on the board.',
    risk: 'Enemies have +30% stats',
    reward: '+50% gold & EXP from combat, +50% Soul Crystals',
  },
  {
    id: 'speed', name: 'Speed Run', icon: '⚡',
    description: 'The board blurs beneath your feet.',
    risk: 'EXP gains reduced by 25%',
    reward: 'Roll two dice and move twice as fast',
  },
  {
    id: 'pacifist', name: 'Pacifist', icon: '🕊️',
    description: 'Grow through wit, not war.',
    risk: 'Combat grants no EXP',
    reward: 'Quests & events grant 3× EXP, start with +200 gold',
  },
  {
    id: 'ironman', name: 'Iron Man', icon: '🩹',
    description: 'No rest for the determined.',
    risk: 'Healing tiles have no effect',
    reward: '+75% Soul Crystals',
  },
  {
    id: 'chaos', name: 'Chaos', icon: '🌪️',
    description: 'The board itself refuses to stay still.',
    risk: 'The entire board reshuffles every lap',
    reward: '+25% gold from all sources',
  },
];

export function getModifier(id: RunModifierId): ModifierDef {
  return MODIFIERS.find((m) => m.id === id) ?? MODIFIERS[0];
}
