import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { tilePosition } from '../../game/engine/board';
import { TILE_META, ZONES, zoneForTile } from '../../game/data/zones';
import type { Tile } from '../../game/engine/types';

// ============================================================
// 100-tile serpentine board, 10x10. Consecutive tiles are
// always adjacent so the token visibly walks the path.
// ============================================================

function BoardTile({
  tile, isCurrent, isVisited, onSelect,
}: {
  tile: Tile; isCurrent: boolean; isVisited: boolean; onSelect: (t: Tile) => void;
}) {
  const zone = zoneForTile(tile.index);
  const meta = TILE_META[tile.type];
  const isBossTile = tile.type === 'boss';
  const isZoneStart = tile.index % 20 === 0 && tile.index > 0;

  return (
    <button
      onClick={() => onSelect(tile)}
      className={[
        'relative flex aspect-square flex-col items-center justify-center rounded-lg border bg-gradient-to-br transition-transform hover:z-10 hover:scale-110',
        zone.colors.bg,
        isCurrent ? 'border-amber-300 animate-pulse-glow z-10' : zone.colors.border,
        isVisited && !isCurrent ? 'opacity-90' : '',
        !isVisited && !isCurrent ? 'opacity-60 saturate-50' : '',
        isBossTile ? 'shadow-lg ' + zone.colors.glow : '',
      ].join(' ')}
    >
      <span className={isBossTile ? 'text-xl' : 'text-base'}>{meta.icon}</span>
      <span className="absolute bottom-0.5 right-1 text-[9px] font-semibold text-white/50">
        {tile.index + 1}
      </span>
      {isZoneStart && (
        <span className="absolute -top-1.5 -left-1.5 text-sm drop-shadow-lg">{zone.icon}</span>
      )}
      {isCurrent && (
        <motion.div
          layoutId="player-token"
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="absolute -top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-b from-amber-400 to-orange-600 text-sm shadow-lg shadow-amber-500/60"
        >
          🧙
        </motion.div>
      )}
    </button>
  );
}

function TileInfoPanel({ tile, onClose }: { tile: Tile; onClose: () => void }) {
  const zone = zoneForTile(tile.index);
  const meta = TILE_META[tile.type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="pointer-events-auto rounded-xl border border-white/15 bg-slate-900/95 p-4 shadow-2xl backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <span>{meta.icon}</span>
            <span>{meta.name}</span>
            <span className="text-sm font-normal text-white/40">— Tile {tile.index + 1}</span>
          </div>
          <div className={`text-sm ${zone.colors.text}`}>
            {zone.icon} {zone.name} · Lv.{zone.levelRange[0]}–{zone.levelRange[1]}
          </div>
          <p className="mt-1 max-w-md text-sm text-white/70">{meta.description}</p>
        </div>
        <button onClick={onClose} className="text-white/40 transition-colors hover:text-white">✕</button>
      </div>
    </motion.div>
  );
}

export default function GameBoard() {
  const tiles = useGameStore((s) => s.board.tiles);
  const currentTile = useGameStore((s) => s.board.currentTile);
  const visitedTiles = useGameStore((s) => s.board.visitedTiles);
  const [selected, setSelected] = useState<Tile | null>(null);

  const visited = useMemo(() => new Set(visitedTiles), [visitedTiles]);

  // arrange tiles into serpentine grid order (row-major render slots)
  const gridSlots = useMemo(() => {
    const slots: Tile[] = new Array(100);
    for (const tile of tiles) {
      const { row, col } = tilePosition(tile.index);
      slots[row * 10 + col] = tile;
    }
    return slots;
  }, [tiles]);

  const currentZone = zoneForTile(currentTile);

  return (
    <div className="flex flex-col gap-3">
      {/* zone legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {ZONES.map((z) => (
          <span
            key={z.id}
            className={[
              'rounded-full border px-2.5 py-1',
              z.colors.border, z.colors.text,
              z.id === currentZone.id ? 'bg-white/10 font-bold' : 'opacity-60',
            ].join(' ')}
          >
            {z.icon} {z.name}
          </span>
        ))}
      </div>

      {/* board grid */}
      <div className="grid grid-cols-10 gap-1.5 rounded-2xl border border-amber-500/20 bg-black/40 p-3 shadow-2xl">
        {gridSlots.map((tile) => (
          <BoardTile
            key={tile.index}
            tile={tile}
            isCurrent={tile.index === currentTile}
            isVisited={visited.has(tile.index)}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* tile info */}
      <div className="min-h-[92px]">
        <AnimatePresence>
          {selected && <TileInfoPanel tile={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
