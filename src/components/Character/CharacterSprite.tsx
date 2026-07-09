import type { ClassId } from '../../game/engine/types';

// ============================================================
// SVG character sprites (from the DUNGEONOPOLY Art Director
// skill file). Idle breathing/floating is baked into each SVG;
// combat movement (attack/hurt/death) is animated by the
// parent's framer-motion wrapper in BattleScreen.
// ============================================================

export type SpriteClass = 'warrior' | 'mage';

/** Which sprite art a class uses; null = no art yet (emoji fallback) */
const SPRITE_FOR_CLASS: Partial<Record<ClassId, SpriteClass>> = {
  warrior: 'warrior', knight: 'warrior', berserker: 'warrior',
  guardian: 'warrior', warlord: 'warrior',
  mage: 'mage', sorcerer: 'mage', battlemage: 'mage',
  archmage: 'mage', spellblade: 'mage',
};

export function spriteForClass(classId: ClassId): SpriteClass | null {
  return SPRITE_FOR_CLASS[classId] ?? null;
}

function WarriorSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96" className="h-full w-auto">
      <defs>
        <filter id="warrior-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          .warrior-body { animation: warrior-idle 2s ease-in-out infinite; }
          .warrior-weapon { animation: warrior-idle 2s ease-in-out infinite, warrior-weapon-glow 2s ease-in-out infinite; }
          @keyframes warrior-idle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          @keyframes warrior-weapon-glow {
            0%, 100% { filter: none; }
            50% { filter: url(#warrior-glow); }
          }
        `}</style>
      </defs>
      {/* Body */}
      <g className="warrior-body">
        {/* Boots */}
        <rect x="18" y="80" width="12" height="10" rx="2" fill="#4a2c17" />
        <rect x="34" y="80" width="12" height="10" rx="2" fill="#4a2c17" />
        {/* Legs/Pants */}
        <rect x="19" y="62" width="11" height="20" fill="#2c3e50" />
        <rect x="34" y="62" width="11" height="20" fill="#2c3e50" />
        {/* Belt */}
        <rect x="16" y="60" width="32" height="4" fill="#8B4513" />
        <rect x="29" y="59" width="6" height="6" fill="#FFD700" rx="1" />
        {/* Chest Armor */}
        <rect x="15" y="38" width="34" height="24" rx="3" fill="#607d8b" />
        {/* Shoulder Pads */}
        <rect x="8" y="38" width="10" height="12" rx="3" fill="#455a64" />
        <rect x="46" y="38" width="10" height="12" rx="3" fill="#455a64" />
        {/* Arms */}
        <rect x="9" y="50" width="8" height="16" fill="#d4a574" />
        <rect x="47" y="50" width="8" height="16" fill="#d4a574" />
        {/* Gauntlets */}
        <rect x="8" y="62" width="10" height="8" rx="2" fill="#607d8b" />
        <rect x="46" y="62" width="10" height="8" rx="2" fill="#607d8b" />
        {/* Head */}
        <ellipse cx="32" cy="24" rx="14" ry="16" fill="#d4a574" />
        {/* Hair */}
        <ellipse cx="32" cy="12" rx="13" ry="8" fill="#8B4513" />
        {/* Eyes */}
        <ellipse cx="27" cy="23" rx="3" ry="3" fill="white" />
        <ellipse cx="37" cy="23" rx="3" ry="3" fill="white" />
        <ellipse cx="28" cy="23" rx="2" ry="2" fill="#2c3e50" />
        <ellipse cx="38" cy="23" rx="2" ry="2" fill="#2c3e50" />
        {/* Helmet Trim */}
        <rect x="18" y="10" width="28" height="5" rx="2" fill="#607d8b" />
      </g>
      {/* Weapon */}
      <g className="warrior-weapon">
        <rect x="52" y="25" width="6" height="45" rx="2" fill="#9e9e9e" />
        <rect x="44" y="25" width="22" height="5" rx="2" fill="#9e9e9e" />
        <polygon points="55,15 52,25 58,25" fill="#e0e0e0" />
      </g>
    </svg>
  );
}

function MageSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96" className="h-full w-auto">
      <defs>
        <radialGradient id="magic-orb">
          <stop offset="0%" stopColor="#9c27b0" stopOpacity="1" />
          <stop offset="100%" stopColor="#4a0080" stopOpacity="0.5" />
        </radialGradient>
        <filter id="mage-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          .mage-body { animation: mage-float 3s ease-in-out infinite; }
          .mage-orb { animation: orb-pulse 1.5s ease-in-out infinite; }
          .mage-robe-hem { animation: robe-sway 2s ease-in-out infinite; }
          @keyframes mage-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes orb-pulse {
            0%, 100% { transform: scale(1); filter: url(#mage-glow); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
          }
          @keyframes robe-sway {
            0%, 100% { transform: skewX(0deg); }
            50% { transform: skewX(2deg); }
          }
        `}</style>
      </defs>
      <g className="mage-body">
        {/* Robe bottom */}
        <g className="mage-robe-hem">
          <polygon points="16,96 22,65 42,65 48,96" fill="#4a0080" />
          <polygon points="22,96 27,65 37,65 42,96" fill="#6a1b9a" />
        </g>
        {/* Robe body */}
        <rect x="14" y="40" width="36" height="27" fill="#4a0080" />
        {/* Rune markings on robe */}
        <text x="22" y="58" fontSize="6" fill="#9c27b0" opacity="0.7">⟡</text>
        <text x="34" y="52" fontSize="5" fill="#ce93d8" opacity="0.6">∅</text>
        {/* Arms with wide sleeves */}
        <polygon points="6,42 14,42 17,62 6,65" fill="#4a0080" />
        <polygon points="50,42 58,42 58,65 47,62" fill="#4a0080" />
        {/* Hands */}
        <ellipse cx="9" cy="67" rx="6" ry="5" fill="#d4a574" />
        <ellipse cx="55" cy="67" rx="6" ry="5" fill="#d4a574" />
        {/* Head */}
        <ellipse cx="32" cy="22" rx="13" ry="15" fill="#d4a574" />
        {/* Wizard Hat */}
        <polygon points="10,16 32,0 54,16" fill="#311b92" />
        <rect x="10" y="14" width="44" height="6" fill="#4a0080" />
        {/* Hat band */}
        <rect x="10" y="17" width="44" height="3" fill="#9c27b0" />
        {/* Eyes */}
        <ellipse cx="27" cy="22" rx="3" ry="3" fill="white" />
        <ellipse cx="37" cy="22" rx="3" ry="3" fill="white" />
        <ellipse cx="27" cy="22" rx="2" ry="2" fill="#6a1b9a" />
        <ellipse cx="37" cy="22" rx="2" ry="2" fill="#6a1b9a" />
        {/* Glowing eyes effect */}
        <ellipse cx="27" cy="22" rx="1.5" ry="1.5" fill="#e040fb" opacity="0.8" />
        <ellipse cx="37" cy="22" rx="1.5" ry="1.5" fill="#e040fb" opacity="0.8" />
      </g>
      {/* Staff */}
      <g>
        <rect x="5" y="20" width="4" height="55" rx="2" fill="#6d4c41" />
        {/* Orb */}
        <circle className="mage-orb" cx="7" cy="17" r="8" fill="url(#magic-orb)" />
        <circle cx="7" cy="17" r="4" fill="#e040fb" opacity="0.6" />
      </g>
    </svg>
  );
}

export default function CharacterSprite({
  classId, flipped = false, height = 150,
}: {
  classId: ClassId; flipped?: boolean; height?: number;
}) {
  const sprite = spriteForClass(classId);
  if (!sprite) return null;

  return (
    <div
      style={{ height, transform: flipped ? 'scaleX(-1)' : undefined }}
      className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
    >
      {sprite === 'warrior' ? <WarriorSVG /> : <MageSVG />}
    </div>
  );
}
