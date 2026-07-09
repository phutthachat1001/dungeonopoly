// ============================================================
// DUNGEONOPOLY — Core type definitions
// ============================================================

// ---------- Stats ----------

export interface Stats {
  atk: number;
  def: number;
  spd: number;
  int: number;
  wis: number;
  dex: number;
}

export type StatKey = keyof Stats;

// ---------- Classes ----------

export type BaseClassId = 'warrior' | 'mage' | 'rogue' | 'cleric';

export type Tier2ClassId =
  | 'knight' | 'berserker'          // warrior
  | 'sorcerer' | 'battlemage'       // mage
  | 'assassin' | 'ranger'           // rogue
  | 'priest' | 'paladin';           // cleric

export type Tier3ClassId =
  | 'guardian' | 'warlord'          // knight / berserker
  | 'archmage' | 'spellblade'       // sorcerer / battlemage
  | 'shadowlord' | 'windwalker'     // assassin / ranger
  | 'saint' | 'crusader';           // priest / paladin

export type ClassId = 'novice' | BaseClassId | Tier2ClassId | Tier3ClassId;

export type ClassTier = 0 | 1 | 2 | 3;

export interface ClassDef {
  id: ClassId;
  name: string;
  tier: ClassTier;
  description: string;
  /** Class this evolves from (null for novice/base picks) */
  parent: ClassId | null;
  /** Level at which this class becomes available (1 / 10 / 35 / 70) */
  unlockLevel: number;
  /** Multipliers applied to base stat growth */
  statMultipliers: Stats;
  /** HP/MP growth per level */
  hpPerLevel: number;
  mpPerLevel: number;
  skillIds: string[];
  /** Which equipment weapon kinds this class can use */
  allowedWeapons: WeaponKind[];
}

// ---------- Skills ----------

export type ElementType = 'physical' | 'fire' | 'ice' | 'holy' | 'dark' | 'nature';

export type SkillEffectKind =
  | 'damage'        // deal damage (multiplier on ATK or INT)
  | 'heal'          // restore HP (multiplier on WIS)
  | 'buff'          // temporary stat up
  | 'debuff'        // temporary enemy stat down
  | 'status';       // apply status effect

export interface SkillDef {
  id: string;
  name: string;
  icon: string;               // emoji for now
  description: string;
  mpCost: number;
  kind: SkillEffectKind;
  element: ElementType;
  /** damage/heal multiplier, or buff amount as fraction (0.2 = +20%) */
  power: number;
  /** 'atk' scaling = physical, 'int' = magic, 'wis' = healing */
  scaling: 'atk' | 'int' | 'wis';
  /** stat affected for buff/debuff */
  targetStat?: StatKey;
  /** turns a buff/debuff/status lasts */
  duration?: number;
  status?: StatusEffectId;
  /** chance 0-1 to apply status */
  statusChance?: number;
}

export type StatusEffectId = 'poison' | 'burn' | 'freeze' | 'stun' | 'blind' | 'regen' | 'shield';

export interface ActiveStatus {
  id: StatusEffectId;
  turnsLeft: number;
  /** magnitude, meaning depends on the status */
  power: number;
}

export interface ActiveBuff {
  stat: StatKey;
  /** fraction, e.g. +0.2 = +20% */
  amount: number;
  turnsLeft: number;
}

// ---------- Items & Equipment ----------

export type EquipSlot = 'weapon' | 'armor' | 'helmet' | 'pants' | 'boots' | 'accessory';
export type WeaponKind = 'sword' | 'staff' | 'dagger' | 'mace' | 'bow' | 'any';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  name: string;
  icon: string;
  slot: EquipSlot;
  weaponKind?: WeaponKind;
  rarity: Rarity;
  level: number;
  stats: Partial<Stats>;
  hpBonus?: number;
  mpBonus?: number;
  /** enhancement level +0 .. +15 */
  enhancement: number;
  price: number;
}

export interface Consumable {
  id: string;
  name: string;
  icon: string;
  description: string;
  effect: { hp?: number; mp?: number; cureStatus?: boolean };
  price: number;
}

// ---------- Player ----------

export type Equipment = Record<EquipSlot, Item | null>;

export interface Player {
  name: string;
  classId: ClassId;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  stats: Stats;
  equipment: Equipment;
  skills: string[];              // skill ids known
  inventory: Item[];
  consumables: Consumable[];
  buffs: ActiveBuff[];
  statuses: ActiveStatus[];
  critRate: number;              // 0-1
  critDamage: number;            // percent, 150 = 1.5x
  /** permanent bonuses gained from events (soul merchant etc.) */
  bonusStats: Partial<Stats>;
  bonusMaxHp: number;
  bonusMaxMp: number;
}

// ---------- Board ----------

export type TileType =
  | 'monster' | 'dungeon' | 'shop' | 'event' | 'heal' | 'curse'
  | 'treasure' | 'portal' | 'arena' | 'quest' | 'upgrade' | 'boss'
  | 'start';

export interface Tile {
  index: number;                 // 0-99
  type: TileType;
  zone: ZoneId;
}

export type ZoneId = 1 | 2 | 3 | 4 | 5;

export interface ZoneDef {
  id: ZoneId;
  name: string;
  tileRange: [number, number];   // inclusive, 0-indexed
  levelRange: [number, number];
  /** tailwind-ish colors used by the board */
  colors: { bg: string; border: string; glow: string; text: string };
  icon: string;
}

export interface BoardState {
  currentTile: number;
  totalTiles: number;
  tiles: Tile[];
  visitedTiles: number[];
  lastRoll: number | null;
  isMoving: boolean;
  lapCount: number;
}

// ---------- Combat ----------

export interface Enemy {
  id: string;
  name: string;
  icon: string;
  level: number;
  hp: number;
  maxHp: number;
  stats: Stats;
  element: ElementType;
  weakness: ElementType | null;
  expReward: number;
  goldReward: number;
  isBoss: boolean;
  kind?: 'elite' | 'champion' | 'dragon';
  skills: string[];
  statuses: ActiveStatus[];
  buffs: ActiveBuff[];
}

export interface CombatLogEntry {
  id: number;
  text: string;
  tone: 'player' | 'enemy' | 'system' | 'reward' | 'critical';
}

export interface CombatState {
  active: boolean;
  enemy: Enemy | null;
  playerTurn: boolean;
  turnCount: number;
  log: CombatLogEntry[];
  playerAnimation: SpriteAnimation;
  enemyAnimation: SpriteAnimation;
  outcome: 'ongoing' | 'victory' | 'defeat' | 'fled';
  rewards: { exp: number; gold: number; items: Item[] } | null;
  guarding: boolean;
}

export type SpriteAnimation = 'idle' | 'attack' | 'hurt' | 'death' | 'skill';

// ---------- Meta / Roguelike ----------

export type RunModifierId = 'none' | 'cursed' | 'speed' | 'pacifist' | 'ironman' | 'chaos';

export interface RelicDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface MetaState {
  soulCrystals: number;
  achievements: string[];         // unlocked ids
  unlockedClasses: ClassId[];
  runCount: number;
  runModifier: RunModifierId;
  relics: string[];               // relic ids held this run
  permanentUpgrades: Record<string, number>;  // upgradeId -> rank
  ngPlusLevel: number;
  ngPlusUnlocked: boolean;
  /** lifetime + run-scoped counters (run-scoped keys start with "run_") */
  counters: Record<string, number>;
  // run stats for soul crystal payout
  tilesWalked: number;
  monstersKilled: number;
}

// ---------- Events ----------

export interface EventOutcome {
  weight: number;
  text: string;
  gold?: number;                 // scaled by zone, may be negative
  goldPct?: number;              // fraction of current gold (negative = lose)
  exp?: number;                  // scaled by zone
  hpPct?: number;                // fraction of maxHp (+heal / -damage)
  mpPct?: number;
  fullHeal?: boolean;
  itemLuck?: number;             // grant item with this luck bonus
  relic?: boolean;
  buff?: { stat: StatKey; amount: number; turns: number };
  maxHpPct?: number;             // permanent max HP change (fraction)
  bonusStat?: { stat: StatKey; amount: number };  // permanent stat gain
  teleport?: boolean;
  combat?: 'zone' | 'elite' | 'dragon';
  enhance?: boolean;             // +1 to a random equipped item
  achievement?: string;
}

export interface EventChoice {
  text: string;
  requirement?: { gold?: number; level?: number };
  outcomes: EventOutcome[];      // weighted roll
}

export interface GameEvent {
  id: string;
  name: string;
  icon: string;
  description: string;
  choices: EventChoice[];
}

// ---------- UI ----------

export type Screen =
  | 'title' | 'board' | 'combat' | 'shop' | 'dungeon'
  | 'classSelect' | 'event' | 'meta' | 'gameover' | 'victory';

export interface Notification {
  id: number;
  text: string;
  icon?: string;
  tone: 'info' | 'success' | 'danger' | 'legendary';
}

export interface UIState {
  screen: Screen;
  returnScreen: Screen;          // where "back" leads from meta/class screens
  notifications: Notification[];
  showLevelUp: boolean;
  levelUpData: { newLevel: number; statGains: Partial<Stats> } | null;
}

// ---------- Shop / Event runtime state ----------

export interface ShopState {
  stock: Item[];
}

export interface EventRuntime {
  active: GameEvent | null;
  /** resolved outcome text shown after a choice, null while choosing */
  resultText: string | null;
}
