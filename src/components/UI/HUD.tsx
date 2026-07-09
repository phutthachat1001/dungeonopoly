import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { getClass } from '../../game/data/classes';
import { expToNext } from '../../game/engine/formulas';
import { getRelic } from '../../game/data/relics';
import { getModifier } from '../../game/data/modifiers';

// ============================================================
// HUD — player panel, notifications, level-up overlay
// ============================================================

export function StatBar({
  label, value, max, gradient, small,
}: {
  label: string; value: number; max: number; gradient: string; small?: boolean;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div>
      <div className={`flex justify-between ${small ? 'text-[10px]' : 'text-xs'} font-semibold text-white/70`}>
        <span>{label}</span>
        <span>{Math.round(value)} / {max}</span>
      </div>
      <div className={`${small ? 'h-1.5' : 'h-2.5'} overflow-hidden rounded-full bg-black/50`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

const CLASS_ICONS: Record<string, string> = {
  novice: '🧑', warrior: '⚔️', mage: '🧙', rogue: '🗡️', cleric: '✨',
  knight: '🛡️', berserker: '🪓', sorcerer: '🔮', battlemage: '🌟',
  assassin: '👤', ranger: '🏹', priest: '🙏', paladin: '⚜️',
  guardian: '🏰', warlord: '👑', archmage: '☄️', spellblade: '💫',
  shadowlord: '🌑', windwalker: '🌪️', saint: '😇', crusader: '✝️',
};

export function PlayerPanel() {
  const player = useGameStore((s) => s.player);
  const meta = useGameStore((s) => s.meta);
  const lapCount = useGameStore((s) => s.board.lapCount);
  const cls = getClass(player.classId);

  return (
    <div className="w-64 space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur">
      {/* identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-b from-slate-700 to-slate-800 text-2xl">
          {CLASS_ICONS[player.classId] ?? '🧑'}
        </div>
        <div>
          <div className="font-display font-bold text-amber-200">{cls.name}</div>
          <div className="text-xs text-white/60">Level {player.level}</div>
        </div>
      </div>

      {/* bars */}
      <StatBar label="HP" value={player.hp} max={player.maxHp} gradient="from-red-500 to-rose-400" />
      <StatBar label="MP" value={player.mp} max={player.maxMp} gradient="from-blue-500 to-cyan-400" />
      <StatBar label="EXP" value={player.exp} max={expToNext(player.level)} gradient="from-amber-500 to-yellow-300" small />

      {/* currencies */}
      <div className="flex justify-between rounded-lg bg-black/30 px-3 py-2 text-sm">
        <span className="font-semibold text-amber-300">🪙 {player.gold.toLocaleString()}</span>
        <span className="font-semibold text-violet-300">💠 {meta.soulCrystals}</span>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
        {([
          ['ATK', player.stats.atk, 'text-red-300'],
          ['DEF', player.stats.def, 'text-sky-300'],
          ['SPD', player.stats.spd, 'text-emerald-300'],
          ['INT', player.stats.int, 'text-purple-300'],
          ['WIS', player.stats.wis, 'text-yellow-200'],
          ['DEX', player.stats.dex, 'text-orange-300'],
        ] as const).map(([label, value, color]) => (
          <div key={label} className="rounded-md bg-black/30 py-1.5">
            <div className="text-[10px] text-white/40">{label}</div>
            <div className={`font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* relics */}
      {meta.relics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {meta.relics.map((id) => {
            const relic = getRelic(id);
            return (
              <span
                key={id}
                title={`${relic.name} — ${relic.description}`}
                className="flex h-7 w-7 cursor-help items-center justify-center rounded-lg border border-violet-400/40 bg-violet-500/15 text-sm"
              >
                {relic.icon}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex justify-between text-[11px] text-white/40">
        <span title={getModifier(meta.runModifier).name}>
          {getModifier(meta.runModifier).icon} Run #{meta.runCount}{meta.ngPlusLevel > 0 ? ` · NG+${meta.ngPlusLevel}` : ''}
        </span>
        <span>Lap {lapCount + 1}</span>
        <span>Kills: {meta.monstersKilled}</span>
      </div>
    </div>
  );
}

export function ActionBar({ onOpenInventory }: { onOpenInventory: () => void }) {
  const setScreen = useGameStore((s) => s.setScreen);
  const openMeta = useGameStore((s) => s.openMeta);
  const canChange = useGameStore((s) => s.canChangeClass)();
  const bagCount = useGameStore((s) => s.player.inventory.length);

  return (
    <div className="flex w-64 gap-2">
      <button
        onClick={onOpenInventory}
        className="relative flex-1 rounded-xl border border-white/15 bg-slate-900/80 py-2.5 text-sm font-bold text-white/80 backdrop-blur transition-colors hover:bg-white/10"
      >
        🎒 Bag
        {bagCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-900">
            {bagCount}
          </span>
        )}
      </button>
      <button
        onClick={() => setScreen('classSelect')}
        className={`flex-1 rounded-xl border py-2.5 text-sm font-bold backdrop-blur transition-colors ${
          canChange
            ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200 animate-pulse-glow'
            : 'border-white/15 bg-slate-900/80 text-white/80 hover:bg-white/10'
        }`}
      >
        🌟 Class
      </button>
      <button
        onClick={() => openMeta('board')}
        className="flex-1 rounded-xl border border-violet-400/30 bg-violet-500/10 py-2.5 text-sm font-bold text-violet-200 backdrop-blur transition-colors hover:bg-violet-500/20"
      >
        💠 Souls
      </button>
    </div>
  );
}

const TONE_STYLES: Record<string, string> = {
  info: 'border-sky-400/40 bg-sky-950/90',
  success: 'border-emerald-400/40 bg-emerald-950/90',
  danger: 'border-red-400/50 bg-red-950/90',
  legendary: 'border-amber-400/60 bg-gradient-to-r from-amber-950/95 to-orange-950/95',
};

export function Notifications() {
  const notifications = useGameStore((s) => s.ui.notifications);
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur ${TONE_STYLES[n.tone]}`}
          >
            {n.icon && <span className="text-lg">{n.icon}</span>}
            <span>{n.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function LevelUpOverlay() {
  const show = useGameStore((s) => s.ui.showLevelUp);
  const data = useGameStore((s) => s.ui.levelUpData);
  const dismiss = useGameStore((s) => s.dismissLevelUp);

  return (
    <AnimatePresence>
      {show && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="font-display text-6xl font-black text-transparent bg-gradient-to-b from-yellow-200 to-amber-500 bg-clip-text drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]"
          >
            LEVEL UP!
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-2xl font-bold text-white"
          >
            Level {data.newLevel}
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 flex gap-3"
          >
            {Object.entries(data.statGains).filter(([, v]) => (v ?? 0) > 0).map(([stat, gain]) => (
              <div key={stat} className="rounded-lg border border-amber-400/30 bg-slate-900/80 px-3 py-2 text-center">
                <div className="text-[10px] uppercase text-white/50">{stat}</div>
                <div className="font-bold text-emerald-400">+{gain}</div>
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-sm text-white/50"
          >
            HP &amp; MP fully restored — click to continue
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
