import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { CLASSES, evolutionOptions, getClass } from '../../game/data/classes';
import { getSkill } from '../../game/data/skills';
import type { ClassDef, ClassId } from '../../game/engine/types';

// ============================================================
// Class tree: Novice → 4 base (Lv.10) → 8 Tier2 (Lv.35) → 8 Tier3 (Lv.70)
// ============================================================

const CLASS_ICONS: Record<string, string> = {
  novice: '🧑', warrior: '⚔️', mage: '🧙', rogue: '🗡️', cleric: '✨',
  knight: '🛡️', berserker: '🪓', sorcerer: '🔮', battlemage: '🌟',
  assassin: '👤', ranger: '🏹', priest: '🙏', paladin: '⚜️',
  guardian: '🏰', warlord: '👑', archmage: '☄️', spellblade: '💫',
  shadowlord: '🌑', windwalker: '🌪️', saint: '😇', crusader: '✝️',
};

/** rows of the tree, grouped by lineage */
const LINEAGES: ClassId[][] = [
  ['warrior', 'knight', 'guardian'],
  ['warrior', 'berserker', 'warlord'],
  ['mage', 'sorcerer', 'archmage'],
  ['mage', 'battlemage', 'spellblade'],
  ['rogue', 'assassin', 'shadowlord'],
  ['rogue', 'ranger', 'windwalker'],
  ['cleric', 'priest', 'saint'],
  ['cleric', 'paladin', 'crusader'],
];

type NodeState = 'current' | 'available' | 'onPath' | 'locked';

function classNodeState(cls: ClassDef, currentClass: ClassId, level: number, availableIds: string[]): NodeState {
  if (cls.id === currentClass) return 'current';
  if (availableIds.includes(cls.id) && level >= cls.unlockLevel) return 'available';
  // is it on the player's current lineage history?
  let walk: ClassId | null = currentClass;
  while (walk) {
    if (walk === cls.id) return 'onPath';
    walk = getClass(walk).parent;
  }
  return 'locked';
}

const NODE_STYLES: Record<NodeState, string> = {
  current: 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/30 text-amber-200',
  available: 'border-emerald-400 bg-emerald-500/15 shadow-lg shadow-emerald-500/30 animate-pulse-glow cursor-pointer hover:scale-105',
  onPath: 'border-white/30 bg-white/5 text-white/70',
  locked: 'border-white/10 bg-black/40 text-white/25 grayscale',
};

function ClassNode({
  cls, state, onSelect, onHover,
}: {
  cls: ClassDef; state: NodeState;
  onSelect: (c: ClassDef) => void; onHover: (c: ClassDef | null) => void;
}) {
  return (
    <button
      onClick={() => state === 'available' && onSelect(cls)}
      onMouseEnter={() => onHover(cls)}
      onMouseLeave={() => onHover(null)}
      className={`relative flex w-32 flex-col items-center gap-0.5 rounded-xl border-2 px-2 py-2 transition-all ${NODE_STYLES[state]}`}
    >
      <span className="text-2xl">{state === 'locked' ? '🔒' : CLASS_ICONS[cls.id]}</span>
      <span className="text-xs font-bold">{cls.name}</span>
      <span className="text-[10px] opacity-60">Lv.{cls.unlockLevel}+</span>
      {state === 'current' && (
        <span className="absolute -top-2 rounded-full bg-amber-400 px-2 text-[9px] font-black text-slate-900">YOU</span>
      )}
      {state === 'available' && (
        <span className="absolute -top-2 rounded-full bg-emerald-400 px-2 text-[9px] font-black text-slate-900">CHOOSE</span>
      )}
    </button>
  );
}

function StatPreview({ cls }: { cls: ClassDef }) {
  const m = cls.statMultipliers;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/15 bg-slate-900/95 p-4 shadow-2xl"
    >
      <div className="flex items-center gap-2 text-lg font-bold text-amber-200">
        {CLASS_ICONS[cls.id]} {cls.name}
        <span className="text-xs font-normal text-white/40">Tier {cls.tier} · Lv.{cls.unlockLevel}+</span>
      </div>
      <p className="mt-1 text-sm text-white/60">{cls.description}</p>
      <div className="mt-2 grid grid-cols-6 gap-1 text-center text-[11px]">
        {([['ATK', m.atk], ['DEF', m.def], ['SPD', m.spd], ['INT', m.int], ['WIS', m.wis], ['DEX', m.dex]] as const).map(([label, v]) => (
          <div key={label} className="rounded bg-black/40 py-1">
            <div className="text-white/40">{label}</div>
            <div className={v >= 1.3 ? 'font-bold text-emerald-400' : v <= 0.8 ? 'text-red-400' : 'text-white/80'}>
              ×{v.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cls.skillIds.map((id) => {
          const skill = getSkill(id);
          return (
            <span key={id} title={skill.description} className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2 py-0.5 text-[11px] text-purple-200">
              {skill.icon} {skill.name}
            </span>
          );
        })}
      </div>
      <div className="mt-2 text-[11px] text-white/40">
        HP +{cls.hpPerLevel}/lv · MP +{cls.mpPerLevel}/lv · Weapons: {cls.allowedWeapons.join(', ')}
      </div>
    </motion.div>
  );
}

export default function ClassSelector() {
  const player = useGameStore((s) => s.player);
  const changeClass = useGameStore((s) => s.changeClass);
  const canChange = useGameStore((s) => s.canChangeClass)();
  const setScreen = useGameStore((s) => s.setScreen);
  const [hovered, setHovered] = useState<ClassDef | null>(null);
  const [confirming, setConfirming] = useState<ClassDef | null>(null);

  const availableIds = canChange ? evolutionOptions(player.classId).map((c) => c.id) : [];
  const nodeState = (id: ClassId) => classNodeState(CLASSES[id], player.classId, player.level, availableIds);

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-amber-200">🌟 Class Tree</h2>
        <button
          onClick={() => setScreen('board')}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
        >
          ← Back to Board
        </button>
      </div>

      <div className="mb-3 text-sm text-white/60">
        Class changes unlock at <b className="text-amber-300">Lv.10</b>, <b className="text-amber-300">Lv.35</b> and{' '}
        <b className="text-amber-300">Lv.70</b>. You are <b className="text-white">Lv.{player.level}</b>
        {canChange
          ? <span className="ml-1 font-bold text-emerald-400">— a new path is open!</span>
          : <span className="ml-1">— keep adventuring to unlock the next tier.</span>}
      </div>

      <div className="flex gap-6 rounded-2xl border border-white/10 bg-black/40 p-5">
        {/* Novice column */}
        <div className="flex flex-col justify-center">
          <ClassNode cls={CLASSES.novice} state={nodeState('novice')} onSelect={setConfirming} onHover={setHovered} />
        </div>

        {/* connector */}
        <div className="flex flex-col justify-center text-white/20">➤</div>

        {/* lineage rows */}
        <div className="flex flex-1 flex-col gap-2">
          {LINEAGES.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              {row.map((id, col) => (
                <div key={id} className="flex items-center gap-2">
                  {col > 0 && <span className="text-white/20">→</span>}
                  {/* base classes span two rows visually — only render on even rows */}
                  {col === 0 && i % 2 === 1 ? (
                    <div className="w-32 opacity-0" />
                  ) : (
                    <ClassNode cls={CLASSES[id]} state={nodeState(id)} onSelect={setConfirming} onHover={setHovered} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* hover preview */}
      <div className="mt-4 min-h-[150px]">
        <AnimatePresence mode="wait">
          {hovered && <StatPreview key={hovered.id} cls={hovered} />}
        </AnimatePresence>
      </div>

      {/* confirm dialog */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-slate-900 p-6 text-center shadow-2xl"
            >
              <div className="text-5xl">{CLASS_ICONS[confirming.id]}</div>
              <h3 className="mt-2 font-display text-2xl font-bold text-amber-200">
                Become a {confirming.name}?
              </h3>
              <p className="mt-1 text-sm text-white/60">{confirming.description}</p>
              <p className="mt-3 text-xs text-red-300/80">
                ⚠️ Class changes are permanent — you cannot return to a previous class this run.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => {
                    changeClass(confirming.id);
                    setConfirming(null);
                    setScreen('board');
                  }}
                  className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-6 py-2.5 font-bold text-slate-900 shadow-lg transition-transform hover:scale-105"
                >
                  ⚔️ Embrace the Path
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  className="rounded-xl border border-white/20 bg-white/5 px-6 py-2.5 font-bold text-white/70 hover:bg-white/10"
                >
                  Not Yet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
