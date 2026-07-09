import type { ClassId, SpriteAnimation } from '../../game/engine/types';

// ============================================================
// SVG character sprites.
// - Warrior: full pixel-art sprite with 5 baked-in animation
//   states (idle / attack / hurt / death / special) driven by
//   a `state-*` class on the root svg.
// - Mage: template sprite with idle-only animation (parent
//   framer-motion wrapper handles combat movement).
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

/** Sprites that animate their own combat states (parent should NOT move them) */
export function spriteIsStateful(classId: ClassId): boolean {
  return spriteForClass(classId) === 'warrior';
}

/** game animation → warrior svg state class */
const WARRIOR_STATE: Record<SpriteAnimation, string> = {
  idle: 'state-idle',
  attack: 'state-attack',
  hurt: 'state-hurt',
  death: 'state-death',
  skill: 'state-special',
};

// ------------------------------------------------------------
// WARRIOR — animated pixel-art sprite
// ------------------------------------------------------------

function WarriorSVG({ state }: { state: SpriteAnimation }) {
  return (
    <svg
      id="warrior"
      className={WARRIOR_STATE[state]}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 240"
      role="img"
      aria-label="Animated fantasy pixel art warrior"
      shapeRendering="crispEdges"
      style={{ height: '100%', width: 'auto', overflow: 'visible' }}
    >
      <style>{`
        #warrior {
          --outline: #171525;
          --deep-shadow: #24223b;
          --steel-dark: #293d5f;
          --steel: #41658d;
          --steel-light: #79a7bf;
          --gold-dark: #8b5528;
          --gold: #d9a441;
          --gold-light: #ffe08a;
          --cape-dark: #641f35;
          --cape: #a83246;
          --cape-light: #dc5361;
          --skin: #d69a71;
          --rune: #ff8d3a;
          --eye: #8be9ff;
          background: transparent;
          overflow: visible;
        }

        #warrior .sprite { transform-origin: 160px 184px; }

        #warrior .pixel-outline {
          stroke: var(--outline);
          stroke-width: 6;
          stroke-linejoin: miter;
          stroke-linecap: square;
        }

        #warrior .shadow { fill: #0d0c18; opacity: 0.42; transform-origin: center; }
        #warrior .cape { transform-origin: 133px 105px; }
        #warrior .sword-arm { transform-origin: 181px 112px; }
        #warrior .shield-arm { transform-origin: 128px 118px; }
        #warrior .head { transform-origin: 158px 74px; }
        #warrior .body { transform-origin: 158px 132px; }
        #warrior .rune-glow { opacity: 0.8; filter: drop-shadow(0 0 4px var(--rune)); }

        #warrior .impact,
        #warrior .hurt-flash,
        #warrior .special-aura,
        #warrior .death-fragments { opacity: 0; }

        /* IDLE */
        #warrior.state-idle .sprite { animation: w-idle-body 2.4s steps(4, end) infinite; }
        #warrior.state-idle .head { animation: w-idle-head 2.4s steps(4, end) infinite; }
        #warrior.state-idle .cape { animation: w-idle-cape 1.2s steps(3, end) infinite; }
        #warrior.state-idle .shadow { animation: w-idle-shadow 2.4s steps(4, end) infinite; }

        /* ATTACK */
        #warrior.state-attack .sprite { animation: w-attack-body 0.72s steps(6, end) both; }
        #warrior.state-attack .sword-arm { animation: w-attack-sword 0.72s steps(6, end) both; }
        #warrior.state-attack .shield-arm { animation: w-attack-shield 0.72s steps(6, end) both; }
        #warrior.state-attack .impact { animation: w-attack-impact 0.72s steps(6, end) both; }

        /* HURT */
        #warrior.state-hurt .sprite { animation: w-hurt-body 0.55s steps(5, end) both; }
        #warrior.state-hurt .hurt-flash { animation: w-hurt-flash 0.55s steps(5, end) both; }

        /* DEATH */
        #warrior.state-death .sprite { animation: w-death-fall 1.45s steps(9, end) forwards; }
        #warrior.state-death .death-fragments { animation: w-death-shatter 1.45s steps(9, end) forwards; }
        #warrior.state-death .shadow { animation: w-death-shadow 1.45s steps(9, end) forwards; }

        /* SPECIAL (skill) */
        #warrior.state-special .sprite { animation: w-special-body 1.15s steps(8, end) both; }
        #warrior.state-special .sword-arm { animation: w-special-sword 1.15s steps(8, end) both; }
        #warrior.state-special .special-aura { animation: w-special-aura 1.15s steps(8, end) both; }
        #warrior.state-special .rune-glow { animation: w-special-rune 1.15s steps(8, end) both; }

        @keyframes w-idle-body {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(0, -2px); }
          50% { transform: translate(0, 0); }
          75% { transform: translate(0, 1px); }
        }
        @keyframes w-idle-head {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes w-idle-cape {
          0%, 100% { transform: skewY(0deg) translateX(0); }
          50% { transform: skewY(-4deg) translateX(-2px); }
        }
        @keyframes w-idle-shadow {
          0%, 100% { transform: scaleX(1); opacity: 0.42; }
          50% { transform: scaleX(0.94); opacity: 0.35; }
        }
        @keyframes w-attack-body {
          0% { transform: translate(0, 0) rotate(0deg); }
          18% { transform: translate(-8px, 2px) rotate(-5deg); }
          38% { transform: translate(-12px, 2px) rotate(-8deg); }
          55% { transform: translate(28px, -2px) rotate(8deg); }
          72% { transform: translate(35px, 0) rotate(4deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes w-attack-sword {
          0% { transform: rotate(-18deg); }
          35% { transform: rotate(-62deg); }
          55% { transform: rotate(92deg); }
          72% { transform: rotate(112deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes w-attack-shield {
          0%, 100% { transform: rotate(0deg); }
          35% { transform: rotate(-12deg) translateX(-3px); }
          65% { transform: rotate(8deg) translateX(4px); }
        }
        @keyframes w-attack-impact {
          0%, 48% { opacity: 0; transform: scale(0.2); }
          55% { opacity: 1; transform: scale(1.15); }
          72% { opacity: 0.55; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(1.8); }
        }
        @keyframes w-hurt-body {
          0% { transform: translateX(0); }
          18% { transform: translateX(-14px) rotate(-4deg); }
          36% { transform: translateX(8px) rotate(2deg); }
          54% { transform: translateX(-7px); }
          72% { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
        @keyframes w-hurt-flash {
          0%, 100% { opacity: 0; }
          18%, 36% { opacity: 0.72; }
          54% { opacity: 0.25; }
        }
        @keyframes w-death-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          28% { transform: translate(-5px, 4px) rotate(-8deg); opacity: 1; }
          52% { transform: translate(-15px, 20px) rotate(-38deg); opacity: 1; }
          72% { transform: translate(-28px, 48px) rotate(-76deg); opacity: 0.82; }
          100% { transform: translate(-42px, 72px) rotate(-90deg); opacity: 0; }
        }
        @keyframes w-death-shatter {
          0%, 50% { opacity: 0; transform: translateY(0); }
          65% { opacity: 1; transform: translateY(-4px); }
          100% { opacity: 0; transform: translateY(-36px); }
        }
        @keyframes w-death-shadow {
          0% { transform: scaleX(1); opacity: 0.42; }
          72% { transform: scaleX(1.4); opacity: 0.25; }
          100% { transform: scaleX(1.7); opacity: 0; }
        }
        @keyframes w-special-body {
          0% { transform: translateY(0); }
          18% { transform: translateY(4px) scale(0.98); }
          38% { transform: translateY(-5px) scale(1.03); }
          58% { transform: translateY(-10px) scale(1.06); }
          76% { transform: translateY(0) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes w-special-sword {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(-80deg) translateY(-4px); }
          58% { transform: rotate(-105deg) translateY(-10px); }
          76% { transform: rotate(18deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes w-special-aura {
          0% { opacity: 0; transform: scale(0.4); }
          25% { opacity: 0.35; transform: scale(0.8); }
          55% { opacity: 0.95; transform: scale(1.15); }
          80% { opacity: 0.35; transform: scale(1.4); }
          100% { opacity: 0; transform: scale(1.7); }
        }
        @keyframes w-special-rune {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; filter: drop-shadow(0 0 10px #ffbd59); }
        }
      `}</style>

      <ellipse className="shadow" cx="158" cy="206" rx="54" ry="11" />

      <g className="special-aura" style={{ transformOrigin: '160px 130px' }}>
        <rect x="101" y="69" width="118" height="118" fill="none" stroke="#ffb347" strokeWidth="6" opacity="0.5" />
        <rect x="113" y="81" width="94" height="94" fill="none" stroke="#ffe08a" strokeWidth="4" opacity="0.75" />
      </g>

      <g className="sprite">
        {/* Cape */}
        <g className="cape">
          <path className="pixel-outline" fill="var(--cape-dark)"
            d="M124 96h32v18h14v66h-18v18h-42v-18H98v-58h14v-26z" />
          <path fill="var(--cape)" d="M116 102h32v18h12v56h-18v14h-26z" />
          <path fill="var(--cape-light)" d="M116 108h12v60h-12z" />
        </g>

        {/* Back leg */}
        <path className="pixel-outline" fill="var(--steel-dark)"
          d="M139 158h24v38h-8v12h-28v-14h8z" />
        <path fill="var(--steel)" d="M141 163h14v31h-8v8h-14v-8h6z" />

        {/* Front leg */}
        <path className="pixel-outline" fill="var(--steel-dark)"
          d="M164 156h25v39h10v14h-36v-13h-7v-20z" />
        <path fill="var(--steel)" d="M169 162h13v32h10v8h-23z" />

        {/* Torso */}
        <g className="body">
          <path className="pixel-outline" fill="var(--steel-dark)"
            d="M129 98h52l16 26-9 48h-61l-9-48z" />
          <path fill="var(--steel)" d="M136 104h38l14 22-7 38h-47l-7-38z" />
          <path fill="var(--steel-light)" d="M142 108h12v48h-14l-6-30z" />
          <rect x="126" y="132" width="64" height="13" fill="var(--gold-dark)" />
          <rect x="134" y="134" width="47" height="7" fill="var(--gold)" />
          <rect x="154" y="131" width="14" height="15" fill="var(--gold-light)" className="pixel-outline" />
          <path fill="var(--gold)" d="M149 112h19v8h8v10h-8v8h-19v-8h-8v-10h8z" />
        </g>

        {/* Shield arm */}
        <g className="shield-arm">
          <path className="pixel-outline" fill="var(--steel-dark)"
            d="M111 105h26v50h-16l-17-21z" />
          <path fill="var(--steel)" d="M114 111h16v35h-7l-12-15z" />

          <path className="pixel-outline" fill="#27364f"
            d="M80 104h41l12 14-5 55-28 24-28-24-5-55z" />
          <path fill="#36567b"
            d="M84 111h32l9 10-4 46-21 18-21-18-4-46z" />
          <path fill="var(--gold)" d="M96 118h9v52h-9z" />
          <path fill="var(--gold)" d="M82 139h36v9H82z" />
          <path fill="var(--gold-light)"
            d="M95 127h10l7 8-4 12-8 7-8-7-4-12z" />
          <rect x="97" y="134" width="6" height="15" fill="var(--outline)" />
        </g>

        {/* Sword arm */}
        <g className="sword-arm">
          <path className="pixel-outline" fill="var(--steel-dark)"
            d="M177 104h25l16 37-17 10-15-24-9 1z" />
          <path fill="var(--steel)" d="M183 110h14l13 28-9 6-13-23h-5z" />

          {/* Sword */}
          <g transform="translate(202 132) rotate(-8)">
            <rect className="pixel-outline" x="-5" y="-3" width="15" height="28" fill="var(--gold-dark)" />
            <rect x="-1" y="2" width="7" height="18" fill="var(--gold-light)" />

            <path className="pixel-outline" fill="#a9c7d7"
              d="M-2 22h14v12h8v88l-15 24-15-24V34h8z" />
            <path fill="#d7edf2" d="M5 31h7v88l-7 15z" />
            <path fill="#6f94aa" d="M-2 35h7v98l-7-14z" />

            <g className="rune-glow" fill="var(--rune)">
              <rect x="3" y="48" width="5" height="13" />
              <rect x="3" y="71" width="5" height="13" />
              <rect x="3" y="94" width="5" height="13" />
            </g>
          </g>
        </g>

        {/* Head */}
        <g className="head">
          <path className="pixel-outline" fill="var(--steel-dark)"
            d="M133 47h44l15 17v31l-18 18h-38l-18-18V64z" />
          <path fill="var(--steel)" d="M138 53h34l12 14v24l-13 14h-33l-12-14V67z" />
          <path fill="var(--steel-light)" d="M140 57h12v41h-14l-6-10V67z" />
          <path fill="var(--outline)" d="M133 73h52v16h-52z" />
          <rect x="143" y="78" width="10" height="5" fill="var(--eye)" />
          <rect x="166" y="78" width="10" height="5" fill="var(--eye)" />
          <rect x="152" y="41" width="14" height="22" fill="var(--gold)" className="pixel-outline" />
          <rect x="156" y="42" width="6" height="17" fill="var(--gold-light)" />
          <path fill="var(--gold)" d="M129 55h9v15h-9zM180 55h9v15h-9z" />
        </g>

        {/* Hurt overlay */}
        <path className="hurt-flash" fill="#ff435f"
          d="M113 45h83v63h25v86h-31v22h-85v-22H77v-86h24V67h12z" />
      </g>

      {/* Attack impact */}
      <g className="impact" transform="translate(273 132)">
        <rect x="-5" y="-35" width="10" height="70" fill="#ffe08a" />
        <rect x="-35" y="-5" width="70" height="10" fill="#ffe08a" />
        <rect x="-23" y="-23" width="46" height="46" fill="none" stroke="#ff8d3a" strokeWidth="7" />
      </g>

      {/* Death fragments */}
      <g className="death-fragments" fill="#79a7bf">
        <rect x="119" y="139" width="8" height="8" />
        <rect x="143" y="122" width="6" height="6" />
        <rect x="173" y="145" width="10" height="7" />
        <rect x="194" y="112" width="7" height="7" />
        <rect x="156" y="85" width="6" height="9" />
        <rect x="103" y="164" width="9" height="6" />
      </g>
    </svg>
  );
}

// ------------------------------------------------------------
// MAGE — template sprite (idle animation only)
// ------------------------------------------------------------

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
        <g className="mage-robe-hem">
          <polygon points="16,96 22,65 42,65 48,96" fill="#4a0080" />
          <polygon points="22,96 27,65 37,65 42,96" fill="#6a1b9a" />
        </g>
        <rect x="14" y="40" width="36" height="27" fill="#4a0080" />
        <text x="22" y="58" fontSize="6" fill="#9c27b0" opacity="0.7">⟡</text>
        <text x="34" y="52" fontSize="5" fill="#ce93d8" opacity="0.6">∅</text>
        <polygon points="6,42 14,42 17,62 6,65" fill="#4a0080" />
        <polygon points="50,42 58,42 58,65 47,62" fill="#4a0080" />
        <ellipse cx="9" cy="67" rx="6" ry="5" fill="#d4a574" />
        <ellipse cx="55" cy="67" rx="6" ry="5" fill="#d4a574" />
        <ellipse cx="32" cy="22" rx="13" ry="15" fill="#d4a574" />
        <polygon points="10,16 32,0 54,16" fill="#311b92" />
        <rect x="10" y="14" width="44" height="6" fill="#4a0080" />
        <rect x="10" y="17" width="44" height="3" fill="#9c27b0" />
        <ellipse cx="27" cy="22" rx="3" ry="3" fill="white" />
        <ellipse cx="37" cy="22" rx="3" ry="3" fill="white" />
        <ellipse cx="27" cy="22" rx="2" ry="2" fill="#6a1b9a" />
        <ellipse cx="37" cy="22" rx="2" ry="2" fill="#6a1b9a" />
        <ellipse cx="27" cy="22" rx="1.5" ry="1.5" fill="#e040fb" opacity="0.8" />
        <ellipse cx="37" cy="22" rx="1.5" ry="1.5" fill="#e040fb" opacity="0.8" />
      </g>
      <g>
        <rect x="5" y="20" width="4" height="55" rx="2" fill="#6d4c41" />
        <circle className="mage-orb" cx="7" cy="17" r="8" fill="url(#magic-orb)" />
        <circle cx="7" cy="17" r="4" fill="#e040fb" opacity="0.6" />
      </g>
    </svg>
  );
}

export default function CharacterSprite({
  classId, animation = 'idle', flipped = false, height = 150,
}: {
  classId: ClassId; animation?: SpriteAnimation; flipped?: boolean; height?: number;
}) {
  const sprite = spriteForClass(classId);
  if (!sprite) return null;

  return (
    <div
      style={{ height, transform: flipped ? 'scaleX(-1)' : undefined }}
      className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
    >
      {sprite === 'warrior' ? <WarriorSVG state={animation} /> : <MageSVG />}
    </div>
  );
}
