import { create } from 'zustand';
import type {
  BoardState, ClassId, CombatLogEntry, CombatState, Enemy, EquipSlot, EventOutcome,
  EventRuntime, GameEvent, Item, MetaState, Notification, Player, RunModifierId,
  Screen, ShopState, Stats, UIState,
} from './types';
import { computeStats, computeDamage, computeHeal, effectiveStats, expToNext, playerGoesFirst, rollDice } from './formulas';
import { generateBoard } from './board';
import { generateEnemy } from '../data/enemies';
import { getClass, evolutionOptions } from '../data/classes';
import { getSkill } from '../data/skills';
import { generateItem, generateShopInventory, enhancementCost, enhancementSuccessRate } from '../systems/items';
import { zoneForTile } from '../data/zones';
import { randomEvent } from '../data/events';
import { RELIC_IDS, getRelic } from '../data/relics';
import { getAchievement } from '../data/achievements';
import { META_UPGRADES, upgradeCost } from '../data/metaUpgrades';

// ============================================================
// DUNGEONOPOLY — central game store
// ============================================================

const SAVE_KEY = 'dungeonopoly_save_v2';
const META_KEY = 'dungeonopoly_meta_v1';
const STEP_MS = 240;
const ENEMY_TURN_MS = 900;
const ANIM_MS = 500;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let notifId = 0;
let logId = 0;

// ---------- initial state builders ----------

function emptyEquipment(): Player['equipment'] {
  return { weapon: null, armor: null, helmet: null, pants: null, boots: null, accessory: null };
}

function basePlayer(): Player {
  const shell = { level: 1, classId: 'novice' as ClassId, equipment: emptyEquipment() };
  const { stats, maxHp, maxMp } = computeStats(shell);
  return {
    name: 'Adventurer', classId: 'novice', level: 1, exp: 0,
    hp: maxHp, maxHp, mp: maxMp, maxMp, gold: 100,
    stats, equipment: emptyEquipment(),
    skills: [...getClass('novice').skillIds],
    inventory: [], consumables: [], buffs: [], statuses: [],
    critRate: 0.08, critDamage: 150,
    bonusStats: {}, bonusMaxHp: 0, bonusMaxMp: 0,
  };
}

function initialBoard(): BoardState {
  return {
    currentTile: 0, totalTiles: 100, tiles: generateBoard(),
    visitedTiles: [0], lastRoll: null, isMoving: false, lapCount: 0,
  };
}

function initialCombat(): CombatState {
  return {
    active: false, enemy: null, playerTurn: true, turnCount: 0, log: [],
    playerAnimation: 'idle', enemyAnimation: 'idle',
    outcome: 'ongoing', rewards: null, guarding: false,
  };
}

function defaultMeta(): MetaState {
  return {
    soulCrystals: 0, achievements: [], unlockedClasses: ['novice'],
    runCount: 0, runModifier: 'none', relics: [], permanentUpgrades: {},
    ngPlusLevel: 0, ngPlusUnlocked: false, counters: {},
    tilesWalked: 0, monstersKilled: 0,
  };
}

function loadMetaFromStorage(): MetaState {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return defaultMeta();
    return { ...defaultMeta(), ...JSON.parse(raw) };
  } catch {
    return defaultMeta();
  }
}

function initialUI(): UIState {
  return { screen: 'title', returnScreen: 'title', notifications: [], showLevelUp: false, levelUpData: null };
}

function initialShop(): ShopState {
  return { stock: [] };
}

function initialEvent(): EventRuntime & { pendingCombat: 'zone' | 'elite' | 'dragon' | null; pendingTeleport: boolean } {
  return { active: null, resultText: null, pendingCombat: null, pendingTeleport: false };
}

// ---------- store ----------

export interface GameStore {
  player: Player;
  board: BoardState;
  combat: CombatState;
  meta: MetaState;
  ui: UIState;
  shop: ShopState;
  event: ReturnType<typeof initialEvent>;

  // game flow
  newGame: (modifier?: RunModifierId, ngPlusLevel?: number) => void;
  setScreen: (screen: Screen) => void;
  openMeta: (from: Screen) => void;
  notify: (text: string, tone?: Notification['tone'], icon?: string) => void;
  dismissLevelUp: () => void;

  // board
  rollAndMove: () => Promise<void>;
  movePlayer: (steps: number) => Promise<void>;

  // progression
  addExp: (amount: number, source?: 'combat' | 'other') => void;
  earnGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  changeClass: (newClass: ClassId) => void;
  canChangeClass: () => boolean;

  // inventory
  addToInventory: (item: Item) => void;
  equipItem: (item: Item) => void;
  unequipItem: (slot: EquipSlot) => void;

  // combat
  startCombat: (enemy: Enemy) => void;
  playerAttack: () => Promise<void>;
  useSkill: (skillId: string) => Promise<void>;
  guard: () => Promise<void>;
  tryRun: () => Promise<void>;
  closeCombat: () => void;

  // shop
  buyItem: (item: Item) => void;
  sellItem: (item: Item) => void;
  enhanceEquipped: (slot: EquipSlot) => void;
  leaveShop: () => void;

  // events
  chooseEventOption: (choiceIndex: number) => void;
  closeEvent: () => void;

  // meta
  buyUpgrade: (upgradeId: string) => void;
  unlockAchievement: (id: string) => void;

  // persistence
  saveGame: () => void;
  loadGame: () => boolean;
  hasSave: () => boolean;
}

export const useGameStore = create<GameStore>()((set, get) => {

  // ---------- internal helpers ----------

  const pushLog = (text: string, tone: CombatLogEntry['tone']) => {
    set((s) => ({
      combat: { ...s.combat, log: [...s.combat.log, { id: logId++, text, tone }].slice(-50) },
    }));
  };

  const hasRelic = (id: string) => get().meta.relics.includes(id);
  const upgradeRank = (id: string) => get().meta.permanentUpgrades[id] ?? 0;
  const modifier = () => get().meta.runModifier;

  const persistMeta = () => {
    try { localStorage.setItem(META_KEY, JSON.stringify(get().meta)); } catch { /* ignore */ }
  };

  /** Recompute stats from level/class/equipment, then layer permanent upgrades, event bonuses, and relics. */
  const recomputePlayer = (player: Player): Player => {
    const { stats, maxHp, maxMp } = computeStats(player);

    // permanent soul upgrades (flat stats)
    stats.atk += upgradeRank('strength') * 2;
    stats.def += upgradeRank('ironskin') * 2;
    stats.spd += upgradeRank('swiftness') * 2;
    stats.int += upgradeRank('insight') * 2;
    stats.wis += upgradeRank('clarity') * 2;
    stats.dex += upgradeRank('precision') * 2;

    // permanent event bonuses
    for (const [key, value] of Object.entries(player.bonusStats)) {
      stats[key as keyof Stats] += value ?? 0;
    }

    // relic stat multipliers
    if (hasRelic('berserker_totem')) stats.atk = Math.round(stats.atk * 1.15);
    if (hasRelic('guardian_shell')) stats.def = Math.round(stats.def * 1.15);
    if (hasRelic('swift_boots')) stats.spd = Math.round(stats.spd * 1.15);

    let newMaxHp = Math.round(maxHp * (1 + upgradeRank('vitality') * 0.05) * (hasRelic('iron_heart') ? 1.15 : 1)) + player.bonusMaxHp;
    let newMaxMp = Math.round(maxMp * (1 + upgradeRank('wisdom') * 0.05)) + player.bonusMaxMp;
    newMaxHp = Math.max(1, newMaxHp);
    newMaxMp = Math.max(0, newMaxMp);

    return {
      ...player, stats, maxHp: newMaxHp, maxMp: newMaxMp,
      hp: Math.min(player.hp, newMaxHp),
      mp: Math.min(player.mp, newMaxMp),
      critRate: 0.08 + upgradeRank('lucky_strike') * 0.02 + (hasRelic('lucky_clover') ? 0.1 : 0),
      critDamage: 150 + upgradeRank('brutality') * 10,
    };
  };

  const playerEffStats = (): Stats => {
    const p = get().player;
    return effectiveStats(p.stats, p.buffs);
  };
  const enemyEffStats = (): Stats => {
    const e = get().combat.enemy!;
    return effectiveStats(e.stats, e.buffs);
  };

  const animate = async (side: 'player' | 'enemy', anim: CombatState['playerAnimation']) => {
    const key = side === 'player' ? 'playerAnimation' : 'enemyAnimation';
    set((s) => ({ combat: { ...s.combat, [key]: anim } }));
    await delay(ANIM_MS);
    set((s) => ({ combat: { ...s.combat, [key]: 'idle' } }));
  };

  const damagePlayer = (amount: number) => {
    set((s) => ({ player: { ...s.player, hp: Math.max(0, s.player.hp - amount) } }));
  };
  const damageEnemy = (amount: number) => {
    set((s) => ({
      combat: {
        ...s.combat,
        enemy: s.combat.enemy ? { ...s.combat.enemy, hp: Math.max(0, s.combat.enemy.hp - amount) } : null,
      },
    }));
  };

  const bumpCounter = (key: string, by = 1) => {
    set((s) => ({
      meta: { ...s.meta, counters: { ...s.meta.counters, [key]: (s.meta.counters[key] ?? 0) + by } },
    }));
  };

  // ---------- achievements ----------

  const unlockAchievement = (id: string) => {
    const meta = get().meta;
    if (meta.achievements.includes(id)) return;
    const def = getAchievement(id);
    if (!def) return;
    set((s) => ({ meta: { ...s.meta, achievements: [...s.meta.achievements, id] } }));
    get().notify(`Achievement: ${def.name}!`, 'legendary', def.icon);
    persistMeta();
  };

  const checkAchievements = () => {
    const { player, board, meta } = get();
    const kills = meta.counters.kills ?? 0;
    if (kills >= 1) unlockAchievement('first_blood');
    if (kills >= 10) unlockAchievement('slayer_10');
    if (kills >= 50) unlockAchievement('slayer_50');
    if (kills >= 100) unlockAchievement('slayer_100');
    if (player.level >= 10) unlockAchievement('level_10');
    if (player.level >= 35) unlockAchievement('level_35');
    if (player.level >= 70) unlockAchievement('level_70');
    if (player.gold >= 1000) unlockAchievement('rich_1000');
    if (player.gold >= 10000) unlockAchievement('rich_10000');
    if ((meta.counters.itemsBought ?? 0) >= 10) unlockAchievement('shopaholic');
    if (board.lapCount >= 3) unlockAchievement('lap_master');
    if (meta.relics.length >= 3) unlockAchievement('relic_collector');
    if (getClass(player.classId).tier === 3) unlockAchievement('tier3');
  };

  // ---------- relics ----------

  const addRelic = () => {
    const owned = get().meta.relics;
    const available = RELIC_IDS.filter((id) => !owned.includes(id));
    if (available.length === 0) {
      set((s) => ({ meta: { ...s.meta, soulCrystals: s.meta.soulCrystals + 30 } }));
      get().notify('All relics owned — +30 Soul Crystals instead!', 'legendary', '💠');
      persistMeta();
      return;
    }
    const relicId = available[Math.floor(Math.random() * available.length)];
    const relic = getRelic(relicId);
    set((s) => ({
      meta: { ...s.meta, relics: [...s.meta.relics, relicId] },
      // relics can change derived stats
    }));
    set((s) => ({ player: recomputePlayer(s.player) }));
    get().notify(`Relic found: ${relic.name} — ${relic.description}`, 'legendary', relic.icon);
    checkAchievements();
  };

  const dropChanceBonus = () =>
    (hasRelic('hunters_eye') ? 0.15 : 0) + upgradeRank('treasure_hunter') * 0.05;

  const soulCrystalsFor = (won: boolean) => {
    const m = get().meta;
    const base = m.tilesWalked * 0.5 + m.monstersKilled * 2 + (won ? 100 : 10);
    const mult = (1 + upgradeRank('soul_bond') * 0.1)
      * (modifier() === 'ironman' ? 1.75 : 1)
      * (modifier() === 'cursed' ? 1.5 : 1);
    return Math.round(base * mult);
  };

  // ---------- combat internals ----------

  const processStatuses = (side: 'player' | 'enemy'): boolean => {
    const state = get();
    const statuses = side === 'player' ? state.player.statuses : state.combat.enemy?.statuses ?? [];
    let skip = false;

    for (const st of statuses) {
      if (st.id === 'poison' || st.id === 'burn') {
        const dmg = Math.max(1, Math.round(st.power));
        if (side === 'player') damagePlayer(dmg); else damageEnemy(dmg);
        pushLog(
          `${side === 'player' ? 'You suffer' : `${state.combat.enemy?.name} suffers`} ${dmg} ${st.id} damage!`,
          side === 'player' ? 'enemy' : 'player',
        );
      }
      if (st.id === 'freeze' || st.id === 'stun') {
        skip = true;
        pushLog(
          `${side === 'player' ? 'You are' : `${state.combat.enemy?.name} is`} ${st.id === 'freeze' ? 'frozen' : 'stunned'} and cannot act!`,
          'system',
        );
      }
    }

    const tick = (arr: typeof statuses) =>
      arr.map((s) => ({ ...s, turnsLeft: s.turnsLeft - 1 })).filter((s) => s.turnsLeft > 0);
    if (side === 'player') {
      set((s) => ({ player: { ...s.player, statuses: tick(s.player.statuses) } }));
    } else {
      set((s) => ({
        combat: {
          ...s.combat,
          enemy: s.combat.enemy ? { ...s.combat.enemy, statuses: tick(s.combat.enemy.statuses) } : null,
        },
      }));
    }
    return skip;
  };

  const tickBuffs = (side: 'player' | 'enemy') => {
    const tick = (arr: Player['buffs']) =>
      arr.map((b) => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter((b) => b.turnsLeft > 0);
    if (side === 'player') {
      set((s) => ({ player: { ...s.player, buffs: tick(s.player.buffs) } }));
    } else {
      set((s) => ({
        combat: {
          ...s.combat,
          enemy: s.combat.enemy ? { ...s.combat.enemy, buffs: tick(s.combat.enemy.buffs) } : null,
        },
      }));
    }
  };

  const checkVictory = async (): Promise<boolean> => {
    const { combat } = get();
    if (!combat.enemy || combat.enemy.hp > 0) return false;
    await animate('enemy', 'death');
    const enemy = combat.enemy;

    const dropChance = (enemy.isBoss ? 1 : 0.25) + dropChanceBonus();
    const items: Item[] = Math.random() < dropChance
      ? [generateItem(enemy.level, { luckBonus: enemy.isBoss ? 2 : 0 })]
      : [];

    set((s) => ({
      combat: { ...s.combat, outcome: 'victory', rewards: { exp: enemy.expReward, gold: enemy.goldReward, items } },
      meta: { ...s.meta, monstersKilled: s.meta.monstersKilled + 1 },
    }));
    bumpCounter('kills');
    pushLog(`${enemy.name} is defeated!`, 'reward');

    // relic hooks
    if (hasRelic('vampire_fang')) {
      const heal = Math.round(get().player.maxHp * 0.05);
      set((s) => ({ player: { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + heal) } }));
      pushLog(`Vampire Fang drains ${heal} HP from the fallen!`, 'player');
    }

    // achievements
    if (get().player.hp / get().player.maxHp < 0.1) unlockAchievement('survivor');
    if (enemy.isBoss) unlockAchievement('boss_slayer');
    if (enemy.isBoss && Math.random() < 0.35) addRelic();
    else if (enemy.kind === 'elite' && Math.random() < 0.15) addRelic();
    checkAchievements();
    return true;
  };

  const checkDefeat = async (): Promise<boolean> => {
    if (get().player.hp > 0) return false;

    // Phoenix Feather — one revive per run
    if (hasRelic('phoenix_feather') && !(get().meta.counters.run_phoenix_used ?? 0)) {
      bumpCounter('run_phoenix_used');
      set((s) => ({ player: { ...s.player, hp: Math.round(s.player.maxHp * 0.5) } }));
      pushLog('🪶 The Phoenix Feather bursts into flame — you rise again!', 'reward');
      get().notify('Phoenix Feather saved you!', 'legendary', '🪶');
      return false;
    }

    await animate('player', 'death');
    set((s) => ({ combat: { ...s.combat, outcome: 'defeat' } }));
    pushLog('You have fallen…', 'system');
    unlockAchievement('first_death');
    return true;
  };

  const enemyTurn = async () => {
    await delay(ENEMY_TURN_MS);
    const { combat } = get();
    if (!combat.active || combat.outcome !== 'ongoing' || !combat.enemy) return;

    const skipped = processStatuses('enemy');
    if (await checkVictory()) return;

    if (!skipped) {
      const enemy = get().combat.enemy!;
      const useEnemySkill = enemy.skills.length > 0 && Math.random() < 0.4;
      const skill = useEnemySkill ? getSkill(enemy.skills[Math.floor(Math.random() * enemy.skills.length)]) : null;

      await animate('enemy', skill ? 'skill' : 'attack');

      const result = computeDamage({
        attackerStats: enemyEffStats(),
        defenderStats: playerEffStats(),
        skill,
        defenderWeakness: null,
        critRate: 0.05,
        critDamage: 150,
      });

      if (result.missed) {
        pushLog(`${enemy.name}'s attack misses!`, 'system');
      } else {
        let dmg = result.damage;
        if (hasRelic('cursed_skull')) dmg = Math.round(dmg * 1.15);
        if (get().combat.guarding) {
          dmg = Math.max(1, Math.round(dmg / 2));
          pushLog('Your guard absorbs half the blow!', 'system');
        }
        damagePlayer(dmg);
        void animate('player', 'hurt');
        pushLog(
          `${enemy.name} ${skill ? `uses ${skill.name}` : 'attacks'} for ${dmg} damage${result.crit ? ' — CRITICAL!' : '!'}`,
          result.crit ? 'critical' : 'enemy',
        );
        if (skill?.status && Math.random() < (skill.statusChance ?? 0)) {
          set((s) => ({
            player: {
              ...s.player,
              statuses: [...s.player.statuses.filter((st) => st.id !== skill.status),
                { id: skill.status!, turnsLeft: skill.duration ?? 2, power: Math.round(enemy.stats.int * 0.4) }],
            },
          }));
          pushLog(`You are afflicted with ${skill.status}!`, 'enemy');
        }
      }
      if (await checkDefeat()) return;
    }

    tickBuffs('enemy');
    set((s) => ({ combat: { ...s.combat, guarding: false, playerTurn: true, turnCount: s.combat.turnCount + 1 } }));

    const playerSkipped = processStatuses('player');
    if (await checkDefeat()) return;
    if (playerSkipped) {
      tickBuffs('player');
      set((s) => ({ combat: { ...s.combat, playerTurn: false } }));
      void enemyTurn();
    }
  };

  const afterPlayerAction = async () => {
    if (await checkVictory()) return;
    tickBuffs('player');
    set((s) => ({ combat: { ...s.combat, playerTurn: false } }));
    void enemyTurn();
  };

  const applyCursedSkull = (dmg: number) => (hasRelic('cursed_skull') ? Math.round(dmg * 1.3) : dmg);

  // ---------- event system ----------

  const enhanceRandomEquipped = (): string | null => {
    const equipped = Object.values(get().player.equipment).filter((i): i is Item => i !== null && i.enhancement < 15);
    if (equipped.length === 0) return null;
    const pick = equipped[Math.floor(Math.random() * equipped.length)];
    set((s) => {
      const equipment = { ...s.player.equipment };
      equipment[pick.slot] = { ...pick, enhancement: pick.enhancement + 1 };
      return { player: recomputePlayer({ ...s.player, equipment }) };
    });
    return `${pick.name} → +${pick.enhancement + 1}`;
  };

  const triggerEvent = (event?: GameEvent) => {
    set(() => ({ event: { ...initialEvent(), active: event ?? randomEvent() } }));
    bumpCounter('eventsTriggered');
  };

  const applyEventOutcome = (outcome: EventOutcome) => {
    const zone = zoneForTile(get().board.currentTile);
    const zoneMult = 1 + (zone.id - 1) * 0.6;
    const parts: string[] = [];

    if (outcome.gold) {
      if (outcome.gold > 0) {
        const amount = Math.round(outcome.gold * zoneMult);
        get().earnGold(amount);
        parts.push(`+${amount} gold`);
      } else {
        set((s) => ({ player: { ...s.player, gold: Math.max(0, s.player.gold + outcome.gold!) } }));
        parts.push(`${outcome.gold} gold`);
      }
    }
    if (outcome.goldPct) {
      const amount = Math.round(get().player.gold * outcome.goldPct);
      set((s) => ({ player: { ...s.player, gold: Math.max(0, s.player.gold + amount) } }));
      parts.push(`${amount >= 0 ? '+' : ''}${amount} gold`);
    }
    if (outcome.exp) {
      const amount = Math.round(outcome.exp * zoneMult);
      get().addExp(amount, 'other');
      parts.push(`+${amount} EXP`);
    }
    if (outcome.hpPct) {
      const amount = Math.round(get().player.maxHp * outcome.hpPct);
      set((s) => ({
        player: { ...s.player, hp: Math.max(1, Math.min(s.player.maxHp, s.player.hp + amount)) },
      }));
      parts.push(`${amount >= 0 ? '+' : ''}${amount} HP`);
    }
    if (outcome.mpPct) {
      const amount = Math.round(get().player.maxMp * outcome.mpPct);
      set((s) => ({
        player: { ...s.player, mp: Math.max(0, Math.min(s.player.maxMp, s.player.mp + amount)) },
      }));
      parts.push(`${amount >= 0 ? '+' : ''}${amount} MP`);
    }
    if (outcome.fullHeal) {
      set((s) => ({ player: { ...s.player, hp: s.player.maxHp, mp: s.player.maxMp, statuses: [] } }));
      parts.push('fully restored');
    }
    if (outcome.itemLuck !== undefined) {
      const item = generateItem(get().player.level, { luckBonus: outcome.itemLuck });
      get().addToInventory(item);
      parts.push(`obtained ${item.name}`);
    }
    if (outcome.relic) addRelic();
    if (outcome.buff) {
      set((s) => ({
        player: {
          ...s.player,
          buffs: [...s.player.buffs.filter((b) => b.stat !== outcome.buff!.stat),
            { stat: outcome.buff!.stat, amount: outcome.buff!.amount, turnsLeft: outcome.buff!.turns }],
        },
      }));
      parts.push(`${outcome.buff.stat.toUpperCase()} ${outcome.buff.amount > 0 ? '+' : ''}${Math.round(outcome.buff.amount * 100)}% (${outcome.buff.turns} turns)`);
    }
    if (outcome.maxHpPct) {
      const amount = Math.round(get().player.maxHp * outcome.maxHpPct);
      set((s) => ({ player: recomputePlayer({ ...s.player, bonusMaxHp: s.player.bonusMaxHp + amount }) }));
      parts.push(`${amount >= 0 ? '+' : ''}${amount} max HP`);
    }
    if (outcome.bonusStat) {
      set((s) => ({
        player: recomputePlayer({
          ...s.player,
          bonusStats: {
            ...s.player.bonusStats,
            [outcome.bonusStat!.stat]: (s.player.bonusStats[outcome.bonusStat!.stat] ?? 0) + outcome.bonusStat!.amount,
          },
        }),
      }));
      parts.push(`+${outcome.bonusStat.amount} ${outcome.bonusStat.stat.toUpperCase()} (permanent)`);
    }
    if (outcome.enhance) {
      const result = enhanceRandomEquipped();
      parts.push(result ?? 'no equipment to enhance');
    }
    if (outcome.achievement) unlockAchievement(outcome.achievement);

    set((s) => ({
      event: {
        ...s.event,
        resultText: outcome.text + (parts.length ? `  (${parts.join(', ')})` : ''),
        pendingCombat: outcome.combat ?? null,
        pendingTeleport: outcome.teleport ?? false,
      },
    }));
    checkAchievements();
  };

  // ---------- tile resolution ----------

  const resolveTile = async (index: number) => {
    const { board, player, notify } = get();
    const tile = board.tiles[index];
    const zone = zoneForTile(index);
    const lapScale = get().board.lapCount;
    const levelRange: [number, number] = [
      zone.levelRange[0] + lapScale * 10,
      zone.levelRange[1] + lapScale * 10,
    ];

    switch (tile.type) {
      case 'start':
        notify('Back at the starting banner. Rest a moment.', 'info', '🚩');
        break;

      case 'monster':
        await delay(400);
        get().startCombat(generateEnemy(zone.id, levelRange));
        break;

      case 'boss':
        await delay(400);
        notify(`A powerful presence stirs…`, 'danger', '👑');
        await delay(600);
        get().startCombat(generateEnemy(zone.id, levelRange, true));
        break;

      case 'dungeon': {
        await delay(400);
        notify('You descend into a dungeon… an elite guardian awaits!', 'danger', '🏰');
        await delay(600);
        const elite = generateEnemy(zone.id, [levelRange[1], levelRange[1] + 3]);
        elite.name = `Elite ${elite.name.replace(/^Lv\.\d+ /, '')}`;
        elite.kind = 'elite';
        elite.goldReward = Math.round(elite.goldReward * 1.8);
        elite.expReward = Math.round(elite.expReward * 1.5);
        get().startCombat(elite);
        break;
      }

      case 'arena': {
        await delay(400);
        notify('The crowd roars — an arena champion challenges you!', 'info', '🎭');
        await delay(600);
        const champ = generateEnemy(zone.id, [levelRange[1] + 1, levelRange[1] + 2]);
        champ.name = `Champion ${champ.name.replace(/^Lv\.\d+ /, '')}`;
        champ.kind = 'champion';
        champ.goldReward = Math.round(champ.goldReward * 2.5);
        get().startCombat(champ);
        break;
      }

      case 'heal': {
        if (modifier() === 'ironman') {
          notify('The spring is dry… (Iron Man)', 'danger', '🩹');
          break;
        }
        const hpGain = Math.round(player.maxHp * 0.6);
        const mpGain = Math.round(player.maxMp * 0.6);
        set((s) => ({
          player: {
            ...s.player,
            hp: Math.min(s.player.maxHp, s.player.hp + hpGain),
            mp: Math.min(s.player.maxMp, s.player.mp + mpGain),
            statuses: [],
          },
        }));
        notify(`A warm spring restores ${hpGain} HP and ${mpGain} MP!`, 'success', '❤️');
        break;
      }

      case 'curse': {
        if (Math.random() < 0.5) {
          const loss = Math.round(player.gold * 0.15);
          set((s) => ({ player: { ...s.player, gold: Math.max(0, s.player.gold - loss) } }));
          notify(`A curse drains ${loss} gold from your pouch!`, 'danger', '💀');
        } else {
          const dmg = Math.round(player.maxHp * 0.15);
          set((s) => ({ player: { ...s.player, hp: Math.max(1, s.player.hp - dmg) } }));
          notify(`Dark energy sears you for ${dmg} damage!`, 'danger', '💀');
        }
        break;
      }

      case 'treasure': {
        const gold = Math.round((30 + zone.id * 40) * (0.8 + Math.random() * 0.6));
        get().earnGold(gold);
        if (Math.random() < 0.12) {
          addRelic();
          notify(`Treasure! ${gold} gold — and something ancient glows within…`, 'legendary', '🏆');
        } else if (Math.random() < 0.4 + dropChanceBonus()) {
          const item = generateItem(player.level, { luckBonus: 1 });
          get().addToInventory(item);
          notify(`Treasure! ${gold} gold and ${item.name}!`, 'legendary', '🏆');
        } else {
          notify(`Treasure! You find ${gold} gold!`, 'success', '🏆');
        }
        break;
      }

      case 'portal': {
        let target = Math.floor(Math.random() * 100);
        while (board.tiles[target].type === 'portal' || board.tiles[target].type === 'boss') {
          target = Math.floor(Math.random() * 100);
        }
        notify(`The portal hurls you to tile ${target + 1}!`, 'info', '🌀');
        await delay(800);
        set((s) => ({
          board: {
            ...s.board,
            currentTile: target,
            visitedTiles: [...new Set([...s.board.visitedTiles, target])],
          },
        }));
        await resolveTile(target);
        return; // avoid double-saving
      }

      case 'upgrade': {
        const result = enhanceRandomEquipped();
        if (result) {
          notify(`A wandering smith works your gear: ${result}!`, 'success', '🏗️');
          const enhanced = Object.values(get().player.equipment).filter((i): i is Item => i !== null);
          if (enhanced.some((i) => i.enhancement >= 5)) unlockAchievement('enhancer');
          if (enhanced.some((i) => i.enhancement >= 10)) unlockAchievement('max_enhance');
        } else {
          notify('The blacksmith shrugs — you have nothing equipped to improve.', 'info', '🏗️');
        }
        break;
      }

      case 'quest': {
        const exp = Math.round(15 + zone.id * 12);
        notify(`You help a villager with a task. +EXP!`, 'success', '📜');
        get().addExp(exp, 'other');
        break;
      }

      case 'event':
        await delay(300);
        triggerEvent();
        break;

      case 'shop': {
        set(() => ({ shop: { stock: generateShopInventory(get().player.level, zone.id) } }));
        get().setScreen('shop');
        break;
      }
    }

    get().saveGame();
  };

  // ---------- public API ----------

  return {
    player: basePlayer(),
    board: initialBoard(),
    combat: initialCombat(),
    meta: loadMetaFromStorage(),
    ui: initialUI(),
    shop: initialShop(),
    event: initialEvent(),

    // ----- game flow -----

    newGame: (runModifier = 'none', ngPlusLevel) => {
      set((s) => {
        // reset run-scoped counters
        const counters = Object.fromEntries(
          Object.entries(s.meta.counters).filter(([k]) => !k.startsWith('run_')),
        );
        return {
          board: initialBoard(),
          combat: initialCombat(),
          shop: initialShop(),
          event: initialEvent(),
          meta: {
            ...s.meta,
            runCount: s.meta.runCount + 1,
            runModifier,
            ngPlusLevel: ngPlusLevel ?? s.meta.ngPlusLevel,
            tilesWalked: 0, monstersKilled: 0, relics: [], counters,
          },
          ui: { ...initialUI(), screen: 'board' },
        };
      });
      // build the player after meta is set so passives apply
      set((s) => {
        const p = recomputePlayer(basePlayer());
        p.hp = p.maxHp;
        p.mp = p.maxMp;
        p.gold = 100 + upgradeRank('inheritance') * 100 + (runModifier === 'pacifist' ? 200 : 0);
        return { player: p, meta: s.meta };
      });
      const ng = get().meta.ngPlusLevel;
      get().notify(
        ng > 0 ? `NG+${ng} begins — enemies are empowered!` : 'A new adventure begins! Roll the dice!',
        'legendary', '🎲',
      );
      persistMeta();
      get().saveGame();
    },

    setScreen: (screen) => set((s) => ({ ui: { ...s.ui, screen } })),

    openMeta: (from) => set((s) => ({ ui: { ...s.ui, screen: 'meta', returnScreen: from } })),

    notify: (text, tone = 'info', icon) => {
      const id = notifId++;
      set((s) => ({ ui: { ...s.ui, notifications: [...s.ui.notifications, { id, text, tone, icon }].slice(-4) } }));
      setTimeout(() => {
        set((s) => ({ ui: { ...s.ui, notifications: s.ui.notifications.filter((n) => n.id !== id) } }));
      }, 4200);
    },

    dismissLevelUp: () => set((s) => ({ ui: { ...s.ui, showLevelUp: false, levelUpData: null } })),

    // ----- board -----

    rollAndMove: async () => {
      const { board, combat, event } = get();
      if (board.isMoving || combat.active || event.active) return;
      const roll = modifier() === 'speed' ? rollDice(6) + rollDice(6) : rollDice(6);
      set((s) => ({ board: { ...s.board, lastRoll: roll, isMoving: true } }));
      await delay(1100);
      await get().movePlayer(roll);
    },

    movePlayer: async (steps) => {
      set((s) => ({ board: { ...s.board, isMoving: true } }));
      for (let i = 0; i < steps; i++) {
        await delay(STEP_MS);
        set((s) => {
          const next = (s.board.currentTile + 1) % s.board.totalTiles;
          const lapped = next === 0;
          if (lapped) {
            const bonus = 100 + s.player.level * 10;
            setTimeout(() => {
              get().notify(`Lap complete! +${bonus} gold`, 'legendary', '🏁');
              if (get().meta.runModifier === 'chaos') {
                get().notify('CHAOS — the board reshuffles itself!', 'danger', '🌪️');
              }
              checkAchievements();
            }, 0);
            return {
              board: {
                ...s.board,
                currentTile: next,
                lapCount: s.board.lapCount + 1,
                tiles: s.meta.runModifier === 'chaos' ? generateBoard() : s.board.tiles,
                visitedTiles: s.meta.runModifier === 'chaos' ? [0] : [...new Set([...s.board.visitedTiles, next])],
              },
              player: { ...s.player, gold: s.player.gold + bonus },
              meta: { ...s.meta, tilesWalked: s.meta.tilesWalked + 1 },
            };
          }
          return {
            board: {
              ...s.board, currentTile: next,
              visitedTiles: [...new Set([...s.board.visitedTiles, next])],
            },
            meta: { ...s.meta, tilesWalked: s.meta.tilesWalked + 1 },
          };
        });
      }
      set((s) => ({ board: { ...s.board, isMoving: false } }));
      await resolveTile(get().board.currentTile);
    },

    // ----- progression -----

    addExp: (amount, source = 'other') => {
      let scaled = amount;
      if (modifier() === 'pacifist') scaled = source === 'combat' ? 0 : scaled * 3;
      if (modifier() === 'speed') scaled *= 0.75;
      scaled *= 1 + upgradeRank('scholar') * 0.1;
      if (hasRelic('tome_knowledge')) scaled *= 1.25;
      scaled = Math.round(scaled);
      if (scaled <= 0) return;

      set((s) => {
        let { level, exp } = s.player;
        exp += scaled;
        const gains: Partial<Stats> = {};
        let leveled = false;

        while (exp >= expToNext(level)) {
          exp -= expToNext(level);
          level++;
          leveled = true;
        }

        if (!leveled) return { player: { ...s.player, exp } };

        const before = s.player.stats;
        const updated = recomputePlayer({ ...s.player, level, exp });
        for (const key of Object.keys(before) as (keyof Stats)[]) {
          gains[key] = updated.stats[key] - before[key];
        }
        updated.hp = updated.maxHp;
        updated.mp = updated.maxMp;

        return {
          player: updated,
          ui: { ...s.ui, showLevelUp: true, levelUpData: { newLevel: level, statGains: gains } },
        };
      });

      const p = get().player;
      const tier = getClass(p.classId).tier;
      if ((p.level >= 10 && tier === 0) || (p.level >= 35 && tier === 1) || (p.level >= 70 && tier === 2)) {
        get().notify('A new class awaits! Open the Class menu.', 'legendary', '🌟');
      }
      checkAchievements();
    },

    earnGold: (amount) => {
      let scaled = amount * (1 + upgradeRank('fortune') * 0.1);
      if (hasRelic('golden_idol')) scaled *= 1.25;
      if (modifier() === 'chaos') scaled *= 1.25;
      set((s) => ({ player: { ...s.player, gold: s.player.gold + Math.round(scaled) } }));
      checkAchievements();
    },

    spendGold: (amount) => {
      if (get().player.gold < amount) return false;
      set((s) => ({ player: { ...s.player, gold: s.player.gold - amount } }));
      return true;
    },

    canChangeClass: () => {
      const p = get().player;
      const tier = getClass(p.classId).tier;
      return (p.level >= 10 && tier === 0) || (p.level >= 35 && tier === 1) || (p.level >= 70 && tier === 2);
    },

    changeClass: (newClass) => {
      const p = get().player;
      const options = evolutionOptions(p.classId);
      const target = getClass(newClass);
      if (!options.some((o) => o.id === newClass) || p.level < target.unlockLevel) {
        get().notify('You cannot take that path yet.', 'danger');
        return;
      }
      set((s) => {
        const updated = recomputePlayer({
          ...s.player,
          classId: newClass,
          skills: [...target.skillIds],
        });
        updated.hp = updated.maxHp;
        updated.mp = updated.maxMp;
        return {
          player: updated,
          meta: { ...s.meta, unlockedClasses: [...new Set([...s.meta.unlockedClasses, newClass])] },
        };
      });
      get().notify(`You are now a ${target.name}!`, 'legendary', '🌟');
      unlockAchievement('class_change');
      checkAchievements();
      persistMeta();
      get().saveGame();
    },

    // ----- inventory -----

    addToInventory: (item) =>
      set((s) => ({ player: { ...s.player, inventory: [...s.player.inventory, item].slice(0, 30) } })),

    equipItem: (item) => {
      set((s) => {
        const inventory = s.player.inventory.filter((i) => i.id !== item.id);
        const previous = s.player.equipment[item.slot];
        if (previous) inventory.push(previous);
        const equipment = { ...s.player.equipment, [item.slot]: item };
        return { player: recomputePlayer({ ...s.player, inventory, equipment }) };
      });
      get().notify(`Equipped ${item.name}!`, 'success', item.icon);
    },

    unequipItem: (slot) => {
      set((s) => {
        const item = s.player.equipment[slot];
        if (!item) return s;
        return {
          player: recomputePlayer({
            ...s.player,
            equipment: { ...s.player.equipment, [slot]: null },
            inventory: [...s.player.inventory, item],
          }),
        };
      });
    },

    // ----- combat -----

    startCombat: (enemy) => {
      // NG+ / modifier scaling
      const ng = get().meta.ngPlusLevel;
      const statScale = (1 + 0.5 * ng) * (modifier() === 'cursed' ? 1.3 : 1);
      const rewardScale = (1 + 0.5 * ng) * (modifier() === 'cursed' ? 1.5 : 1);
      if (statScale !== 1 || rewardScale !== 1) {
        enemy = {
          ...enemy,
          maxHp: Math.round(enemy.maxHp * statScale),
          hp: Math.round(enemy.maxHp * statScale),
          stats: Object.fromEntries(
            Object.entries(enemy.stats).map(([k, v]) => [k, Math.round(v * statScale)]),
          ) as unknown as Stats,
          expReward: Math.round(enemy.expReward * rewardScale),
          goldReward: Math.round(enemy.goldReward * rewardScale),
        };
      }

      const first = playerGoesFirst(playerEffStats().spd, effectiveStats(enemy.stats, enemy.buffs).spd);
      set((s) => ({
        combat: { ...initialCombat(), active: true, enemy, playerTurn: first, turnCount: 1 },
        ui: { ...s.ui, screen: 'combat' },
      }));
      pushLog(`${enemy.name} appears!`, 'system');
      pushLog(first ? 'You move first!' : `${enemy.name} moves first!`, 'system');
      if (!first) void enemyTurn();
    },

    playerAttack: async () => {
      const { combat } = get();
      if (!combat.active || !combat.playerTurn || combat.outcome !== 'ongoing') return;
      set((s) => ({ combat: { ...s.combat, playerTurn: false } }));

      await animate('player', 'attack');
      const enemy = get().combat.enemy!;
      const result = computeDamage({
        attackerStats: playerEffStats(),
        defenderStats: enemyEffStats(),
        skill: null,
        defenderWeakness: enemy.weakness,
        critRate: get().player.critRate,
        critDamage: get().player.critDamage,
      });

      if (result.missed) {
        pushLog('Your attack misses!', 'system');
      } else {
        const dmg = applyCursedSkull(result.damage);
        damageEnemy(dmg);
        void animate('enemy', 'hurt');
        pushLog(`You strike for ${dmg} damage${result.crit ? ' — CRITICAL!' : '!'}`, result.crit ? 'critical' : 'player');
      }
      await afterPlayerAction();
    },

    useSkill: async (skillId) => {
      const { combat, player } = get();
      if (!combat.active || !combat.playerTurn || combat.outcome !== 'ongoing') return;
      const skill = getSkill(skillId);
      if (player.mp < skill.mpCost) {
        get().notify('Not enough MP!', 'danger', '💧');
        return;
      }
      set((s) => ({
        combat: { ...s.combat, playerTurn: false },
        player: { ...s.player, mp: s.player.mp - skill.mpCost },
      }));

      await animate('player', 'skill');
      const enemy = get().combat.enemy!;

      if (skill.kind === 'damage') {
        const result = computeDamage({
          attackerStats: playerEffStats(),
          defenderStats: enemyEffStats(),
          skill,
          defenderWeakness: enemy.weakness,
          critRate: get().player.critRate,
          critDamage: get().player.critDamage,
          extraCritRate: skillId === 'backstab' ? 0.25 : 0,
        });
        if (result.missed) {
          pushLog(`${skill.name} misses!`, 'system');
        } else {
          const dmg = applyCursedSkull(result.damage);
          damageEnemy(dmg);
          void animate('enemy', 'hurt');
          pushLog(
            `${skill.name} hits for ${dmg}${result.elementBonus ? ' (weakness!)' : ''}${result.crit ? ' — CRITICAL!' : '!'}`,
            result.crit ? 'critical' : 'player',
          );
          if (skill.status && Math.random() < (skill.statusChance ?? 0)) {
            set((s) => ({
              combat: {
                ...s.combat,
                enemy: s.combat.enemy ? {
                  ...s.combat.enemy,
                  statuses: [...s.combat.enemy.statuses.filter((st) => st.id !== skill.status),
                    { id: skill.status!, turnsLeft: skill.duration ?? 2, power: Math.round(playerEffStats().atk * 0.35) }],
                } : null,
              },
            }));
            pushLog(`${enemy.name} is afflicted with ${skill.status}!`, 'player');
          }
        }
      } else if (skill.kind === 'heal') {
        const amount = computeHeal(playerEffStats().wis, skill);
        set((s) => ({ player: { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + amount) } }));
        pushLog(`${skill.name} restores ${amount} HP!`, 'player');
      } else if (skill.kind === 'buff' && skill.targetStat) {
        set((s) => ({
          player: {
            ...s.player,
            buffs: [...s.player.buffs.filter((b) => b.stat !== skill.targetStat),
              { stat: skill.targetStat!, amount: skill.power, turnsLeft: skill.duration ?? 3 }],
          },
        }));
        pushLog(`${skill.name}! ${skill.targetStat.toUpperCase()} up for ${skill.duration} turns!`, 'player');
      }

      await afterPlayerAction();
    },

    guard: async () => {
      const { combat } = get();
      if (!combat.active || !combat.playerTurn || combat.outcome !== 'ongoing') return;
      set((s) => ({
        combat: { ...s.combat, playerTurn: false, guarding: true },
        player: { ...s.player, mp: Math.min(s.player.maxMp, s.player.mp + Math.round(s.player.maxMp * 0.1)) },
      }));
      pushLog('You brace for impact (+10% MP).', 'player');
      tickBuffs('player');
      void enemyTurn();
    },

    tryRun: async () => {
      const { combat } = get();
      if (!combat.active || !combat.playerTurn || combat.outcome !== 'ongoing') return;
      const enemy = combat.enemy!;
      if (enemy.isBoss) {
        pushLog('There is no escape from this foe!', 'system');
        return;
      }
      set((s) => ({ combat: { ...s.combat, playerTurn: false } }));
      const chance = Math.min(0.9, Math.max(0.1, 0.5 + (playerEffStats().spd - enemyEffStats().spd) * 0.02));
      if (Math.random() < chance) {
        pushLog('You slip away safely!', 'system');
        await delay(700);
        set((s) => ({ combat: { ...s.combat, outcome: 'fled' } }));
      } else {
        pushLog('You fail to escape!', 'system');
        void enemyTurn();
      }
    },

    closeCombat: () => {
      const { combat } = get();
      const defeatedEnemy = combat.enemy;
      const wasFinalBoss = combat.outcome === 'victory'
        && !!defeatedEnemy?.isBoss
        && zoneForTile(get().board.currentTile).id === 5;

      if (combat.outcome === 'victory' && combat.rewards) {
        const { exp, gold, items } = combat.rewards;
        get().earnGold(gold);
        for (const item of items) get().addToInventory(item);

        if (wasFinalBoss) {
          // === RUN COMPLETE ===
          const crystals = soulCrystalsFor(true);
          unlockAchievement('demon_slayer');
          set((s) => ({
            meta: { ...s.meta, soulCrystals: s.meta.soulCrystals + crystals, ngPlusUnlocked: true },
            combat: initialCombat(),
            ui: { ...s.ui, screen: 'victory' },
          }));
          persistMeta();
          get().saveGame();
          return;
        }

        set((s) => ({
          player: { ...s.player, buffs: [], statuses: [] },
          combat: initialCombat(),
          ui: { ...s.ui, screen: 'board' },
        }));
        get().addExp(exp, 'combat');
        get().notify(`Victory! +${gold} gold`, 'success', '⚔️');
        persistMeta();
        get().saveGame();
      } else if (combat.outcome === 'defeat') {
        const crystals = soulCrystalsFor(false);
        set((s) => ({
          meta: { ...s.meta, soulCrystals: s.meta.soulCrystals + crystals },
          combat: initialCombat(),
          ui: { ...s.ui, screen: 'gameover' },
        }));
        persistMeta();
        get().saveGame();
      } else {
        set((s) => ({
          player: { ...s.player, buffs: [], statuses: [] },
          combat: initialCombat(),
          ui: { ...s.ui, screen: 'board' },
        }));
        get().saveGame();
      }
    },

    // ----- shop -----

    buyItem: (item) => {
      const price = Math.round(item.price * (hasRelic('merchant_seal') ? 0.8 : 1));
      if (!get().spendGold(price)) {
        get().notify('Not enough gold!', 'danger', '🪙');
        return;
      }
      set((s) => ({
        shop: { stock: s.shop.stock.filter((i) => i.id !== item.id) },
        player: { ...s.player, inventory: [...s.player.inventory, item].slice(0, 30) },
      }));
      bumpCounter('itemsBought');
      get().notify(`Bought ${item.name}!`, 'success', item.icon);
      checkAchievements();
      persistMeta();
    },

    sellItem: (item) => {
      const value = Math.round(item.price * 0.4 * (1 + item.enhancement * 0.15));
      set((s) => ({
        player: { ...s.player, inventory: s.player.inventory.filter((i) => i.id !== item.id) },
      }));
      get().earnGold(value);
      get().notify(`Sold ${item.name} for ${value} gold.`, 'info', '🪙');
    },

    enhanceEquipped: (slot) => {
      const item = get().player.equipment[slot];
      if (!item || item.enhancement >= 15) return;
      const cost = enhancementCost(item);
      if (!get().spendGold(cost)) {
        get().notify('Not enough gold to enhance!', 'danger', '🪙');
        return;
      }
      const rate = enhancementSuccessRate(item.enhancement);
      if (Math.random() < rate) {
        set((s) => {
          const equipment = { ...s.player.equipment };
          equipment[slot] = { ...item, enhancement: item.enhancement + 1 };
          return { player: recomputePlayer({ ...s.player, equipment }) };
        });
        get().notify(`Success! ${item.name} → +${item.enhancement + 1}`, 'legendary', '🔨');
        if (item.enhancement + 1 >= 5) unlockAchievement('enhancer');
        if (item.enhancement + 1 >= 10) unlockAchievement('max_enhance');
      } else {
        get().notify(`Enhancement failed… the ${item.name} survived, at least.`, 'danger', '💥');
      }
      get().saveGame();
    },

    leaveShop: () => {
      set((s) => ({ ui: { ...s.ui, screen: 'board' } }));
      get().saveGame();
    },

    // ----- events -----

    chooseEventOption: (choiceIndex) => {
      const { event, player } = get();
      if (!event.active || event.resultText) return;
      const choice = event.active.choices[choiceIndex];
      if (!choice) return;
      if (choice.requirement) {
        if (choice.requirement.gold && player.gold < choice.requirement.gold) {
          get().notify('Not enough gold for that choice!', 'danger', '🪙');
          return;
        }
        if (choice.requirement.level && player.level < choice.requirement.level) {
          get().notify('Your level is too low!', 'danger');
          return;
        }
      }
      // weighted outcome roll
      const total = choice.outcomes.reduce((sum, o) => sum + o.weight, 0);
      let roll = Math.random() * total;
      let outcome = choice.outcomes[0];
      for (const o of choice.outcomes) {
        roll -= o.weight;
        if (roll <= 0) { outcome = o; break; }
      }
      applyEventOutcome(outcome);
      get().saveGame();
    },

    closeEvent: () => {
      const { event, board } = get();
      const pendingCombat = event.pendingCombat;
      const pendingTeleport = event.pendingTeleport;
      set(() => ({ event: initialEvent() }));

      const zone = zoneForTile(board.currentTile);
      const lapScale = board.lapCount;
      const levelRange: [number, number] = [
        zone.levelRange[0] + lapScale * 10,
        zone.levelRange[1] + lapScale * 10,
      ];

      if (pendingTeleport) {
        let target = Math.floor(Math.random() * 100);
        while (board.tiles[target].type === 'boss') target = Math.floor(Math.random() * 100);
        set((s) => ({
          board: {
            ...s.board, currentTile: target,
            visitedTiles: [...new Set([...s.board.visitedTiles, target])],
          },
        }));
        get().notify(`You emerge at tile ${target + 1}!`, 'info', '🌀');
      } else if (pendingCombat === 'zone') {
        get().startCombat(generateEnemy(zone.id, levelRange));
      } else if (pendingCombat === 'elite') {
        const elite = generateEnemy(zone.id, [levelRange[1], levelRange[1] + 2]);
        elite.name = `Elite ${elite.name.replace(/^Lv\.\d+ /, '')}`;
        elite.kind = 'elite';
        elite.goldReward = Math.round(elite.goldReward * 1.6);
        get().startCombat(elite);
      } else if (pendingCombat === 'dragon') {
        const dragon = generateEnemy(zone.id, [levelRange[1] + 3, levelRange[1] + 5]);
        dragon.name = 'Greedy Dragon';
        dragon.icon = '🐲';
        dragon.kind = 'dragon';
        dragon.goldReward = Math.round(dragon.goldReward * 3);
        dragon.expReward = Math.round(dragon.expReward * 2);
        get().startCombat(dragon);
      }
      get().saveGame();
    },

    // ----- meta -----

    buyUpgrade: (upgradeId) => {
      const def = META_UPGRADES.find((u) => u.id === upgradeId);
      if (!def) return;
      const rank = upgradeRank(upgradeId);
      if (rank >= def.maxRank) return;
      const cost = upgradeCost(def, rank);
      if (get().meta.soulCrystals < cost) {
        get().notify('Not enough Soul Crystals!', 'danger', '💠');
        return;
      }
      set((s) => ({
        meta: {
          ...s.meta,
          soulCrystals: s.meta.soulCrystals - cost,
          permanentUpgrades: { ...s.meta.permanentUpgrades, [upgradeId]: rank + 1 },
        },
      }));
      set((s) => ({ player: recomputePlayer(s.player) }));
      get().notify(`${def.name} → Rank ${rank + 1}!`, 'legendary', def.icon);
      persistMeta();
    },

    unlockAchievement,

    // ----- persistence -----

    saveGame: () => {
      const { player, board, meta } = get();
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, player, board, meta }));
      } catch { /* storage unavailable */ }
      persistMeta();
    },

    loadGame: () => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (data.version !== 2) return false;
        set(() => ({
          player: { ...basePlayer(), ...data.player },
          board: { ...data.board, isMoving: false },
          meta: { ...defaultMeta(), ...data.meta },
          combat: initialCombat(),
          shop: initialShop(),
          event: initialEvent(),
          ui: { ...initialUI(), screen: 'board' },
        }));
        get().notify('Adventure resumed!', 'success', '💾');
        return true;
      } catch {
        return false;
      }
    },

    hasSave: () => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        return JSON.parse(raw).version === 2;
      } catch { return false; }
    },
  };
});
