import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../game/engine/store';
import { RARITY_COLORS, enhancementCost, enhancementSuccessRate } from '../../game/systems/items';
import type { EquipSlot, Item } from '../../game/engine/types';

// ============================================================
// Shop: Buy / Sell / Blacksmith tabs, stat comparison,
// rarity colors, slot filter.
// ============================================================

const SLOT_FILTERS: Array<EquipSlot | 'all'> = ['all', 'weapon', 'armor', 'helmet', 'pants', 'boots', 'accessory'];

function statDiff(item: Item, equipped: Item | null): Array<[string, number]> {
  const keys = new Set([
    ...Object.keys(item.stats),
    ...(equipped ? Object.keys(equipped.stats) : []),
  ]);
  const diffs: Array<[string, number]> = [];
  for (const key of keys) {
    const next = item.stats[key as keyof Item['stats']] ?? 0;
    const prev = equipped?.stats[key as keyof Item['stats']] ?? 0;
    if (next - prev !== 0) diffs.push([key.toUpperCase(), next - prev]);
  }
  return diffs;
}

function ItemCard({
  item, price, actionLabel, onAction, equipped, disabled,
}: {
  item: Item; price: number; actionLabel: string; onAction: () => void;
  equipped?: Item | null; disabled?: boolean;
}) {
  const diffs = equipped !== undefined ? statDiff(item, equipped) : [];
  return (
    <div className={`flex flex-col rounded-xl border bg-black/40 p-3 ${RARITY_COLORS[item.rarity]}`}>
      <div className="flex items-start gap-2">
        <span className="text-2xl">{item.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">
            {item.name}{item.enhancement > 0 && <span className="text-amber-300"> +{item.enhancement}</span>}
          </div>
          <div className="text-[11px] capitalize text-white/50">
            {item.rarity} {item.slot} · Lv.{item.level}{item.weaponKind ? ` · ${item.weaponKind}` : ''}
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/80">
        {Object.entries(item.stats).map(([k, v]) => (
          <span key={k}>{k.toUpperCase()} +{v}</span>
        ))}
        {item.hpBonus ? <span>HP +{item.hpBonus}</span> : null}
        {item.mpBonus ? <span>MP +{item.mpBonus}</span> : null}
      </div>
      {diffs.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-2 text-[11px]">
          <span className="text-white/40">vs equipped:</span>
          {diffs.map(([k, d]) => (
            <span key={k} className={d > 0 ? 'text-emerald-400' : 'text-red-400'}>
              {k} {d > 0 ? '+' : ''}{d}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-sm font-bold text-amber-300">🪙 {price.toLocaleString()}</span>
        <button
          onClick={onAction}
          disabled={disabled}
          className="rounded-lg bg-amber-500/90 px-3 py-1 text-xs font-bold text-slate-900 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function BuyTab() {
  const stock = useGameStore((s) => s.shop.stock);
  const player = useGameStore((s) => s.player);
  const relics = useGameStore((s) => s.meta.relics);
  const buyItem = useGameStore((s) => s.buyItem);
  const [filter, setFilter] = useState<EquipSlot | 'all'>('all');

  const discount = relics.includes('merchant_seal') ? 0.8 : 1;
  const visible = stock.filter((i) => filter === 'all' || i.slot === filter);

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SLOT_FILTERS.map((slot) => (
          <button
            key={slot}
            onClick={() => setFilter(slot)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
              filter === slot ? 'border-amber-400 bg-amber-500/20 text-amber-200' : 'border-white/15 text-white/50 hover:bg-white/5'
            }`}
          >
            {slot}
          </button>
        ))}
        {discount < 1 && <span className="ml-auto text-xs text-emerald-400">🪪 Merchant Seal: −20% prices!</span>}
      </div>
      {visible.length === 0 ? (
        <div className="py-10 text-center text-white/40">Sold out! Come back after your next visit.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {visible.map((item) => {
            const price = Math.round(item.price * discount);
            return (
              <ItemCard
                key={item.id}
                item={item}
                price={price}
                actionLabel="Buy"
                equipped={player.equipment[item.slot]}
                disabled={player.gold < price}
                onAction={() => buyItem(item)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function SellTab() {
  const inventory = useGameStore((s) => s.player.inventory);
  const sellItem = useGameStore((s) => s.sellItem);

  if (inventory.length === 0) {
    return <div className="py-10 text-center text-white/40">Your bag is empty — nothing to sell.</div>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {inventory.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          price={Math.round(item.price * 0.4 * (1 + item.enhancement * 0.15))}
          actionLabel="Sell"
          onAction={() => sellItem(item)}
        />
      ))}
    </div>
  );
}

function ForgeTab() {
  const equipment = useGameStore((s) => s.player.equipment);
  const gold = useGameStore((s) => s.player.gold);
  const enhanceEquipped = useGameStore((s) => s.enhanceEquipped);

  const slots = Object.entries(equipment).filter(([, item]) => item !== null) as Array<[EquipSlot, Item]>;

  if (slots.length === 0) {
    return <div className="py-10 text-center text-white/40">Equip something first — the anvil awaits.</div>;
  }
  return (
    <div className="space-y-2">
      <div className="mb-2 text-xs text-white/50">
        🔨 Enhancing boosts an item's stats by <b className="text-amber-300">+5% per level</b> (max +15). Failure only wastes gold — gear is never damaged.
      </div>
      {slots.map(([slot, item]) => {
        const maxed = item.enhancement >= 15;
        const cost = enhancementCost(item);
        const rate = enhancementSuccessRate(item.enhancement);
        return (
          <div key={slot} className={`flex items-center gap-3 rounded-xl border bg-black/40 p-3 ${RARITY_COLORS[item.rarity]}`}>
            <span className="text-2xl">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">
                {item.name} <span className="text-amber-300">+{item.enhancement}</span>
              </div>
              <div className="text-[11px] capitalize text-white/50">{slot}</div>
            </div>
            {maxed ? (
              <span className="text-sm font-bold text-amber-300">MAX ✨</span>
            ) : (
              <>
                <div className="text-right text-xs">
                  <div className={rate >= 0.7 ? 'text-emerald-400' : rate >= 0.4 ? 'text-yellow-400' : 'text-red-400'}>
                    {Math.round(rate * 100)}% success
                  </div>
                  <div className="text-amber-300">🪙 {cost.toLocaleString()}</div>
                </div>
                <button
                  onClick={() => enhanceEquipped(slot)}
                  disabled={gold < cost}
                  className="rounded-lg bg-orange-500/90 px-3 py-1.5 text-xs font-bold text-slate-900 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  → +{item.enhancement + 1}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Shop() {
  const gold = useGameStore((s) => s.player.gold);
  const leaveShop = useGameStore((s) => s.leaveShop);
  const [tab, setTab] = useState<'buy' | 'sell' | 'forge'>('buy');

  return (
    <div className="mx-auto max-w-3xl p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-amber-200">🏪 Wandering Bazaar</h2>
          <div className="flex items-center gap-4">
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-sm font-bold text-amber-300">
              🪙 {gold.toLocaleString()}
            </span>
            <button
              onClick={leaveShop}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-semibold hover:bg-white/10"
            >
              Leave →
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl bg-black/40 p-1">
          {([['buy', '🛒 Buy'], ['sell', '💰 Sell'], ['forge', '🔨 Blacksmith']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
                tab === id ? 'bg-amber-500/20 text-amber-200' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'buy' && <BuyTab />}
        {tab === 'sell' && <SellTab />}
        {tab === 'forge' && <ForgeTab />}
      </motion.div>
    </div>
  );
}
