import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';

// ============================================================
// 3D CSS dice — spins wildly, then lands on the rolled face.
// ============================================================

/** cube rotation that brings each face to the front */
const FACE_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: 90 },
  3: { x: 90, y: 0 },
  4: { x: -90, y: 0 },
  5: { x: 0, y: -90 },
  6: { x: 0, y: 180 },
};

const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
};

function DieFace({ value, transform }: { value: number; transform: string }) {
  return (
    <div
      className="absolute inset-0 rounded-xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 to-amber-200"
      style={{ transform, backfaceVisibility: 'hidden' }}
    >
      {PIP_LAYOUT[value].map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900 shadow-inner"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}

const SIZE = 72;
const HALF = SIZE / 2;

export default function DiceRoller() {
  const lastRoll = useGameStore((s) => s.board.lastRoll);
  const isMoving = useGameStore((s) => s.board.isMoving);
  const combatActive = useGameStore((s) => s.combat.active);
  const rollAndMove = useGameStore((s) => s.rollAndMove);

  const [rotation, setRotation] = useState({ x: -20, y: -30 });
  const [rolling, setRolling] = useState(false);
  const spins = useRef(0);

  useEffect(() => {
    if (lastRoll === null) return;
    setRolling(true);
    spins.current += 1;
    const target = FACE_ROTATION[lastRoll];
    // extra full revolutions make it visibly tumble
    setRotation({
      x: target.x + 720 * spins.current,
      y: target.y + 1080 * spins.current,
    });
    const t = setTimeout(() => setRolling(false), 1100);
    return () => clearTimeout(t);
  }, [lastRoll]);

  const disabled = isMoving || combatActive;

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ perspective: 400 }} className={rolling ? 'animate-screen-shake' : ''}>
        <motion.div
          className="relative"
          style={{ width: SIZE, height: SIZE, transformStyle: 'preserve-3d' }}
          animate={{ rotateX: rotation.x, rotateY: rotation.y }}
          transition={{ duration: 1.05, ease: [0.2, 0.9, 0.3, 1] }}
        >
          <DieFace value={1} transform={`translateZ(${HALF}px)`} />
          <DieFace value={2} transform={`rotateY(-90deg) translateZ(${HALF}px)`} />
          <DieFace value={3} transform={`rotateX(-90deg) translateZ(${HALF}px)`} />
          <DieFace value={4} transform={`rotateX(90deg) translateZ(${HALF}px)`} />
          <DieFace value={5} transform={`rotateY(90deg) translateZ(${HALF}px)`} />
          <DieFace value={6} transform={`rotateY(180deg) translateZ(${HALF}px)`} />
        </motion.div>
      </div>

      <button
        onClick={() => void rollAndMove()}
        disabled={disabled}
        className="rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 px-8 py-3 font-bold text-slate-900 shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-400/50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        {isMoving ? 'Moving…' : '🎲 Roll Dice'}
      </button>

      {lastRoll !== null && !rolling && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-lg font-bold text-amber-300"
        >
          You rolled a {lastRoll}!
        </motion.div>
      )}
    </div>
  );
}
