import type { Tile, TileType } from './types';
import { TILE_WEIGHTS, zoneForTile } from '../data/zones';

// ============================================================
// Board generation — 100 tiles across 5 zones.
//   Tile 0            = Start
//   Tiles 19/39/59/79 = Zone bosses; tile 99 = Final boss
//   Each zone is guaranteed a shop and a heal tile.
// ============================================================

const BOSS_TILES = new Set([19, 39, 59, 79, 99]);

function weightedTileType(): TileType {
  const total = TILE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [type, weight] of TILE_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'monster';
}

export function generateBoard(): Tile[] {
  const tiles: Tile[] = [];

  for (let i = 0; i < 100; i++) {
    let type: TileType;
    if (i === 0) type = 'start';
    else if (BOSS_TILES.has(i)) type = 'boss';
    else {
      type = weightedTileType();
      if (type === 'boss') type = 'monster'; // bosses only on fixed tiles
    }
    tiles.push({ index: i, type, zone: zoneForTile(i).id });
  }

  // Guarantee each zone has at least one shop and one heal
  for (let zone = 0; zone < 5; zone++) {
    const start = zone * 20;
    const zoneTiles = tiles.slice(start, start + 20);
    for (const required of ['shop', 'heal'] as const) {
      if (!zoneTiles.some((t) => t.type === required)) {
        // replace a random monster tile in this zone (never start/boss)
        const candidates = zoneTiles.filter((t) => t.type === 'monster');
        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          tiles[pick.index] = { ...pick, type: required };
        }
      }
    }
  }

  return tiles;
}

// ============================================================
// Board layout — serpentine (snake) grid positions.
// 10 columns x 10 rows; even rows go left→right, odd rows right→left,
// so consecutive tiles are always adjacent on screen.
// ============================================================

export interface TilePosition {
  row: number;
  col: number;
}

export function tilePosition(index: number, cols = 10): TilePosition {
  const row = Math.floor(index / cols);
  const rawCol = index % cols;
  const col = row % 2 === 0 ? rawCol : cols - 1 - rawCol;
  return { row, col };
}
