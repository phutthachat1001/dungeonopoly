import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import ModifierSelect from '../Meta/ModifierSelect';

// ============================================================
// Title + Game Over + Victory screens
// ============================================================

export function TitleScreen() {
  const loadGame = useGameStore((s) => s.loadGame);
  const hasSave = useGameStore((s) => s.hasSave);
  const openMeta = useGameStore((s) => s.openMeta);
  const soulCrystals = useGameStore((s) => s.meta.soulCrystals);
  const [choosingModifier, setChoosingModifier] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="mb-4 text-6xl">🎲⚔️🏰</div>
        <h1 className="font-display text-6xl font-black tracking-wider text-transparent bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-600 bg-clip-text drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
          DUNGEONOPOLY
        </h1>
        <p className="mt-3 text-lg text-white/60">A Roguelike RPG Dice Board Adventure</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col gap-3"
      >
        <button
          onClick={() => setChoosingModifier(true)}
          className="w-64 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 py-4 text-lg font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-400/50"
        >
          ⚔️ New Adventure
        </button>
        {hasSave() && (
          <button
            onClick={() => loadGame()}
            className="w-64 rounded-xl border border-white/20 bg-white/5 py-4 text-lg font-bold text-white/80 transition-all hover:scale-105 hover:bg-white/10"
          >
            💾 Continue
          </button>
        )}
        <button
          onClick={() => openMeta('title')}
          className="w-64 rounded-xl border border-violet-400/30 bg-violet-500/10 py-4 text-lg font-bold text-violet-200 transition-all hover:scale-105 hover:bg-violet-500/20"
        >
          💠 Soul Sanctum <span className="text-sm font-normal text-white/50">({soulCrystals})</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex gap-6 text-sm text-white/40"
      >
        <span>🌿 5 Zones</span>
        <span>🧙 21 Classes</span>
        <span>🎲 100 Tiles</span>
        <span>💠 Meta Progression</span>
      </motion.div>

      <AnimatePresence>
        {choosingModifier && <ModifierSelect onClose={() => setChoosingModifier(false)} />}
      </AnimatePresence>
    </div>
  );
}

function RunStats() {
  const meta = useGameStore((s) => s.meta);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-3 gap-4 text-center"
    >
      <div className="rounded-xl border border-white/10 bg-slate-900/80 px-6 py-4">
        <div className="text-2xl">👣</div>
        <div className="text-xl font-bold">{meta.tilesWalked}</div>
        <div className="text-xs text-white/50">Tiles Walked</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/80 px-6 py-4">
        <div className="text-2xl">⚔️</div>
        <div className="text-xl font-bold">{meta.monstersKilled}</div>
        <div className="text-xs text-white/50">Monsters Slain</div>
      </div>
      <div className="rounded-xl border border-violet-400/40 bg-violet-950/80 px-6 py-4">
        <div className="text-2xl">💠</div>
        <div className="text-xl font-bold text-violet-300">{meta.soulCrystals}</div>
        <div className="text-xs text-white/50">Soul Crystals</div>
      </div>
    </motion.div>
  );
}

export function GameOverScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const openMeta = useGameStore((s) => s.openMeta);
  const [choosingModifier, setChoosingModifier] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <motion.div
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="mb-4 text-6xl">💀</div>
        <h1 className="font-display text-5xl font-black text-red-500">YOU HAVE FALLEN</h1>
        <p className="mt-2 text-white/60">But death is not the end… your soul grows stronger.</p>
      </motion.div>

      <RunStats />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3"
      >
        <button
          onClick={() => setChoosingModifier(true)}
          className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-8 py-3 font-bold text-slate-900 shadow-lg transition-transform hover:scale-105"
        >
          🔄 New Run
        </button>
        <button
          onClick={() => openMeta('gameover')}
          className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-8 py-3 font-bold text-violet-200 transition-transform hover:scale-105"
        >
          💠 Spend Crystals
        </button>
        <button
          onClick={() => setScreen('title')}
          className="rounded-xl border border-white/20 bg-white/5 px-8 py-3 font-bold text-white/70 transition-transform hover:scale-105"
        >
          🏠 Title
        </button>
      </motion.div>

      <AnimatePresence>
        {choosingModifier && <ModifierSelect onClose={() => setChoosingModifier(false)} />}
      </AnimatePresence>
    </div>
  );
}

export function VictoryScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const openMeta = useGameStore((s) => s.openMeta);
  const [choosingModifier, setChoosingModifier] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        className="text-center"
      >
        <div className="mb-4 text-6xl">👑✨🏆</div>
        <h1 className="font-display text-5xl font-black text-transparent bg-gradient-to-b from-yellow-200 to-amber-500 bg-clip-text drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
          THE DEMON LORD FALLS!
        </h1>
        <p className="mt-2 text-white/60">The realm is saved. Your legend echoes through all five zones.</p>
        <p className="mt-1 text-sm font-bold text-violet-300">✨ New Game+ unlocked — enemies grow stronger, and so do the rewards.</p>
      </motion.div>

      <RunStats />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3"
      >
        <button
          onClick={() => setChoosingModifier(true)}
          className="rounded-xl bg-gradient-to-b from-violet-400 to-violet-600 px-8 py-3 font-bold text-white shadow-lg shadow-violet-500/30 transition-transform hover:scale-105"
        >
          ⚡ New Game+
        </button>
        <button
          onClick={() => openMeta('victory')}
          className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-8 py-3 font-bold text-violet-200 transition-transform hover:scale-105"
        >
          💠 Spend Crystals
        </button>
        <button
          onClick={() => setScreen('title')}
          className="rounded-xl border border-white/20 bg-white/5 px-8 py-3 font-bold text-white/70 transition-transform hover:scale-105"
        >
          🏠 Title
        </button>
      </motion.div>

      <AnimatePresence>
        {choosingModifier && <ModifierSelect onClose={() => setChoosingModifier(false)} />}
      </AnimatePresence>
    </div>
  );
}
