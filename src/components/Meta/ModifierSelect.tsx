import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { MODIFIERS } from '../../game/data/modifiers';
import type { RunModifierId } from '../../game/engine/types';

// ============================================================
// Run modifier picker — shown before starting a new run.
// ============================================================

export default function ModifierSelect({ onClose }: { onClose: () => void }) {
  const newGame = useGameStore((s) => s.newGame);
  const meta = useGameStore((s) => s.meta);
  const [selected, setSelected] = useState<RunModifierId>('none');
  const [ngPlus, setNgPlus] = useState(meta.ngPlusLevel > 0);

  const start = () => {
    newGame(selected, ngPlus ? Math.max(1, meta.ngPlusLevel) : 0);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl border border-amber-400/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
      >
        <h2 className="font-display text-center text-2xl font-bold text-amber-200">Choose Your Trial</h2>
        <p className="mt-1 text-center text-sm text-white/50">Each modifier reshapes the rules of the run.</p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MODIFIERS.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelected(mod.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                selected === mod.id
                  ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20'
                  : 'border-white/10 bg-black/40 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="text-xl">{mod.icon}</span>
                <span className={selected === mod.id ? 'text-amber-200' : 'text-white/85'}>{mod.name}</span>
              </div>
              <div className="mt-1 text-[11px] leading-snug text-white/55">{mod.description}</div>
              {mod.id !== 'none' && (
                <div className="mt-1.5 space-y-0.5 text-[11px]">
                  <div className="text-red-300/90">⚠ {mod.risk}</div>
                  <div className="text-emerald-300/90">✦ {mod.reward}</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {meta.ngPlusUnlocked && (
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 p-3 text-sm">
            <input
              type="checkbox"
              checked={ngPlus}
              onChange={(e) => setNgPlus(e.target.checked)}
              className="h-4 w-4 accent-violet-400"
            />
            <span className="font-bold text-violet-200">
              New Game+ {Math.max(1, meta.ngPlusLevel)}
            </span>
            <span className="text-white/50">— enemies +{Math.max(1, meta.ngPlusLevel) * 50}% stats, rewards ×{(1 + Math.max(1, meta.ngPlusLevel) * 0.5).toFixed(1)}</span>
          </label>
        )}

        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={start}
            className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-10 py-3 font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105"
          >
            ⚔️ Begin the Run
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-bold text-white/70 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
