import type { GameEvent } from '../engine/types';

// ============================================================
// 20 board events. Gold/EXP amounts are base values —
// the store scales them by zone.
// ============================================================

export const EVENTS: GameEvent[] = [
  {
    id: 'traveling_merchant', name: 'Traveling Merchant', icon: '🧳',
    description: 'A merchant\'s cart creaks to a halt. "Rare goods, half price — today only, friend!"',
    choices: [
      {
        text: 'Buy a discounted item (50 gold)',
        requirement: { gold: 50 },
        outcomes: [{ weight: 1, text: 'A fine deal! The merchant tips his hat.', gold: -50, itemLuck: 1 }],
      },
      {
        text: 'Rob the merchant',
        outcomes: [
          { weight: 5, text: 'You snatch a crate and vanish into the bushes!', itemLuck: 0, gold: 40 },
          { weight: 5, text: 'His "bodyguard" steps out from behind the cart…', combat: 'elite' },
        ],
      },
      { text: 'Walk away', outcomes: [{ weight: 1, text: 'The cart rolls on without you.' }] },
    ],
  },
  {
    id: 'ancient_fountain', name: 'Ancient Fountain', icon: '⛲',
    description: 'A moss-covered fountain hums with faint magic. The water glimmers strangely.',
    choices: [
      {
        text: 'Drink from it',
        outcomes: [
          { weight: 4, text: 'Vitality surges through you! Fully restored!', fullHeal: true },
          { weight: 3, text: 'Your muscles swell with power! +25% ATK for 5 turns.', buff: { stat: 'atk', amount: 0.25, turns: 5 } },
          { weight: 3, text: 'The water was stagnant… you feel ill.', hpPct: -0.2 },
        ],
      },
      { text: 'Pass by', outcomes: [{ weight: 1, text: 'Better safe than sorry.' }] },
    ],
  },
  {
    id: 'lost_adventurer', name: 'Lost Adventurer', icon: '🧭',
    description: 'A wounded adventurer waves you down. "Please… help me back to the road."',
    choices: [
      {
        text: 'Help them',
        outcomes: [
          { weight: 7, text: 'They share hard-won wisdom of these lands. +EXP!', exp: 30 },
          { weight: 3, text: 'They press a keepsake into your hand before leaving.', itemLuck: 1 },
        ],
      },
      { text: 'Ignore them', outcomes: [{ weight: 1, text: 'Their cries fade behind you. You feel a chill.' }] },
    ],
  },
  {
    id: 'gambling_den', name: 'Gambling Den', icon: '🎰',
    description: 'Dice clatter behind a curtain. A grinning goblin beckons: "Double or nothing?"',
    choices: [
      {
        text: 'Bet 100 gold',
        requirement: { gold: 100 },
        outcomes: [
          { weight: 5, text: 'The dice favor you! Doubled!', gold: 200, achievement: 'gambler' },
          { weight: 5, text: 'Snake eyes. The goblin cackles.', gold: -100 },
        ],
      },
      {
        text: 'Bet 500 gold — high stakes',
        requirement: { gold: 500 },
        outcomes: [
          { weight: 5, text: 'JACKPOT! The den falls silent as you rake it in!', gold: 1000, achievement: 'gambler' },
          { weight: 5, text: 'The house always wins…', gold: -500 },
        ],
      },
      { text: 'Walk away', outcomes: [{ weight: 1, text: 'Gambling is for fools, you mutter.' }] },
    ],
  },
  {
    id: 'mysterious_portal', name: 'Mysterious Portal', icon: '🌀',
    description: 'A tear in reality crackles before you, showing glimpses of distant lands.',
    choices: [
      { text: 'Step through', outcomes: [{ weight: 1, text: 'The world twists and reforms around you!', teleport: true }] },
      { text: 'Refuse', outcomes: [{ weight: 1, text: 'The portal collapses with a disappointed hiss.' }] },
    ],
  },
  {
    id: 'dragons_hoard', name: "Dragon's Hoard", icon: '🐲',
    description: 'A cave glitters with mountains of gold. Deep within, something enormous breathes slowly…',
    choices: [
      {
        text: 'Take the treasure',
        outcomes: [
          { weight: 4, text: 'You tiptoe out, pockets bulging. The snoring never stopped!', gold: 300, itemLuck: 2 },
          { weight: 6, text: 'A golden eye snaps open. "THIEF."', gold: 150, combat: 'dragon' },
        ],
      },
      { text: 'Leave quietly', outcomes: [{ weight: 1, text: 'Some treasures are not worth the risk.' }] },
    ],
  },
  {
    id: 'holy_shrine', name: 'Holy Shrine', icon: '⛩️',
    description: 'A serene shrine radiates warmth. An offering bowl sits before the altar.',
    choices: [
      {
        text: 'Donate 100 gold',
        requirement: { gold: 100 },
        outcomes: [{ weight: 1, text: 'Light washes over you. Blessed and fully healed!', gold: -100, fullHeal: true, buff: { stat: 'def', amount: 0.3, turns: 6 } }],
      },
      {
        text: 'Pray for free',
        outcomes: [
          { weight: 3, text: 'A gentle warmth restores you slightly.', hpPct: 0.25 },
          { weight: 7, text: 'The gods appreciate the thought.' },
        ],
      },
    ],
  },
  {
    id: 'cursed_tome', name: 'Cursed Tome', icon: '📕',
    description: 'A book bound in black chains whispers your name. Knowledge... power... read me...',
    choices: [
      {
        text: 'Read it',
        outcomes: [{
          weight: 1, text: 'Forbidden knowledge floods your mind — but something dark clings to you.',
          exp: 80, buff: { stat: 'def', amount: -0.2, turns: 6 },
        }],
      },
      { text: 'Burn it', outcomes: [{ weight: 1, text: 'The tome shrieks as it burns. You feel lighter.', exp: 15 }] },
    ],
  },
  {
    id: 'friendly_blacksmith', name: 'Friendly Blacksmith', icon: '🔨',
    description: 'A cheerful dwarf waves from her portable forge. "Free hammer work for travelers!"',
    choices: [
      { text: 'Let her enhance your gear', outcomes: [{ weight: 1, text: 'Sparks fly! Your equipment shines brighter.', enhance: true }] },
      { text: 'Just chat', outcomes: [{ weight: 1, text: 'She shares smithing tales. Fascinating!', exp: 20 }] },
    ],
  },
  {
    id: 'soul_merchant', name: 'Soul Merchant', icon: '🕯️',
    description: 'A hooded figure with hollow eyes extends a contract. "A sliver of your life force… for power eternal."',
    choices: [
      {
        text: 'Trade 10% max HP for +5 ATK',
        outcomes: [{ weight: 1, text: 'Pain sears your chest — then strength floods your arms.', maxHpPct: -0.1, bonusStat: { stat: 'atk', amount: 5 } }],
      },
      {
        text: 'Trade 10% max HP for +5 INT',
        outcomes: [{ weight: 1, text: 'Your vision dims — then the arcane opens before you.', maxHpPct: -0.1, bonusStat: { stat: 'int', amount: 5 } }],
      },
      { text: 'Refuse', outcomes: [{ weight: 1, text: 'The figure dissolves into smoke, disappointed.' }] },
    ],
  },
  {
    id: 'wishing_well', name: 'Wishing Well', icon: '🪙',
    description: 'An old well with a worn plaque: "One coin, one wish."',
    choices: [
      {
        text: 'Toss in 10 gold',
        requirement: { gold: 10 },
        outcomes: [
          { weight: 4, text: 'The well glows! Gold rains upward into your hands!', gold: 90 },
          { weight: 2, text: 'A refreshing mist rises from the depths.', hpPct: 0.3, mpPct: 0.3 },
          { weight: 4, text: 'Plunk. Nothing happens.', gold: -10 },
        ],
      },
      { text: 'Keep your coins', outcomes: [{ weight: 1, text: 'Wishes don\'t pay for equipment.' }] },
    ],
  },
  {
    id: 'old_hermit', name: 'Old Hermit', icon: '🧙‍♂️',
    description: 'A hermit tends a tiny fire. "Sit, traveler. The road is long and full of lessons."',
    choices: [
      { text: 'Listen to his stories', outcomes: [{ weight: 1, text: 'His tales hold surprising depth. You feel wiser.', exp: 40 }] },
      {
        text: 'Ask for supplies',
        outcomes: [
          { weight: 6, text: 'He shares his stew. Delicious and restorative!', hpPct: 0.35 },
          { weight: 4, text: '"Supplies? I have only wisdom, child."', exp: 10 },
        ],
      },
    ],
  },
  {
    id: 'goblin_ambush', name: 'Goblin Ambush', icon: '👺',
    description: 'Goblins leap from the bushes! "Toll road! Pay or bleed!"',
    choices: [
      { text: 'Fight!', outcomes: [{ weight: 1, text: 'You draw your weapon!', combat: 'zone' }] },
      {
        text: 'Pay the toll (60 gold)',
        requirement: { gold: 60 },
        outcomes: [{ weight: 1, text: 'The goblins count the coins gleefully and scatter.', gold: -60 }],
      },
      {
        text: 'Try to intimidate them',
        outcomes: [
          { weight: 5, text: 'Your glare sends them fleeing! One drops his loot bag!', gold: 50 },
          { weight: 5, text: 'They laugh. And attack.', combat: 'zone' },
        ],
      },
    ],
  },
  {
    id: 'fairy_ring', name: 'Fairy Ring', icon: '🍄',
    description: 'A perfect circle of glowing mushrooms. Tiny lights dance within.',
    choices: [
      {
        text: 'Step inside',
        outcomes: [
          { weight: 5, text: 'The fairies giggle and mend your wounds!', fullHeal: true },
          { weight: 5, text: 'The world spins — the fairies have moved you somewhere else!', teleport: true, hpPct: 0.2 },
        ],
      },
      { text: 'Walk around it', outcomes: [{ weight: 1, text: 'The lights dim as you pass. Wise, perhaps.' }] },
    ],
  },
  {
    id: 'abandoned_cart', name: 'Abandoned Cart', icon: '🛒',
    description: 'A merchant cart lies overturned in the road, cargo still lashed under canvas.',
    choices: [
      {
        text: 'Search it',
        outcomes: [
          { weight: 5, text: 'Supplies! And a strongbox no one came back for.', gold: 80, itemLuck: 0 },
          { weight: 3, text: 'The "cart" grins with wooden teeth. A MIMIC!', combat: 'elite' },
          { weight: 2, text: 'Empty. Scavengers beat you here.' },
        ],
      },
      { text: 'Leave it', outcomes: [{ weight: 1, text: 'Something about it felt wrong anyway.' }] },
    ],
  },
  {
    id: 'sudden_storm', name: 'Sudden Storm', icon: '⛈️',
    description: 'Black clouds boil overhead. Thunder shakes the ground. There\'s a cave nearby.',
    choices: [
      { text: 'Shelter in the cave', outcomes: [{ weight: 1, text: 'You wait out the storm, rested and dry.', hpPct: 0.15, mpPct: 0.3 }] },
      {
        text: 'Press on through it',
        outcomes: [{ weight: 1, text: 'Lightning-scarred but hardened by the ordeal!', hpPct: -0.15, exp: 45 }],
      },
    ],
  },
  {
    id: 'street_performer', name: 'Street Performer', icon: '🎻',
    description: 'A bard plays a haunting melody that seems to slow time itself.',
    choices: [
      {
        text: 'Tip generously (30 gold)',
        requirement: { gold: 30 },
        outcomes: [{ weight: 1, text: 'She plays a battle hymn just for you! Inspiring!', gold: -30, buff: { stat: 'atk', amount: 0.2, turns: 6 } }],
      },
      { text: 'Listen for free', outcomes: [{ weight: 1, text: 'A beautiful song. Your spirit lifts a little.', mpPct: 0.2 }] },
    ],
  },
  {
    id: 'mysterious_egg', name: 'Mysterious Egg', icon: '🥚',
    description: 'A huge, warm egg sits alone in a scorched nest. It pulses gently.',
    choices: [
      {
        text: 'Take it',
        outcomes: [
          { weight: 4, text: 'It hatches in your pack — the hatchling gifts you a shiny relic and flies off!', relic: true },
          { weight: 3, text: 'It hatches into… breakfast. Nutritious!', fullHeal: true },
          { weight: 3, text: 'The mother returns. She is NOT pleased.', combat: 'elite' },
        ],
      },
      { text: 'Leave it be', outcomes: [{ weight: 1, text: 'Nature knows best.' }] },
    ],
  },
  {
    id: 'shooting_star', name: 'Shooting Star', icon: '🌠',
    description: 'A star streaks across the sky! Quick — make a wish!',
    choices: [
      {
        text: 'Wish for wealth',
        outcomes: [
          { weight: 6, text: 'Starlight condenses into coins at your feet!', gold: 120 },
          { weight: 4, text: 'The star fades. Wealth must be earned.' },
        ],
      },
      {
        text: 'Wish for strength',
        outcomes: [
          { weight: 6, text: 'Stellar fire fills your veins! +20% ATK for 8 turns!', buff: { stat: 'atk', amount: 0.2, turns: 8 } },
          { weight: 4, text: 'The star fades. Strength must be forged.' },
        ],
      },
      {
        text: 'Wish for health',
        outcomes: [
          { weight: 6, text: 'Gentle light knits your wounds closed!', fullHeal: true },
          { weight: 4, text: 'The star fades. But you feel a little better.', hpPct: 0.15 },
        ],
      },
    ],
  },
  {
    id: 'black_cat', name: 'Black Cat', icon: '🐈‍⬛',
    description: 'A sleek black cat blocks your path, staring with golden eyes.',
    choices: [
      {
        text: 'Pet it',
        outcomes: [
          { weight: 7, text: 'It purrs and weaves between your legs. You feel lucky!', buff: { stat: 'dex', amount: 0.3, turns: 8 } },
          { weight: 3, text: 'It bites you and bolts. Rude.', hpPct: -0.05 },
        ],
      },
      {
        text: 'Shoo it away',
        outcomes: [
          { weight: 7, text: 'It saunters off, tail high, judging you.' },
          { weight: 3, text: 'It yowls a curse-like yowl. Surely superstition…', buff: { stat: 'dex', amount: -0.2, turns: 6 } },
        ],
      },
    ],
  },
];

export function randomEvent(): GameEvent {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}
