import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { getSkill } from '../../game/data/skills';
import { StatBar } from '../UI/HUD';
import CharacterSprite, { spriteForClass, spriteIsStateful } from '../Character/CharacterSprite';

// ============================================================
// Turn-based battle screen. Emoji combatants for now —
// CharacterSprite SVGs replace them in the character phase.
// ============================================================

const spriteVariants: Variants = {
  idle: { x: 0, y: [0, -6, 0], rotate: 0, opacity: 1, filter: 'none', transition: { y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } } },
  attack: { x: 60, rotate: -8, transition: { duration: 0.22 } },
  skill: { y: -20, scale: 1.15, filter: 'drop-shadow(0 0 18px rgba(168,85,247,0.9))', transition: { duration: 0.3 } },
  hurt: { x: -24, filter: 'drop-shadow(0 0 12px rgba(239,68,68,1)) saturate(2)', transition: { duration: 0.15 } },
  death: { rotate: 90, y: 30, opacity: 0, transition: { duration: 0.7 } },
};

const enemySpriteVariants: Variants = {
  ...spriteVariants,
  attack: { x: -60, rotate: 8, transition: { duration: 0.22 } },
  hurt: { x: 24, filter: 'drop-shadow(0 0 12px rgba(239,68,68,1)) saturate(2)', transition: { duration: 0.15 } },
};

const LOG_COLORS: Record<string, string> = {
  player: 'text-emerald-300',
  enemy: 'text-red-300',
  system: 'text-white/60',
  reward: 'text-amber-300 font-semibold',
  critical: 'text-orange-400 font-bold',
};

const CLASS_BATTLE_ICONS: Record<string, string> = {
  novice: '🧑', warrior: '🤺', mage: '🧙', rogue: '🥷', cleric: '🧝',
};

function CombatLog() {
  const log = useGameStore((s) => s.combat.log);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [log]);

  return (
    <div ref={ref} className="h-28 overflow-y-auto rounded-xl border border-white/10 bg-black/50 p-3 text-sm">
      {log.map((entry) => (
        <div key={entry.id} className={LOG_COLORS[entry.tone]}>› {entry.text}</div>
      ))}
    </div>
  );
}

function SkillMenu({ onClose }: { onClose: () => void }) {
  const player = useGameStore((s) => s.player);
  const useSkillAction = useGameStore((s) => s.useSkill);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-purple-400/30 bg-slate-900/95 p-3 shadow-2xl backdrop-blur"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-purple-300">Skills</span>
        <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {player.skills.map((id) => {
          const skill = getSkill(id);
          const affordable = player.mp >= skill.mpCost;
          return (
            <button
              key={id}
              disabled={!affordable}
              onClick={() => { onClose(); void useSkillAction(id); }}
              className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-left transition-colors hover:border-purple-400/50 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-xl">{skill.icon}</span>
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-sm font-semibold">{skill.name}</span>
                  <span className={`text-xs ${affordable ? 'text-cyan-300' : 'text-red-400'}`}>{skill.mpCost} MP</span>
                </span>
                <span className="line-clamp-2 text-[11px] leading-tight text-white/50">{skill.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function OutcomeOverlay() {
  const outcome = useGameStore((s) => s.combat.outcome);
  const rewards = useGameStore((s) => s.combat.rewards);
  const closeCombat = useGameStore((s) => s.closeCombat);
  if (outcome === 'ongoing') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/80 backdrop-blur-sm"
    >
      {outcome === 'victory' && (
        <>
          <motion.div
            initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 15 }}
            className="font-display text-5xl font-black text-transparent bg-gradient-to-b from-yellow-200 to-amber-500 bg-clip-text"
          >
            VICTORY!
          </motion.div>
          {rewards && (
            <div className="flex flex-col items-center gap-1 text-lg">
              <span className="text-amber-300">✨ +{rewards.exp} EXP</span>
              <span className="text-yellow-300">🪙 +{rewards.gold} Gold</span>
              {rewards.items.map((item) => (
                <span key={item.id} className="text-purple-300">{item.icon} {item.name}</span>
              ))}
            </div>
          )}
        </>
      )}
      {outcome === 'defeat' && (
        <motion.div
          initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="font-display text-5xl font-black text-red-500"
        >
          DEFEATED…
        </motion.div>
      )}
      {outcome === 'fled' && (
        <div className="font-display text-4xl font-bold text-sky-300">You escaped!</div>
      )}
      <button
        onClick={closeCombat}
        className="mt-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-8 py-3 font-bold text-slate-900 shadow-lg transition-transform hover:scale-105"
      >
        Continue
      </button>
    </motion.div>
  );
}

export default function BattleScreen() {
  const player = useGameStore((s) => s.player);
  const combat = useGameStore((s) => s.combat);
  const playerAttack = useGameStore((s) => s.playerAttack);
  const guard = useGameStore((s) => s.guard);
  const tryRun = useGameStore((s) => s.tryRun);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [shaking, setShaking] = useState(false);

  // screen shake when either side takes a hit
  useEffect(() => {
    if (combat.playerAnimation === 'hurt' || combat.enemyAnimation === 'hurt') {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(t);
    }
  }, [combat.playerAnimation, combat.enemyAnimation]);

  if (!combat.enemy) return null;
  const enemy = combat.enemy;
  const canAct = combat.playerTurn && combat.outcome === 'ongoing';

  return (
    <div className={`relative mx-auto w-full max-w-3xl ${shaking ? 'animate-screen-shake' : ''}`}>
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl">

        {/* status bars */}
        <div className="mb-6 grid grid-cols-2 gap-8">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-300">
              {player.name} <span className="text-white/40">Lv.{player.level}</span>
              {player.statuses.map((st) => (
                <span key={st.id} title={st.id} className="text-xs">{st.id === 'poison' ? '☠️' : st.id === 'burn' ? '🔥' : st.id === 'freeze' ? '🧊' : '💫'}</span>
              ))}
            </div>
            <StatBar label="HP" value={player.hp} max={player.maxHp} gradient="from-red-500 to-rose-400" />
            <div className="mt-1">
              <StatBar label="MP" value={player.mp} max={player.maxMp} gradient="from-blue-500 to-cyan-400" small />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-end gap-2 text-sm font-bold text-red-300">
              {enemy.statuses.map((st) => (
                <span key={st.id} title={st.id} className="text-xs">{st.id === 'poison' ? '☠️' : st.id === 'burn' ? '🔥' : st.id === 'freeze' ? '🧊' : '💫'}</span>
              ))}
              {enemy.isBoss && <span>👑</span>} {enemy.name}
            </div>
            <StatBar label="HP" value={enemy.hp} max={enemy.maxHp} gradient="from-red-600 to-orange-500" />
            {enemy.weakness && (
              <div className="mt-1 text-right text-[11px] text-orange-300">
                Weak to <span className="font-bold uppercase">{enemy.weakness}</span> (+50% dmg)
              </div>
            )}
          </div>
        </div>

        {/* battle stage */}
        <div className="mb-6 flex h-40 items-center justify-between px-10">
          <motion.div
            // stateful sprites animate their own combat states — don't double-move them
            variants={spriteIsStateful(player.classId) ? undefined : spriteVariants}
            animate={combat.playerAnimation}
            className={spriteForClass(player.classId) ? '' : 'text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]'}
          >
            {spriteForClass(player.classId)
              ? <CharacterSprite classId={player.classId} animation={combat.playerAnimation} height={150} />
              : (CLASS_BATTLE_ICONS[player.classId] ?? '🧑')}
          </motion.div>
          <div className="font-display text-2xl font-bold text-white/20">VS</div>
          <motion.div
            variants={enemySpriteVariants}
            animate={combat.enemyAnimation}
            className={`drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] ${enemy.isBoss ? 'text-8xl' : 'text-7xl'}`}
            style={{ transform: 'scaleX(-1)' }}
          >
            {enemy.icon}
          </motion.div>
        </div>

        {/* actions */}
        <div className="relative mb-4">
          <AnimatePresence>
            {skillsOpen && <SkillMenu onClose={() => setSkillsOpen(false)} />}
          </AnimatePresence>
          <div className="grid grid-cols-4 gap-2">
            <button
              disabled={!canAct}
              onClick={() => void playerAttack()}
              className="rounded-xl border border-red-400/40 bg-red-500/15 py-3 font-bold text-red-200 transition-all hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-35"
            >
              ⚔️ Attack
            </button>
            <button
              disabled={!canAct}
              onClick={() => setSkillsOpen((v) => !v)}
              className="rounded-xl border border-purple-400/40 bg-purple-500/15 py-3 font-bold text-purple-200 transition-all hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-35"
            >
              ✨ Skills
            </button>
            <button
              disabled={!canAct}
              onClick={() => void guard()}
              className="rounded-xl border border-sky-400/40 bg-sky-500/15 py-3 font-bold text-sky-200 transition-all hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-35"
            >
              🛡️ Guard
            </button>
            <button
              disabled={!canAct || enemy.isBoss}
              onClick={() => void tryRun()}
              className="rounded-xl border border-white/20 bg-white/5 py-3 font-bold text-white/70 transition-all hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
            >
              🏃 Run
            </button>
          </div>
          {!canAct && combat.outcome === 'ongoing' && (
            <div className="mt-2 text-center text-sm text-white/40">Enemy is acting…</div>
          )}
        </div>

        <CombatLog />
        <OutcomeOverlay />
      </div>
    </div>
  );
}
