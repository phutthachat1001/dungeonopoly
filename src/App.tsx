import { useState } from 'react';
import { useGameStore } from './game/engine/store';
import GameBoard from './components/Board/GameBoard';
import DiceRoller from './components/Board/DiceRoller';
import BattleScreen from './components/Combat/BattleScreen';
import ClassSelector from './components/Character/ClassSelector';
import Shop from './components/UI/Shop';
import EventModal from './components/UI/EventModal';
import InventoryModal from './components/UI/InventoryModal';
import MetaProgression from './components/Meta/MetaProgression';
import { PlayerPanel, Notifications, LevelUpOverlay, ActionBar } from './components/UI/HUD';
import { TitleScreen, GameOverScreen, VictoryScreen } from './components/UI/Screens';

function BoardScreen() {
  const [inventoryOpen, setInventoryOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start justify-center gap-6 p-4 lg:flex-row">
      {/* left column: player + actions + dice */}
      <div className="flex w-full flex-row flex-wrap items-start justify-center gap-4 lg:w-auto lg:flex-col">
        <div className="flex flex-col gap-2">
          <PlayerPanel />
          <ActionBar onOpenInventory={() => setInventoryOpen(true)} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
          <DiceRoller />
        </div>
      </div>

      {/* board */}
      <div className="w-full max-w-2xl flex-1">
        <GameBoard />
      </div>

      <InventoryModal open={inventoryOpen} onClose={() => setInventoryOpen(false)} />
    </div>
  );
}

function CombatScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <BattleScreen />
    </div>
  );
}

export default function App() {
  const screen = useGameStore((s) => s.ui.screen);
  const fullscreen = screen === 'title' || screen === 'gameover' || screen === 'victory';

  return (
    <div className="min-h-screen">
      {!fullscreen && (
        <header className="p-3 text-center">
          <span className="font-display text-xl font-black tracking-widest text-transparent bg-gradient-to-b from-yellow-200 to-amber-500 bg-clip-text">
            ⚔️ DUNGEONOPOLY
          </span>
        </header>
      )}

      {screen === 'title' && <TitleScreen />}
      {screen === 'board' && <BoardScreen />}
      {screen === 'combat' && <CombatScreen />}
      {screen === 'shop' && <Shop />}
      {screen === 'classSelect' && <ClassSelector />}
      {screen === 'meta' && <MetaProgression />}
      {screen === 'gameover' && <GameOverScreen />}
      {screen === 'victory' && <VictoryScreen />}

      <EventModal />
      <Notifications />
      <LevelUpOverlay />
    </div>
  );
}
