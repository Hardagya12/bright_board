import React from 'react';

/* ═══════════════════════════════════════════════════
   ANIMATED COMIC SCHOOL ILLUSTRATIONS
   Hand-drawn, bouncy, school/tuition vibe SVGs
   ═══════════════════════════════════════════════════ */

// ─── Floating Pencil ────────────────────────────────
export const PencilSVG = ({ className = '', size = 80 }) => (
  <svg className={`animate-pencil ${className}`} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-45, 50, 50)">
      {/* Pencil body */}
      <rect x="30" y="20" width="14" height="55" rx="2" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="2.5"/>
      {/* Pencil stripe */}
      <rect x="30" y="35" width="14" height="8" fill="#ffaa00" stroke="#0e0f0c" strokeWidth="1.5"/>
      {/* Pencil tip */}
      <polygon points="30,75 44,75 37,90" fill="#f5c49c" stroke="#0e0f0c" strokeWidth="2.5"/>
      <polygon points="34,82 40,82 37,90" fill="#0e0f0c"/>
      {/* Eraser */}
      <rect x="30" y="16" width="14" height="8" rx="2" fill="#ff9999" stroke="#0e0f0c" strokeWidth="2.5"/>
      {/* Metal band */}
      <rect x="29" y="22" width="16" height="4" fill="#c0c0c0" stroke="#0e0f0c" strokeWidth="1.5"/>
    </g>
  </svg>
);

// ─── Open Book ──────────────────────────────────────
export const BookSVG = ({ className = '', size = 90 }) => (
  <svg className={`animate-float ${className}`} width={size} height={size} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left page */}
    <path d="M60 25 L60 85 Q40 80 15 85 L15 25 Q40 20 60 25Z" fill="#fff" stroke="#0e0f0c" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Right page */}
    <path d="M60 25 L60 85 Q80 80 105 85 L105 25 Q80 20 60 25Z" fill="#f9faf6" stroke="#0e0f0c" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Lines on left page */}
    <line x1="25" y1="38" x2="52" y2="36" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="25" y1="48" x2="52" y2="46" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="25" y1="58" x2="52" y2="56" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="25" y1="68" x2="48" y2="66" stroke="#e8ebe6" strokeWidth="1.5"/>
    {/* Lines on right page */}
    <line x1="68" y1="36" x2="95" y2="38" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="68" y1="46" x2="95" y2="48" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="68" y1="56" x2="95" y2="58" stroke="#e8ebe6" strokeWidth="1.5"/>
    {/* Bookmark */}
    <path d="M90 20 L90 40 L95 35 L100 40 L100 20Z" fill="#d03238" stroke="#0e0f0c" strokeWidth="1.5"/>
    {/* Spine shadow */}
    <line x1="60" y1="25" x2="60" y2="85" stroke="#0e0f0c" strokeWidth="2.5"/>
  </svg>
);

// ─── Graduation Cap ─────────────────────────────────
export const GradCapSVG = ({ className = '', size = 80 }) => (
  <svg className={`animate-bounce-gentle ${className}`} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cap base - diamond shape */}
    <polygon points="50,25 95,45 50,60 5,45" fill="#0e0f0c" stroke="#0e0f0c" strokeWidth="2"/>
    {/* Cap top */}
    <polygon points="50,20 95,40 50,55 5,40" fill="#1a1a1a" stroke="#0e0f0c" strokeWidth="2"/>
    {/* Tassel string */}
    <line x1="50" y1="40" x2="50" y2="55" stroke="#ffd11a" strokeWidth="2"/>
    <line x1="50" y1="55" x2="75" y2="70" stroke="#ffd11a" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Tassel end */}
    <circle cx="75" cy="72" r="4" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="1.5"/>
    <line x1="73" y1="76" x2="73" y2="85" stroke="#ffd11a" strokeWidth="1.5"/>
    <line x1="75" y1="76" x2="75" y2="87" stroke="#ffd11a" strokeWidth="1.5"/>
    <line x1="77" y1="76" x2="77" y2="84" stroke="#ffd11a" strokeWidth="1.5"/>
    {/* Button on top */}
    <circle cx="50" cy="38" r="3" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="1.5"/>
  </svg>
);

// ─── School Backpack ────────────────────────────────
export const BackpackSVG = ({ className = '', size = 80 }) => (
  <svg className={`animate-wiggle ${className}`} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main body */}
    <rect x="25" y="30" width="50" height="55" rx="12" fill="#9fe870" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Top flap */}
    <path d="M25 45 Q25 28 50 25 Q75 28 75 45" fill="#7dd354" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Front pocket */}
    <rect x="32" y="55" width="36" height="22" rx="8" fill="#7dd354" stroke="#0e0f0c" strokeWidth="2"/>
    {/* Pocket zip */}
    <line x1="42" y1="66" x2="58" y2="66" stroke="#0e0f0c" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="58" cy="66" r="2.5" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="1"/>
    {/* Straps */}
    <path d="M30 35 Q20 35 18 50 L18 70" stroke="#0e0f0c" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M70 35 Q80 35 82 50 L82 70" stroke="#0e0f0c" strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Handle */}
    <path d="M42 25 Q50 18 58 25" stroke="#0e0f0c" strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);

// ─── Light Bulb (Ideas) ─────────────────────────────
export const LightbulbSVG = ({ className = '', size = 70 }) => (
  <svg className={`animate-float ${className}`} width={size} height={size} viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bulb glass */}
    <path d="M40 10 Q65 10 65 40 Q65 55 52 62 L52 72 L28 72 L28 62 Q15 55 15 40 Q15 10 40 10Z" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Inner glow */}
    <path d="M40 18 Q55 18 55 40 Q55 50 47 55 L33 55 Q25 50 25 40 Q25 18 40 18Z" fill="#ffec80" opacity="0.6"/>
    {/* Filament */}
    <path d="M35 45 Q38 35 40 45 Q42 35 45 45" stroke="#0e0f0c" strokeWidth="1.5" fill="none"/>
    {/* Base rings */}
    <rect x="30" y="72" width="20" height="5" rx="1" fill="#c0c0c0" stroke="#0e0f0c" strokeWidth="1.5"/>
    <rect x="31" y="77" width="18" height="4" rx="1" fill="#a0a0a0" stroke="#0e0f0c" strokeWidth="1.5"/>
    <rect x="33" y="81" width="14" height="4" rx="2" fill="#808080" stroke="#0e0f0c" strokeWidth="1.5"/>
    {/* Sparkle rays */}
    <line x1="40" y1="2" x2="40" y2="7" stroke="#ffd11a" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
    </line>
    <line x1="65" y1="15" x2="70" y2="12" stroke="#ffd11a" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
    </line>
    <line x1="15" y1="15" x2="10" y2="12" stroke="#ffd11a" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
    </line>
    <line x1="5" y1="40" x2="10" y2="40" stroke="#ffd11a" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.9s" repeatCount="indefinite"/>
    </line>
    <line x1="70" y1="40" x2="75" y2="40" stroke="#ffd11a" strokeWidth="2" strokeLinecap="round" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="1.2s" repeatCount="indefinite"/>
    </line>
  </svg>
);

// ─── Ruler ──────────────────────────────────────────
export const RulerSVG = ({ className = '', size = 80 }) => (
  <svg className={`animate-float-reverse ${className}`} width={size} height={size*0.4} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="110" height="30" rx="4" fill="#ffc091" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Ruler marks */}
    {[15, 25, 35, 45, 55, 65, 75, 85, 95, 105].map((x, i) => (
      <line key={i} x1={x} y1="5" x2={x} y2={i % 2 === 0 ? "20" : "15"} stroke="#0e0f0c" strokeWidth={i % 2 === 0 ? "1.5" : "1"} />
    ))}
    {/* Numbers */}
    <text x="15" y="30" fontSize="7" fill="#0e0f0c" fontFamily="Inter" fontWeight="700">1</text>
    <text x="35" y="30" fontSize="7" fill="#0e0f0c" fontFamily="Inter" fontWeight="700">2</text>
    <text x="55" y="30" fontSize="7" fill="#0e0f0c" fontFamily="Inter" fontWeight="700">3</text>
    <text x="75" y="30" fontSize="7" fill="#0e0f0c" fontFamily="Inter" fontWeight="700">4</text>
    <text x="95" y="30" fontSize="7" fill="#0e0f0c" fontFamily="Inter" fontWeight="700">5</text>
  </svg>
);

// ─── Star / Award ───────────────────────────────────
export const StarSVG = ({ className = '', size = 60, color = '#ffd11a' }) => (
  <svg className={`animate-wiggle ${className}`} width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="40,8 48,30 72,30 52,46 60,68 40,54 20,68 28,46 8,30 32,30"
      fill={color}
      stroke="#0e0f0c"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Star face - happy */}
    <circle cx="33" cy="34" r="2" fill="#0e0f0c"/>
    <circle cx="47" cy="34" r="2" fill="#0e0f0c"/>
    <path d="M35 42 Q40 48 45 42" stroke="#0e0f0c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

// ─── Calculator ─────────────────────────────────────
export const CalculatorSVG = ({ className = '', size = 70 }) => (
  <svg className={`animate-float-reverse ${className}`} width={size} height={size*1.2} viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <rect x="8" y="5" width="54" height="80" rx="8" fill="#e2f6d5" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Screen */}
    <rect x="14" y="12" width="42" height="18" rx="4" fill="#163300" stroke="#0e0f0c" strokeWidth="1.5"/>
    <text x="46" y="26" fontSize="12" fill="#9fe870" fontFamily="Inter" fontWeight="700" textAnchor="end">42</text>
    {/* Buttons */}
    {[0,1,2,3].map(row =>
      [0,1,2].map(col => (
        <rect
          key={`${row}-${col}`}
          x={16 + col * 14}
          y={36 + row * 12}
          width="10"
          height="8"
          rx="2"
          fill={col === 2 && row < 2 ? '#9fe870' : '#fff'}
          stroke="#0e0f0c"
          strokeWidth="1.5"
        />
      ))
    )}
  </svg>
);

// ─── ABC Block Letters ──────────────────────────────
export const ABCBlockSVG = ({ className = '', size = 100 }) => (
  <svg className={`animate-bounce-gentle ${className}`} width={size} height={size*0.6} viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Block A */}
    <rect x="5" y="15" width="40" height="40" rx="6" fill="#9fe870" stroke="#0e0f0c" strokeWidth="2.5" transform="rotate(-5, 25, 35)"/>
    <text x="25" y="42" fontSize="24" fill="#163300" fontFamily="Lilita One" fontWeight="400" textAnchor="middle" transform="rotate(-5, 25, 35)">A</text>
    {/* Block B */}
    <rect x="55" y="10" width="40" height="40" rx="6" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="2.5" transform="rotate(3, 75, 30)"/>
    <text x="75" y="37" fontSize="24" fill="#0e0f0c" fontFamily="Lilita One" fontWeight="400" textAnchor="middle" transform="rotate(3, 75, 30)">B</text>
    {/* Block C */}
    <rect x="105" y="18" width="40" height="40" rx="6" fill="#ffc091" stroke="#0e0f0c" strokeWidth="2.5" transform="rotate(-2, 125, 38)"/>
    <text x="125" y="45" fontSize="24" fill="#0e0f0c" fontFamily="Lilita One" fontWeight="400" textAnchor="middle" transform="rotate(-2, 125, 38)">C</text>
  </svg>
);

// ─── Notebook / Clipboard ───────────────────────────
export const ClipboardSVG = ({ className = '', size = 70 }) => (
  <svg className={`animate-float ${className}`} width={size} height={size*1.3} viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Board */}
    <rect x="8" y="15" width="54" height="70" rx="6" fill="#ffc091" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Paper */}
    <rect x="14" y="22" width="42" height="56" rx="3" fill="#fff" stroke="#0e0f0c" strokeWidth="1.5"/>
    {/* Clip */}
    <rect x="25" y="8" width="20" height="14" rx="4" fill="#c0c0c0" stroke="#0e0f0c" strokeWidth="2"/>
    {/* Lines */}
    <line x1="20" y1="35" x2="50" y2="35" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="20" y1="43" x2="50" y2="43" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="20" y1="51" x2="45" y2="51" stroke="#e8ebe6" strokeWidth="1.5"/>
    <line x1="20" y1="59" x2="48" y2="59" stroke="#e8ebe6" strokeWidth="1.5"/>
    {/* Checkmarks */}
    <path d="M22 34 L25 37 L30 32" stroke="#9fe870" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M22 42 L25 45 L30 40" stroke="#9fe870" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M22 50 L25 53 L30 48" stroke="#d03238" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

// ─── Globe / World ──────────────────────────────────
export const GlobeSVG = ({ className = '', size = 70 }) => (
  <svg className={`animate-float-reverse ${className}`} width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="38" r="28" fill="#9fe870" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Latitude lines */}
    <ellipse cx="40" cy="38" rx="28" ry="10" fill="none" stroke="#163300" strokeWidth="1" opacity="0.3"/>
    <ellipse cx="40" cy="28" rx="22" ry="6" fill="none" stroke="#163300" strokeWidth="1" opacity="0.3"/>
    <ellipse cx="40" cy="48" rx="22" ry="6" fill="none" stroke="#163300" strokeWidth="1" opacity="0.3"/>
    {/* Longitude line */}
    <ellipse cx="40" cy="38" rx="10" ry="28" fill="none" stroke="#163300" strokeWidth="1" opacity="0.3"/>
    {/* Land masses (simplified) */}
    <path d="M30 25 Q35 22 40 25 Q42 30 38 32 Q33 30 30 25Z" fill="#163300" opacity="0.2"/>
    <path d="M48 35 Q55 33 56 40 Q52 45 48 42Z" fill="#163300" opacity="0.2"/>
    {/* Stand */}
    <path d="M28 68 Q40 60 52 68" stroke="#0e0f0c" strokeWidth="2.5" fill="none"/>
    <line x1="40" y1="66" x2="40" y2="58" stroke="#0e0f0c" strokeWidth="2.5"/>
  </svg>
);

// ─── Doodle Arrows ──────────────────────────────────
export const DoodleArrowSVG = ({ className = '', direction = 'right', size = 60 }) => {
  const rotation = { right: 0, down: 90, left: 180, up: 270 }[direction] || 0;
  return (
    <svg className={className} width={size} height={size * 0.5} viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M5 18 Q20 8 40 15 Q55 22 70 12" stroke="#0e0f0c" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M62 8 L72 12 L64 18" stroke="#0e0f0c" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ─── Sparkle Stars (decorative) ─────────────────────
export const SparklesSVG = ({ className = '', size = 40 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M20 5 L22 15 L30 17 L22 19 L20 30 L18 19 L10 17 L18 15Z" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="1">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
      </path>
    </g>
    <g>
      <path d="M8 3 L9 7 L13 8 L9 9 L8 14 L7 9 L3 8 L7 7Z" fill="#9fe870" stroke="#0e0f0c" strokeWidth="0.5">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.7s" repeatCount="indefinite"/>
      </path>
    </g>
    <g>
      <path d="M33 28 L34 32 L38 33 L34 34 L33 38 L32 34 L28 33 L32 32Z" fill="#ffc091" stroke="#0e0f0c" strokeWidth="0.5">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="1.3s" repeatCount="indefinite"/>
      </path>
    </g>
  </svg>
);

// ─── School Bell ────────────────────────────────────
export const SchoolBellSVG = ({ className = '', size = 60 }) => (
  <svg className={`animate-wiggle ${className}`} width={size} height={size} viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bell body */}
    <path d="M10 45 Q10 20 30 15 Q50 20 50 45 L10 45Z" fill="#ffd11a" stroke="#0e0f0c" strokeWidth="2.5"/>
    {/* Bell rim */}
    <ellipse cx="30" cy="45" rx="22" ry="5" fill="#ffaa00" stroke="#0e0f0c" strokeWidth="2"/>
    {/* Clapper */}
    <circle cx="30" cy="52" r="4" fill="#0e0f0c"/>
    {/* Handle */}
    <path d="M25 15 Q30 8 35 15" stroke="#0e0f0c" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Sound waves */}
    <path d="M52 30 Q58 28 56 35" stroke="#0e0f0c" strokeWidth="1.5" fill="none" opacity="0.4">
      <animate attributeName="opacity" values="0;0.6;0" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M55 25 Q63 22 60 33" stroke="#0e0f0c" strokeWidth="1.5" fill="none" opacity="0.3">
      <animate attributeName="opacity" values="0;0.4;0" dur="1s" begin="0.3s" repeatCount="indefinite"/>
    </path>
  </svg>
);

// ─── Chalkboard ─────────────────────────────────────
export const ChalkboardSVG = ({ className = '', size = 100 }) => (
  <svg className={`animate-float ${className}`} width={size} height={size*0.7} viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Frame */}
    <rect x="5" y="5" width="130" height="75" rx="4" fill="#8B6914" stroke="#0e0f0c" strokeWidth="2"/>
    {/* Board */}
    <rect x="12" y="12" width="116" height="61" rx="2" fill="#2d5016"/>
    {/* Chalk writing */}
    <text x="30" y="38" fontSize="14" fill="#fff" fontFamily="Caveat" fontWeight="600" opacity="0.9">E = mc²</text>
    <text x="70" y="55" fontSize="10" fill="#ffd11a" fontFamily="Caveat" fontWeight="600" opacity="0.8">Hello!</text>
    {/* Chalk tray */}
    <rect x="20" y="80" width="100" height="6" rx="2" fill="#8B6914" stroke="#0e0f0c" strokeWidth="1.5"/>
    {/* Chalk piece */}
    <rect x="40" y="78" width="16" height="4" rx="1" fill="#fff" stroke="#0e0f0c" strokeWidth="0.5"/>
    {/* Eraser */}
    <rect x="80" y="77" width="14" height="6" rx="1" fill="#c0c0c0" stroke="#0e0f0c" strokeWidth="0.5"/>
    {/* Legs */}
    <line x1="25" y1="86" x2="20" y2="98" stroke="#0e0f0c" strokeWidth="2.5"/>
    <line x1="115" y1="86" x2="120" y2="98" stroke="#0e0f0c" strokeWidth="2.5"/>
  </svg>
);

export default {
  PencilSVG,
  BookSVG,
  GradCapSVG,
  BackpackSVG,
  LightbulbSVG,
  RulerSVG,
  StarSVG,
  CalculatorSVG,
  ABCBlockSVG,
  ClipboardSVG,
  GlobeSVG,
  DoodleArrowSVG,
  SparklesSVG,
  SchoolBellSVG,
  ChalkboardSVG,
};
