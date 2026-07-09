import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';

// ============================================================
// Event modal — narrative text, choice buttons, outcome reveal.
// Overlays the board while an event is active.
// ============================================================

export default function EventModal() {
  const event = useGameStore((s) => s.event);
  const player = useGameStore((s) => s.player);
  const chooseEventOption = useGameStore((s) => s.chooseEventOption);
  const closeEvent = useGameStore((s) => s.closeEvent);

  return (
    <AnimatePresence>
      {event.active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl"
          >
            {/* illustration band */}
            <div className="flex h-28 items-center justify-center bg-gradient-to-b from-purple-900/40 to-transparent">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="text-7xl drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]"
              >
                {event.active.icon}
              </motion.span>
            </div>

            <div className="p-5">
              <h3 className="font-display text-center text-2xl font-bold text-purple-200">
                ⭐ {event.active.name}
              </h3>

              {!event.resultText ? (
                <>
                  <p className="mt-2 text-center text-sm leading-relaxed text-white/70">
                    {event.active.description}
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    {event.active.choices.map((choice, i) => {
                      const goldReq = choice.requirement?.gold ?? 0;
                      const levelReq = choice.requirement?.level ?? 0;
                      const blocked = player.gold < goldReq || player.level < levelReq;
                      return (
                        <button
                          key={i}
                          disabled={blocked}
                          onClick={() => chooseEventOption(i)}
                          className="group rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-semibold transition-all hover:border-purple-400/50 hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="text-purple-300 transition-transform group-hover:translate-x-1 inline-block">▸</span>{' '}
                          {choice.text}
                          {blocked && goldReq > 0 && (
                            <span className="ml-2 text-xs text-red-400">(need {goldReq} gold)</span>
                          )}
                          {blocked && levelReq > 0 && player.level < levelReq && (
                            <span className="ml-2 text-xs text-red-400">(need Lv.{levelReq})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <p className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-amber-100">
                    {event.resultText}
                  </p>
                  {event.pendingCombat && (
                    <p className="mt-2 text-sm font-bold text-red-400">⚔️ Prepare for battle!</p>
                  )}
                  {event.pendingTeleport && (
                    <p className="mt-2 text-sm font-bold text-sky-300">🌀 Reality shifts around you…</p>
                  )}
                  <button
                    onClick={closeEvent}
                    className="mt-4 rounded-xl bg-gradient-to-b from-purple-400 to-purple-600 px-8 py-2.5 font-bold text-white shadow-lg transition-transform hover:scale-105"
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
