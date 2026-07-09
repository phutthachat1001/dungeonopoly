import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { META_UPGRADES, upgradeCost } from '../../game/data/metaUpgrades';
import { ACHIEVEMENTS } from '../../game/data/achievements';
import { RELICS } from '../../game/data/relics';

// ============================================================
// Soul Sanctum — permanent upgrades, achievements, relics.
// ============================================================

function UpgradesTab() {
  const meta = useGameStore((s) => s.meta);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {META_UPGRADES.map((def) => {
        const rank = meta.permanentUpgrades[def.id] ?? 0;
        const maxed = rank >= def.maxRank;
        const cost = upgradeCost(def, rank);
        return (
          <div key={def.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
            <span className="text-2xl">{def.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white/90">{def.name}</div>
              <div className="text-[11px] text-white/50">{def.description}</div>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: def.maxRank }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-5 rounded-full ${i < rank ? 'bg-violet-400' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </div>
            {maxed ? (
              <span className="text-xs font-bold text-violet-300">MAX</span>
            ) : (
              <button
                onClick={() => buyUpgrade(def.id)}
                disabled={meta.soulCrystals < cost}
                className="rounded-lg bg-violet-500/90 px-3 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                💠 {cost}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AchievementsTab() {
  const unlocked = useGameStore((s) => s.meta.achievements);
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {ACHIEVEMENTS.map((a) => {
        const done = unlocked.includes(a.id);
        return (
          <div
            key={a.id}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              done ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/10 bg-black/40 opacity-50 grayscale'
            }`}
          >
            <span className="text-2xl">{done ? a.icon : '🔒'}</span>
            <div>
              <div className={`text-sm font-bold ${done ? 'text-amber-200' : 'text-white/60'}`}>{a.name}</div>
              <div className="text-[11px] text-white/50">{a.description}</div>
            </div>
            {done && <span className="ml-auto text-amber-400">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

function RelicsTab() {
  const relics = useGameStore((s) => s.meta.relics);
  return (
    <>
      <div className="mb-3 text-xs text-white/50">
        Relics are found in treasure tiles and boss fights. They last for the current run.
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {Object.values(RELICS).map((r) => {
          const owned = relics.includes(r.id);
          return (
            <div
              key={r.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                owned ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/10 bg-black/40 opacity-50 grayscale'
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <div>
                <div className={`text-sm font-bold ${owned ? 'text-violet-200' : 'text-white/60'}`}>{r.name}</div>
                <div className="text-[11px] text-white/50">{r.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function MetaProgression() {
  const meta = useGameStore((s) => s.meta);
  const setScreen = useGameStore((s) => s.setScreen);
  const returnScreen = useGameStore((s) => s.ui.returnScreen);
  const [tab, setTab] = useState<'upgrades' | 'achievements' | 'relics'>('upgrades');

  return (
    <div className="mx-auto max-w-3xl p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-violet-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-violet-200">💠 Soul Sanctum</h2>
          <div className="flex items-center gap-4">
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-sm font-bold text-violet-300">
              💠 {meta.soulCrystals.toLocaleString()} Soul Crystals
            </span>
            <button
              onClick={() => setScreen(returnScreen)}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-semibold hover:bg-white/10"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl bg-black/40 p-1">
          {([
            ['upgrades', '⬆️ Upgrades'],
            ['achievements', `🏆 Achievements (${meta.achievements.length}/${ACHIEVEMENTS.length})`],
            ['relics', `🏺 Relics (${meta.relics.length}/${Object.keys(RELICS).length})`],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors sm:text-sm ${
                tab === id ? 'bg-violet-500/20 text-violet-200' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'upgrades' && <UpgradesTab />}
        {tab === 'achievements' && <AchievementsTab />}
        {tab === 'relics' && <RelicsTab />}

        <div className="mt-4 flex justify-between text-[11px] text-white/40">
          <span>Runs: {meta.runCount}</span>
          <span>NG+ level: {meta.ngPlusLevel}{meta.ngPlusUnlocked ? ' (unlocked)' : ' (beat the Demon Lord to unlock)'}</span>
        </div>
      </motion.div>
    </div>
  );
}
