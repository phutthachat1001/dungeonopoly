import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { RARITY_COLORS } from '../../game/systems/items';
import type { EquipSlot, Item } from '../../game/engine/types';

// ============================================================
// Inventory & equipment — equip from bag, unequip from paper doll.
// ============================================================

const SLOT_ORDER: EquipSlot[] = ['weapon', 'helmet', 'armor', 'pants', 'boots', 'accessory'];
const SLOT_LABELS: Record<EquipSlot, string> = {
  weapon: '⚔️ Weapon', helmet: '⛑️ Helmet', armor: '🛡️ Armor',
  pants: '👖 Pants', boots: '👢 Boots', accessory: '💍 Accessory',
};

function ItemStats({ item }: { item: Item }) {
  return (
    <div className="flex flex-wrap gap-x-2 text-[11px] text-white/70">
      {Object.entries(item.stats).map(([k, v]) => <span key={k}>{k.toUpperCase()}+{v}</span>)}
      {item.hpBonus ? <span>HP+{item.hpBonus}</span> : null}
      {item.mpBonus ? <span>MP+{item.mpBonus}</span> : null}
    </div>
  );
}

export default function InventoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const player = useGameStore((s) => s.player);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipItem = useGameStore((s) => s.unequipItem);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-amber-200">🎒 Equipment &amp; Bag</h2>
              <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
            </div>

            {/* equipped */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {SLOT_ORDER.map((slot) => {
                const item = player.equipment[slot];
                return (
                  <div
                    key={slot}
                    className={`rounded-xl border p-2.5 ${item ? RARITY_COLORS[item.rarity] : 'border-dashed border-white/15'} bg-black/40`}
                  >
                    <div className="text-[10px] uppercase tracking-wide text-white/40">{SLOT_LABELS[slot]}</div>
                    {item ? (
                      <>
                        <div className="mt-0.5 truncate text-sm font-bold">
                          {item.name}{item.enhancement > 0 && <span className="text-amber-300"> +{item.enhancement}</span>}
                        </div>
                        <ItemStats item={item} />
                        <button
                          onClick={() => unequipItem(slot)}
                          className="mt-1.5 rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/70 hover:bg-white/20"
                        >
                          Unequip
                        </button>
                      </>
                    ) : (
                      <div className="mt-1 text-xs text-white/30">— empty —</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* bag */}
            <div className="mt-4 mb-2 text-sm font-bold text-white/70">
              Bag ({player.inventory.length}/30)
            </div>
            {player.inventory.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 py-8 text-center text-sm text-white/40">
                Empty — defeat monsters and open treasures to find loot!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {player.inventory.map((item) => {
                  const equipped = player.equipment[item.slot];
                  return (
                    <div key={item.id} className={`rounded-xl border p-2.5 ${RARITY_COLORS[item.rarity]} bg-black/40`}>
                      <div className="flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span className="truncate text-sm font-bold">
                          {item.name}{item.enhancement > 0 && <span className="text-amber-300"> +{item.enhancement}</span>}
                        </span>
                      </div>
                      <div className="text-[10px] capitalize text-white/40">{item.rarity} {item.slot} · Lv.{item.level}</div>
                      <ItemStats item={item} />
                      <button
                        onClick={() => equipItem(item)}
                        className="mt-1.5 rounded bg-amber-500/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-900 hover:bg-amber-400"
                      >
                        {equipped ? 'Swap in' : 'Equip'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
